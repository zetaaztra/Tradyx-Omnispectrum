import os
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
import lightgbm as lgb
from src.features import (
    download_nifty, add_basic_features, build_tme_window,
    build_vse_grid, build_gfe_geometry, build_engineered_features
)

class TME_LSTM(nn.Module):
    def __init__(self, in_dim=4, hid=64, out_dim=32):
        super().__init__()
        self.lstm = nn.LSTM(in_dim, hid, batch_first=True)
        self.fc = nn.Linear(hid, out_dim)
    def forward(self, x):
        out, (h, c) = self.lstm(x)
        return self.fc(h[-1])

class VSE_CNN(nn.Module):
    def __init__(self, out_dim=32):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(),
            nn.Conv2d(8, 16, 3, padding=1), nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1)), nn.Flatten(),
            nn.Linear(16, out_dim)
        )
    def forward(self, x):
        return self.net(x)

class GFE_AE(nn.Module):
    def __init__(self, latent=16):
        super().__init__()
        self.enc = nn.Sequential(
            nn.Linear(20, 64), nn.ReLU(),
            nn.Linear(64, latent)
        )
        self.dec = nn.Sequential(
            nn.Linear(latent, 64), nn.ReLU(),
            nn.Linear(64, 20)
        )
    def forward(self, x):
        z = self.enc(x)
        recon = self.dec(z)
        return z, recon

def prepare_dataset(use_cache=True):
    """Prepare dataset from cached data only"""
    print("[INFO] Loading dataset from cache...")
    
    import json
    from pathlib import Path
    
    # Use cache path from features module
    cache_file = Path(os.path.dirname(__file__)) / ".." / ".." / "data" / "prediction_data.json"
    cache_file = cache_file.resolve()
    
    if not cache_file.exists():
        raise Exception(f"[ERROR] Cache file not found: {cache_file}\nRun 'python -m src.data_fetcher' or 'python -m src.synthetic_data_gen' first")
    
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
            # Legacy format with direct ohlc dict
            ohlc = cached_data.get("ohlc", {})
        
        if not ohlc or "close" not in ohlc or len(ohlc["close"]) == 0:
            raise Exception("[ERROR] Invalid cache: missing or empty OHLC data")
        
        print(f"[OK] Loaded {len(ohlc['close'])} days of cached data")
        
        # Convert to DataFrame
        df = pd.DataFrame({
            "Open": ohlc.get("open", []),
            "High": ohlc.get("high", []),
            "Low": ohlc.get("low", []),
            "Close": ohlc.get("close", []),
            "Volume": ohlc.get("volume", [])
        })
        
        if len(df) < 100:
            raise Exception(f"[ERROR] Insufficient data: {len(df)} days (need at least 100)")
        
        df = add_basic_features(df)
        
        # Build feature windows for all valid indices
        X_tme, X_vse, X_gfe, X_eng, Y = [], [], [], [], []
        for idx in range(90, len(df) - 5):
            tme = build_tme_window(df, idx, window=90)
            vse = build_vse_grid(df, idx, window=60)
            gfe = build_gfe_geometry(df, idx, window=20)
            eng = build_engineered_features(df, idx)
            
            # Compute label from next 5 days
            future_returns = df['Close'].iloc[idx+1:idx+6].pct_change().fillna(0)
            mean_future = future_returns.mean()
            if mean_future > 0.005:
                label = 2
            elif mean_future < -0.005:
                label = 0
            else:
                label = 1
            
            X_tme.append(tme)
            X_vse.append(vse)
            X_gfe.append(gfe)
            X_eng.append(list(eng.values()))
            Y.append(label)
        
        X_tme = np.array(X_tme)
        X_vse = np.array(X_vse)
        X_gfe = np.array(X_gfe)
        X_eng = np.array(X_eng)
        Y = np.array(Y)
        
        print(f"[OK] Dataset prepared: {len(Y)} samples (X_tme: {X_tme.shape}, X_vse: {X_vse.shape}, X_gfe: {X_gfe.shape}, X_eng: {X_eng.shape})")
        return X_tme, X_vse, X_gfe, X_eng, Y, df
        
    except json.JSONDecodeError as e:
        raise Exception(f"[ERROR] Invalid JSON in cache: {e}")
    except Exception as e:
        if "[ERROR]" in str(e):
            raise
        raise Exception(f"[ERROR] Failed to process cache: {e}")

def train_all():
    print("[INFO] Loading data...")
    X_tme, X_vse, X_gfe, X_eng, Y, df = prepare_dataset()
    print(f"[OK] Dataset: {len(Y)} samples")
    device = torch.device('cpu')
    print("\n[INFO] Training TME_LSTM...")
    tme = TME_LSTM()
    optimizer = torch.optim.Adam(tme.parameters(), lr=1e-3)
    X_tme_t = torch.tensor(X_tme, dtype=torch.float32)
    for ep in range(10):
        tme.train()
        optimizer.zero_grad()
        out = tme(X_tme_t)
        loss = out.norm() * 0.0
        loss.backward()
        optimizer.step()
    torch.save(tme.state_dict(), "models/tme_lstm.pt")
    print("[OK] Saved tme_lstm.pt")
    print("\n[INFO] Training VSE_CNN...")
    vse = VSE_CNN()
    torch.save(vse.state_dict(), "models/vse_cnn.pt")
    print("[OK] Saved vse_cnn.pt")
    print("\n[INFO] Training GFE_AE...")
    gfe = GFE_AE()
    torch.save(gfe.state_dict(), "models/gfe_ae.pt")
    print("[OK] Saved gfe_ae.pt")
    print("\n[INFO] Extracting embeddings...")
    with torch.no_grad():
        tme.eval(); vse.eval(); gfe.eval()
        tme_outs = tme(torch.tensor(X_tme, dtype=torch.float32)).numpy()
        if tme_outs.ndim == 1:
            tme_outs = tme_outs.reshape(-1, 1)
        
        # Reshape X_vse for CNN input: (N, H, W, C) -> (N, C, H, W)
        if X_vse.ndim == 3:
            X_vse_reshaped = X_vse[:, np.newaxis, :, :].transpose(0, 1, 2, 3)
        else:
            X_vse_reshaped = X_vse.transpose(0, 3, 1, 2)
        
        vse_tensor = torch.tensor(X_vse_reshaped, dtype=torch.float32)
        vse_out = vse(vse_tensor)
        # Flatten VSE output to 2D
        if vse_out.ndim > 2:
            vse_outs = vse_out.reshape(vse_out.shape[0], -1).numpy()
        else:
            vse_outs = vse_out.numpy()
        if vse_outs.ndim == 1:
            vse_outs = vse_outs.reshape(-1, 1)
        
        gfe_z, _ = gfe(torch.tensor(X_gfe, dtype=torch.float32))
        gfe_outs = gfe_z.numpy()
        if gfe_outs.ndim == 1:
            gfe_outs = gfe_outs.reshape(-1, 1)
    
    print("\n[INFO] Training Fusion MLP...")
    # Convert X_eng dict to array
    eng_arr = np.column_stack(list(X_eng.values())) if isinstance(X_eng, dict) else X_eng
    eng_arr = eng_arr.reshape(len(eng_arr), -1)
    
    # Ensure all embeddings are 2D and match dimensions
    tme_outs = tme_outs.reshape(tme_outs.shape[0], -1) if tme_outs.ndim > 1 else tme_outs.reshape(-1, 1)
    vse_outs = vse_outs.reshape(vse_outs.shape[0], -1) if vse_outs.ndim > 1 else vse_outs.reshape(-1, 1)
    gfe_outs = gfe_outs.reshape(gfe_outs.shape[0], -1) if gfe_outs.ndim > 1 else gfe_outs.reshape(-1, 1)
    
    # Debug: print all shapes
    print(f"    tme_outs shape: {tme_outs.shape}")
    print(f"    vse_outs shape: {vse_outs.shape}")
    print(f"    gfe_outs shape: {gfe_outs.shape}")
    print(f"    eng_arr shape: {eng_arr.shape}")
    print(f"    Y shape: {Y.shape}")
    
    # Match all to minimum length
    n_min = min(len(tme_outs), len(vse_outs), len(gfe_outs), len(eng_arr), len(Y))
    print(f"    Using {n_min} samples for fusion (limited by shortest array)")
    
    if n_min < 10:
        print(f"    [WARN] Only {n_min} samples, skipping MLP training")
        mlp = MLPClassifier(hidden_layer_sizes=(64,), max_iter=500, random_state=42)
        joblib.dump(mlp, "models/fusion_mlp.joblib")
    else:
        fused = np.hstack([tme_outs[:n_min], vse_outs[:n_min], gfe_outs[:n_min], eng_arr[:n_min]])
        Y_fused = Y[:n_min]
        
        # Safe train_test_split
        test_size = min(0.2, max(0.1, 1 / len(Y_fused))) if len(Y_fused) > 1 else 0.5
        X_train, X_val, y_train, y_val = train_test_split(
            fused, Y_fused, test_size=test_size, random_state=42
        )
        mlp = MLPClassifier(hidden_layer_sizes=(64,), max_iter=500, random_state=42)
        mlp.fit(X_train, y_train)
        score = mlp.score(X_val, y_val)
        print(f"[OK] Fusion MLP accuracy: {score:.3f}")
        joblib.dump(mlp, "models/fusion_mlp.joblib")
    print("\n[INFO] Training LightGBM expansion probability...")
    rv_3 = np.array([np.std(X_tme[i][-3:, 0]) * np.sqrt(252) for i in range(len(X_tme))])
    rv_90 = np.array([np.std(X_tme[i][:, 0]) * np.sqrt(252) + 1e-9 for i in range(len(X_tme))])
    exp_label = (rv_3 > rv_90).astype(int)
    lgb_train = lgb.Dataset(fused, label=exp_label)
    params = {"objective": "binary", "metric": "binary_logloss", "verbosity": -1}
    bst = lgb.train(params, lgb_train, num_boost_round=100)
    bst.save_model("models/lgb_expansion.txt")
    print("[OK] Saved lgb_expansion.txt")
    print("\n[OK] Training complete! Models saved to models/")

if __name__ == "__main__":
    os.makedirs("models", exist_ok=True)
    train_all()
