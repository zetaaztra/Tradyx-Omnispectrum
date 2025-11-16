"""
Production-grade feature engineering for OmniSpectrum models.
CRITICAL: Loads data ONLY from cache (data/prediction_data.json).
No yfinance downloads. Cache-first, fail-fast pattern.
"""
import json
import os
import pandas as pd
import numpy as np
from scipy.stats import zscore
from pathlib import Path

CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "prediction_data.json")

def load_cached_market_data(cache_file=CACHE_FILE):
    """
    Load market data from validated cache file.
    Raises Exception if cache not found or invalid.
    This enforces live-only operation: users must run data_fetcher first.
    """
    if not os.path.exists(cache_file):
        raise Exception(f"[ERROR] Cache not found: {cache_file}\nRun 'python -m src.data_fetcher' first to fetch live data")
    
    try:
        with open(cache_file, "r") as f:
            payload = json.load(f)
    except json.JSONDecodeError as e:
        raise Exception(f"[ERROR] Invalid JSON in cache: {e}")
    
    ohlc = payload.get("ohlc", {})
    if not ohlc or "close" not in ohlc or len(ohlc.get("close", [])) == 0:
        raise Exception("[ERROR] Cache invalid: missing or empty OHLC data")
    
    # Reconstruct DataFrame from cache
    df = pd.DataFrame({
        "Open": ohlc.get("open", []),
        "High": ohlc.get("high", []),
        "Low": ohlc.get("low", []),
        "Close": ohlc.get("close", []),
        "Volume": ohlc.get("volume", [])
    })
    
    if len(df) < 100:
        raise Exception(f"[ERROR] Insufficient cached data: {len(df)} days (need ≥100)")
    
    print(f"[OK] Loaded {len(df)} days from cache")
    return df

def download_nifty(period="2y", interval="1d"):
    """
    Legacy wrapper now enforces cache-only pattern.
    Calls load_cached_market_data() which raises if no cache present.
    """
    try:
        print(f"[INFO] Loading NIFTY from cache (period={period})...")
        df = load_cached_market_data()
        
        if len(df) < 100:
            raise Exception(f"[ERROR] Insufficient data: {len(df)} days")
        
        print(f"[OK] NIFTY loaded: {len(df)} samples")
        return df
        
    except Exception as e:
        if "[ERROR]" in str(e):
            raise
        raise Exception(f"[ERROR] Failed to load NIFTY: {e}")

def add_basic_features(df):
    """Add technical indicators required by model heads"""
    df = df.copy()
    
    # Return series
    df['Return'] = df['Close'].pct_change().fillna(0)
    
    # Realized Volatility (multiple windows)
    for w in [5, 10, 20, 60]:
        df[f"rv_{w}"] = df['Return'].rolling(w).std() * np.sqrt(252)
    
    # Exponential Moving Averages
    df['ema_8'] = df['Close'].ewm(span=8, adjust=False).mean()
    df['ema_21'] = df['Close'].ewm(span=21, adjust=False).mean()
    df['ema_slope'] = (df['ema_8'] - df['ema_21']) / (df['ema_21'] + 1e-9)
    
    # Range metrics
    df['range'] = (df['High'] - df['Low']) / (df['Close'] + 1e-9)
    df['range_10'] = df['range'].rolling(10).mean()
    
    # Volatility ratio
    df['rv_ratio_10_60'] = df['rv_10'] / (df['rv_60'] + 1e-9)
    
    # Z-score of returns
    df['ret_z_20'] = df['Return'].rolling(20).apply(
        lambda x: (x.iloc[-1] - x.mean()) / (x.std() + 1e-9) if len(x) > 1 else 0
    )
    
    # Remove NaN rows
    df = df.dropna()
    return df

def build_tme_window(df, end_idx, window=90):
    """Build temporal window for LSTM model"""
    start = max(0, end_idx - window + 1)
    mat = df.iloc[start:end_idx+1][['Return', 'rv_10', 'rv_20', 'ema_slope']].values
    
    if len(mat) < window:
        pad = np.zeros((window - len(mat), 4))
        mat = np.vstack([pad, mat])
    
    return mat.astype(np.float32)

def build_vse_grid(df, end_idx, window=60):
    """Build volatility surface grid for CNN model"""
    start = max(0, end_idx - window + 1)
    sub = df.iloc[start:end_idx+1]
    arr = np.vstack([sub['Return'].values, sub['range'].values]).T
    flat = arr.flatten()
    
    if len(flat) < 512:
        flat = np.concatenate([flat, np.zeros(512 - len(flat))])
    else:
        flat = flat[:512]
    
    grid = flat.reshape(8, 8, 8)[:, :, :1]
    return grid.astype(np.float32)

def build_gfe_geometry(df, end_idx, window=20):
    """Build geometric features for autoencoder"""
    start = max(0, end_idx - window + 1)
    sub = df.iloc[start:end_idx+1]
    d = np.diff(sub['Close'].values)
    angles = np.arctan2(d, 1.0)
    
    arr = np.zeros(20, dtype=np.float32)
    n = min(len(angles), 20)
    if n > 0:
        arr[:n] = angles[:n]
    
    return arr

def build_engineered_features(df, end_idx):
    """Build dictionary of scalar engineered features"""
    row = df.iloc[end_idx]
    return {
        "close": float(row['Close']),
        "rv_10": float(row['rv_10']),
        "rv_20": float(row['rv_20']),
        "range_10": float(row['range_10']),
        "ema_slope": float(row['ema_slope']),
        "ret_z_20": float(row['ret_z_20']),
    }

