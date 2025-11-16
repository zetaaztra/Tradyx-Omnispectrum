"""
OmniSpectrum: Canonical Market Data Fetcher
============================================
Fetches 13 market series from yfinance with robust retries, validation, and fail-fast policy.

TICKERS (canonical):
  - NIFTY 50 daily (2-5y): ^NSEI
  - NIFTY intraday (1d, 2d, 3d @ 5m): ^NSEI
  - India VIX daily (2y): ^INDIAVIX
  - Sectors (daily 2-5y): ^NSEBANK, ^CNXIT, ^CNXPHARMA, ^CNXAUTO, ^CNXMETAL, ^CNXFMCG, ^CNXENERGY, NIFTY_FIN_SERVICE.NS

Output: data/prediction_data.json (single canonical cache for train/inference)
Policy: Retries with exponential backoff; fail-fast if any series cannot be fetched
"""
import os
import time
import json
import traceback
from typing import Optional, Dict
import pandas as pd
import yfinance as yf

CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "prediction_data.json")

# CANONICAL TICKER MAP
TICKERS_CONFIG = {
    # Primary index (daily)
    "nifty_daily": {"ticker": "^NSEI", "period": "5y", "interval": "1d", "purpose": "Training history; realized vol, trend, long-term features"},
    
    # Intraday (short-term patterns)
    "nifty_1d_5m": {"ticker": "^NSEI", "period": "1d", "interval": "5m", "purpose": "Today's microstructure (24h candles)"},
    "nifty_2d_5m": {"ticker": "^NSEI", "period": "2d", "interval": "5m", "purpose": "2-day momentum surface, short-term envelope"},
    "nifty_3d_5m": {"ticker": "^NSEI", "period": "3d", "interval": "5m", "purpose": "3-day envelope, week-start momentum"},
    
    # Volatility
    "vix": {"ticker": "^INDIAVIX", "period": "5y", "interval": "1d", "purpose": "Volatility context, expansion probability"},
    
    # Sectors (correlation, beta, stress signals)
    "nsebank": {"ticker": "^NSEBANK", "period": "5y", "interval": "1d", "purpose": "Bank sector correlation, beta"},
    "finservice": {"ticker": "NIFTY_FIN_SERVICE.NS", "period": "5y", "interval": "1d", "purpose": "Financial services sector context"},
    "it": {"ticker": "^CNXIT", "period": "5y", "interval": "1d", "purpose": "IT sector dispersion, cross-correlation"},
    "pharma": {"ticker": "^CNXPHARMA", "period": "5y", "interval": "1d", "purpose": "Pharma sector beta"},
    "auto": {"ticker": "^CNXAUTO", "period": "5y", "interval": "1d", "purpose": "Auto sector correlation"},
    "metal": {"ticker": "^CNXMETAL", "period": "5y", "interval": "1d", "purpose": "Metal sector correlation"},
    "fmcg": {"ticker": "^CNXFMCG", "period": "5y", "interval": "1d", "purpose": "FMCG sector correlation"},
    "energy": {"ticker": "^CNXENERGY", "period": "5y", "interval": "1d", "purpose": "Energy sector correlation"},
}

MAX_RETRIES = 5
BACKOFF_INITIAL = 2.0  # exponential backoff (2s, 4s, 8s, 16s, 32s)


# VALIDATION & FETCHING HELPERS
def validate_df(df: pd.DataFrame, ticker: str, interval: str) -> bool:
    """Strict validation: OHLCV structure, min 2 rows, no null closes"""
    if df is None or df.empty:
        print(f"    [FAIL] {ticker}: empty DataFrame")
        return False
    required = {"Open", "High", "Low", "Close", "Volume"}
    if not required.issubset(set(df.columns)):
        print(f"    [FAIL] {ticker}: missing OHLCV columns")
        return False
    if df.shape[0] < 2:
        print(f"    [FAIL] {ticker}: < 2 rows")
        return False
    if df['Close'].isnull().all():
        print(f"    [FAIL] {ticker}: all Close prices null")
        return False
    return True

def fetch_ticker_yf_download(ticker: str, period: str, interval: str) -> Optional[pd.DataFrame]:
    """Try yfinance.download (primary method)"""
    try:
        df = yf.download(ticker, period=period, interval=interval, progress=False, threads=False)
        if isinstance(df, pd.DataFrame) and not df.empty:
            return df
    except Exception as e:
        print(f"    [WARN] yf.download({ticker}) failed: {str(e)[:80]}")
    return None

def fetch_ticker_history(ticker: str, period: str, interval: str) -> Optional[pd.DataFrame]:
    """Fallback: Ticker.history (alternate method)"""
    try:
        t = yf.Ticker(ticker)
        df = t.history(period=period, interval=interval, timeout=10)
        if isinstance(df, pd.DataFrame) and not df.empty:
            return df
    except Exception as e:
        print(f"    [WARN] Ticker.history({ticker}) failed: {str(e)[:80]}")
    return None

def robust_fetch_one(key: str, config: Dict) -> Optional[pd.DataFrame]:
    """
    Fetch ONE series with retries + exponential backoff.
    Returns validated DataFrame or raises Exception.
    """
    ticker = config["ticker"]
    period = config["period"]
    interval = config["interval"]
    backoff = BACKOFF_INITIAL
    last_exc = None
    
    print(f"\n  [{key}]")
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"    Attempt {attempt}/{MAX_RETRIES}: {ticker} ({period}/{interval})")
            
            # Try method 1: download
            df = fetch_ticker_yf_download(ticker, period, interval)
            if validate_df(df, ticker, interval):
                print(f"    [OK] {ticker}: {len(df)} rows via yf.download()")
                return df
            
            # Try method 2: history
            df2 = fetch_ticker_history(ticker, period, interval)
            if validate_df(df2, ticker, interval):
                print(f"    [OK] {ticker}: {len(df2)} rows via Ticker.history()")
                return df2
            
            # Both methods failed, will retry
            raise RuntimeError("Both yf.download() and Ticker.history() returned invalid/empty")
            
        except Exception as exc:
            last_exc = exc
            if attempt < MAX_RETRIES:
                print(f"    [RETRY] backing off {backoff:.0f}s (attempt {attempt}/{MAX_RETRIES})")
                time.sleep(backoff)
                backoff *= 2.0
            else:
                print(f"    [ABORT] max retries reached")
    
    # All retries exhausted
    raise Exception(f"[FATAL] Failed to fetch {key} ({ticker}) after {MAX_RETRIES} attempts. Last error: {last_exc}")

def main():
    """
    Canonical OmniSpectrum data fetcher.
    Fetches 13 series in sequence; fail-fast if any series cannot be fetched.
    Writes single cache JSON: data/prediction_data.json
    """
    print("\n" + "=" * 75)
    print("OmniSpectrum: Canonical Market Data Fetcher")
    print("=" * 75)
    print(f"Cache output: {CACHE_PATH}")
    print(f"Tickers to fetch: {len(TICKERS_CONFIG)}")
    print(f"Max retries per ticker: {MAX_RETRIES}")
    print("=" * 75)
    
    # Fetch all tickers
    fetched_data = {}
    for key, config in TICKERS_CONFIG.items():
        try:
            df = robust_fetch_one(key, config)
            # Convert to records for JSON serialization
            df_reset = df.reset_index()
            if 'Date' in df_reset.columns:
                df_reset['Date'] = df_reset['Date'].astype(str)
            elif 'Datetime' in df_reset.columns:
                df_reset['Datetime'] = df_reset['Datetime'].astype(str)
            
            fetched_data[key] = {
                "meta": {
                    "ticker": config["ticker"],
                    "period": config["period"],
                    "interval": config["interval"],
                    "purpose": config["purpose"]
                },
                "data": df_reset.to_dict(orient='records')
            }
        except Exception as e:
            print(f"\n[FATAL] {key}: {e}")
            raise
    
    # Write canonical cache
    print(f"\n" + "=" * 75)
    print("Writing canonical cache...")
    print("=" * 75)
    
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    cache_output = {
        "timestamp": pd.Timestamp.utcnow().isoformat(),
        "fetched_keys": list(fetched_data.keys()),
        "series": fetched_data
    }
    
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache_output, f, indent=2, default=str)
    
    print(f"[OK] Cache written: {CACHE_PATH}")
    print(f"[OK] Total series fetched: {len(fetched_data)}/{len(TICKERS_CONFIG)}")
    
    # Summary
    print(f"\n" + "=" * 75)
    print("FETCH SUMMARY")
    print("=" * 75)
    for key, data in fetched_data.items():
        ticker = data['meta']['ticker']
        rows = len(data['data'])
        print(f"  {key:15s} ({ticker:20s}): {rows} rows")
    
    print("=" * 75)
    print("\nCache ready. Next steps:")
    print("  1. python -m src.train     (train models using cache)")
    print("  2. python -m src.inference (generate omnispectrum.json)")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    main()
    print("\nCache ready at: data/prediction_data.json")
    print("Next: python -m src.train\n")

if __name__ == "__main__":
    main()
