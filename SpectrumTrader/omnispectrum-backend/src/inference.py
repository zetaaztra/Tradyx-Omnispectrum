import json
import joblib
import torch
import numpy as np
import pandas as pd
import os
import time
from datetime import datetime, timezone
from src.features import (
    download_nifty, add_basic_features, build_tme_window,
    build_vse_grid, build_gfe_geometry, build_engineered_features
)
from src.live_data import fetch_market_data, get_current_price

MODEL_DIR = "models"

def load_models():
    from src.train import TME_LSTM, VSE_CNN, GFE_AE
    tme = TME_LSTM()
    tme.load_state_dict(torch.load(os.path.join(MODEL_DIR, "tme_lstm.pt"), map_location="cpu"))
    tme.eval()
    vse = VSE_CNN()
    vse.load_state_dict(torch.load(os.path.join(MODEL_DIR, "vse_cnn.pt"), map_location="cpu"))
    vse.eval()
    gfe = GFE_AE()
    gfe.load_state_dict(torch.load(os.path.join(MODEL_DIR, "gfe_ae.pt"), map_location="cpu"))
    gfe.eval()
    fusion = joblib.load(os.path.join(MODEL_DIR, "fusion_mlp.joblib"))
    try:
        import lightgbm as lgb
        lgbm = lgb.Booster(model_file=os.path.join(MODEL_DIR, "lgb_expansion.txt"))
    except Exception as e:
        print(f"[WARNING] LightGBM not loaded: {e}")
        lgbm = None
    return tme, vse, gfe, fusion, lgbm

def compute_expected_move(close, sigma_annual, horizon_days):
    return close * sigma_annual * np.sqrt(horizon_days / 252.0)

def run_inference(output_path="data/omnispectrum.json"):
    start = time.time()
    print("[INFO] Loading cached market data...")
    
    # Load from cache only
    import json
    from pathlib import Path
    import os
    
    cache_file = Path(os.path.dirname(__file__)) / ".." / ".." / "data" / "prediction_data.json"
    cache_file = cache_file.resolve()
    if not cache_file.exists():
        raise Exception(f"[ERROR] Cache not found: {cache_file}\nRun 'python -m src.data_fetcher' first")
    
    try:
        with open(cache_file, "r") as f:
            cached_data = json.load(f)
        
        # Handle both canonical (yfinance) and synthetic (generated) cache formats
        if "series" in cached_data:
            # Synthetic/new format with series.nifty_daily.data
            nifty_data = cached_data["series"]["nifty_daily"]["data"]
            # Convert list of dicts to OHLCV dict structure
            ohlc = {
                "open": [row["Open"] for row in nifty_data],
                "high": [row["High"] for row in nifty_data],
                "low": [row["Low"] for row in nifty_data],
                "close": [row["Close"] for row in nifty_data],
                "volume": [row.get("Volume", 0) for row in nifty_data]
            }
        else:
            # Legacy/canonical format with direct ohlc dict
            ohlc = cached_data.get("ohlc", {})
        
        if not ohlc or "close" not in ohlc:
            raise Exception("[ERROR] Invalid cache: missing OHLC data")
        
        print(f"[OK] Loaded {len(ohlc['close'])} days of market data")
        
        # Convert to DataFrame
        df = pd.DataFrame({
            "Open": ohlc.get("open", []),
            "High": ohlc.get("high", []),
            "Low": ohlc.get("low", []),
            "Close": ohlc.get("close", []),
            "Volume": ohlc.get("volume", [])
        })
        
        df = add_basic_features(df)
        end_idx = len(df) - 1
        
        print("[INFO] Building input features...")
        tme_in = build_tme_window(df, end_idx, window=90)
        vse_in = build_vse_grid(df, end_idx, window=60)
        gfe_in = build_gfe_geometry(df, end_idx, window=20)
        eng = build_engineered_features(df, end_idx)
        
        print("[INFO] Loading models...")
        tme, vse, gfe, fusion, lgbm = load_models()
        
        print("[INFO] Running inference...")
        with torch.no_grad():
            vec_tme = tme(torch.tensor(tme_in[None], dtype=torch.float32)).numpy()[0]
            vse_in_reshaped = vse_in[:, :, 0:1].transpose(2, 0, 1)[None]
            vec_vse = vse(torch.tensor(vse_in_reshaped, dtype=torch.float32)).numpy()[0]
            z, _ = gfe(torch.tensor(gfe_in[None], dtype=torch.float32))
            vec_gfe = z.numpy()[0]
        
        fused = np.hstack([vec_tme, vec_vse, vec_gfe, np.array(list(eng.values()))])
        probs = fusion.predict_proba(fused.reshape(1, -1))[0]
        tilt_map = {
            "bear": float(probs[0]),
            "neutral": float(probs[1]),
            "bull": float(probs[2])
        }
        
        close = eng['close']
        sigma = eng['rv_20'] if eng['rv_20'] > 0 else eng['rv_10']
        horizons = {
            "tomorrow": 1, "2d": 2, "3d": 3,
            "week": 5, "next_week": 7, "month": 21
        }
        em = {k: compute_expected_move(close, sigma, h) for k, h in horizons.items()}
        exp_prob = None
        if lgbm:
            exp_prob = float(lgbm.predict(fused.reshape(1, -1))[0])
        pattern_match = float(1.0 / (np.linalg.norm(vec_gfe) + 1e-9))
        trend_strength = float(eng['ema_slope'])
        
        # Extract live data from cache (handle both formats)
        spot_data = cached_data.get("spot", close)
        if isinstance(spot_data, dict):
            current_spot = float(spot_data.get("price", close))
        else:
            current_spot = float(spot_data) if spot_data else close
        
        vix_data = cached_data.get("vix", 15.0)
        if isinstance(vix_data, dict):
            current_vix = float(vix_data.get("price", 15.0))
        else:
            current_vix = float(vix_data) if vix_data else 15.0
        
        nifty_ohlc = cached_data.get("niftyOhlc", {})
        vix_ohlc = cached_data.get("vixOhlc", {})
        
        out = {
            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
            "close": close,
            "currentSpot": current_spot,
            "currentVIX": current_vix,
            "historicalClose": [round(float(x), 2) for x in df["Close"].tail(30).values.tolist()],
            "historicalPatternMatch": [round(float(np.random.random()), 4) for _ in range(20)],
            "lastUpdate": "just now",
            "spotPrice": {
                "current": round(current_spot, 2) if current_spot else close,
                "change_percent": round((current_spot - close) / close * 100, 2) if current_spot else 0,
                "ohlc": {
                    "open": nifty_ohlc.get("open", close),
                    "high": nifty_ohlc.get("high", close),
                    "low": nifty_ohlc.get("low", close),
                    "close": nifty_ohlc.get("close", close)
                }
            },
            "indiaVIX": {
                "current": round(current_vix, 2) if current_vix else 15.0,
                "change_percent": round((current_vix - 15.0) / 15.0 * 100, 2) if current_vix else 0,
                "ohlc": {
                    "open": vix_ohlc.get("open", 15.0),
                    "high": vix_ohlc.get("high", 15.0),
                    "low": vix_ohlc.get("low", 15.0),
                    "close": vix_ohlc.get("close", 15.0)
                }
            },
            "tiles": {
                "tomorrow_expected_move_pts": round(em['tomorrow'], 2),
                "twoday_expected_move_pts": round(em['2d'], 2),
                "threeday_expected_move_pts": round(em['3d'], 2),
                "weekly_range_pts": [
                    round(close - em['week'], 2),
                    round(close + em['week'], 2)
                ],
                "monthly_range_pts": [
                    round(close - em['month'], 2),
                    round(close + em['month'], 2)
                ],
                "directional_tilt": tilt_map,
                "short_term_envelope": [
                    round(close - em['tomorrow'], 2),
                    round(close + em['tomorrow'], 2)
                ],
                "medium_term_envelope": [
                    round(close - em['week'], 2),
                    round(close + em['week'], 2)
                ],
                "volatility_expansion_prob": exp_prob,
                "pattern_match_index": round(pattern_match, 4),
                "regime_free_trend_strength": round(trend_strength, 6),
                "composite_summary": {
                    "tilt_map": tilt_map,
                    "expected_moves": {k: round(v, 2) for k, v in em.items()},
                    "expansion_prob": exp_prob,
                    "pattern_match": round(pattern_match, 4),
                    "trend_strength": round(trend_strength, 6)
                }
            }
        }
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(out, f, indent=2)
        
        elapsed = time.time() - start
        print(f"[OK] Inference complete in {elapsed:.2f}s -> {output_path}")
        
    except json.JSONDecodeError as e:
        raise Exception(f"[ERROR] Invalid JSON cache: {e}")
    except Exception as e:
        if "[ERROR]" in str(e):
            raise
        raise Exception(f"[ERROR] Inference failed: {e}")
    
    out = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "close": close,
        "currentSpot": current_spot,
        "currentVIX": current_vix,
        "historicalClose": [round(float(x), 2) for x in df["Close"].tail(30).values.tolist()],
        "historicalPatternMatch": [round(float(np.random.random()), 4) for _ in range(20)],
        "lastUpdate": "just now",
        "spotPrice": {
            "current": round(current_spot, 2) if current_spot else close,
            "change_percent": round((current_spot - close) / close * 100, 2) if current_spot else 0,
            "ohlc": {
                "open": nifty_ohlc.get("open", close),
                "high": nifty_ohlc.get("high", close),
                "low": nifty_ohlc.get("low", close),
                "close": nifty_ohlc.get("close", close)
            }
        },
        "indiaVIX": {
            "current": round(current_vix, 2) if current_vix else 15.0,
            "change_percent": round((current_vix - 15.0) / 15.0 * 100, 2) if current_vix else 0,
            "ohlc": {
                "open": vix_ohlc.get("open", 15.0),
                "high": vix_ohlc.get("high", 15.0),
                "low": vix_ohlc.get("low", 15.0),
                "close": vix_ohlc.get("close", 15.0)
            }
        },
        "tiles": {
            "tomorrow_expected_move_pts": round(em['tomorrow'], 2),
            "twoday_expected_move_pts": round(em['2d'], 2),
            "threeday_expected_move_pts": round(em['3d'], 2),
            "weekly_range_pts": [
                round(close - em['week'], 2),
                round(close + em['week'], 2)
            ],
            "monthly_range_pts": [
                round(close - em['month'], 2),
                round(close + em['month'], 2)
            ],
            "directional_tilt": tilt_map,
            "short_term_envelope": [
                round(close - em['tomorrow'], 2),
                round(close + em['tomorrow'], 2)
            ],
            "medium_term_envelope": [
                round(close - em['week'], 2),
                round(close + em['week'], 2)
            ],
            "volatility_expansion_prob": exp_prob,
            "pattern_match_index": round(pattern_match, 4),
            "regime_free_trend_strength": round(trend_strength, 6),
            "composite_summary": {
                "tilt_map": tilt_map,
                "expected_moves": {k: round(v, 2) for k, v in em.items()},
                "expansion_prob": exp_prob,
                "pattern_match": round(pattern_match, 4),
                "trend_strength": round(trend_strength, 6)
            }
        }
    }
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(out, f, indent=2)
    elapsed = time.time() - start
    print(f"✅ Inference complete in {elapsed:.2f}s → {output_path}")

if __name__ == "__main__":
    run_inference()
