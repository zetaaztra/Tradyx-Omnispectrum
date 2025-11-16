"""
NSE India Official API Data Fetcher (Alternative to yfinance)
============================================================
Fetches NIFTY data directly from NSE's public endpoints.
More reliable than yfinance for Indian market data.

Endpoints used:
- https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050
- https://www.nseindia.com/api/historical/indicesHistory (historical OHLC)
"""
import os
import json
import time
import requests
from datetime import datetime, timedelta
import pandas as pd

class NSEDataFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive'
        })
        self.base_url = "https://www.nseindia.com/api"
    
    def _get_cookies(self):
        """Get cookies from NSE homepage (required for API calls)"""
        try:
            self.session.get("https://www.nseindia.com", timeout=10)
            time.sleep(1)
        except Exception as e:
            print(f"[WARN] Could not fetch NSE homepage cookies: {e}")
    
    def get_nifty_live(self) -> dict:
        """Fetch current NIFTY 50 price"""
        self._get_cookies()
        
        try:
            url = f"{self.base_url}/equity-stockIndices?index=NIFTY%2050"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                nifty = data['data'][0]
                
                return {
                    'symbol': 'NIFTY50',
                    'price': float(nifty['last']),
                    'open': float(nifty['open']),
                    'high': float(nifty['dayHigh']),
                    'low': float(nifty['dayLow']),
                    'prev_close': float(nifty['previousClose']),
                    'change': float(nifty['change']),
                    'change_pct': float(nifty['pChange']),
                    'timestamp': datetime.now().isoformat(),
                    'source': 'NSE official'
                }
        except Exception as e:
            print(f"[ERROR] NSE live fetch failed: {e}")
        
        return None
    
    def get_nifty_historical(self, days=730) -> pd.DataFrame:
        """Fetch historical NIFTY OHLC from NSE"""
        self._get_cookies()
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        try:
            url = f"{self.base_url}/historical/indicesHistory"
            params = {
                'indexType': 'NIFTY 50',
                'from': start_date.strftime('%d-%m-%Y'),
                'to': end_date.strftime('%d-%m-%Y')
            }
            
            response = self.session.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                records = data.get('data', {}).get('indexCloseOnlineRecords', [])
                
                parsed = []
                for item in records:
                    parsed.append({
                        'Date': pd.to_datetime(item['EOD_TIMESTAMP']),
                        'Open': float(item['EOD_OPEN_INDEX_VAL']),
                        'High': float(item['EOD_HIGH_INDEX_VAL']),
                        'Low': float(item['EOD_LOW_INDEX_VAL']),
                        'Close': float(item['EOD_CLOSE_INDEX_VAL']),
                        'Volume': 0  # NSE doesn't provide volume for indices
                    })
                
                df = pd.DataFrame(parsed)
                df = df.sort_values('Date').reset_index(drop=True)
                
                print(f"[OK] NSE historical: {len(df)} days")
                return df
        
        except Exception as e:
            print(f"[ERROR] NSE historical fetch failed: {e}")
        
        return None
    
    def get_indiavix_live(self) -> dict:
        """Fetch current India VIX"""
        self._get_cookies()
        
        try:
            url = f"{self.base_url}/equity-stockIndices?index=India%20VIX"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                vix = data['data'][0]
                
                return {
                    'symbol': 'INDIAVIX',
                    'price': float(vix['last']),
                    'change': float(vix['change']),
                    'change_pct': float(vix['pChange']),
                    'timestamp': datetime.now().isoformat(),
                    'source': 'NSE official'
                }
        except Exception as e:
            print(f"[ERROR] India VIX fetch failed: {e}")
        
        return None


def fetch_all_nse_data(output_path="data/prediction_data.json"):
    """
    Fetch complete market data from NSE official APIs.
    Writes canonical cache JSON.
    """
    print("\n" + "=" * 75)
    print("OmniSpectrum: NSE Official Data Fetcher (Alternative)")
    print("=" * 75)
    
    fetcher = NSEDataFetcher()
    
    print("\n[1/3] Fetching NIFTY 50 live...")
    nifty_live = fetcher.get_nifty_live()
    if not nifty_live:
        raise Exception("[FATAL] Cannot fetch live NIFTY")
    print(f"    ₹{nifty_live['price']:.2f} (Change: {nifty_live['change_pct']:.2f}%)")
    
    print("\n[2/3] Fetching NIFTY 50 historical (730 days)...")
    nifty_hist = fetcher.get_nifty_historical(days=730)
    if nifty_hist is None or len(nifty_hist) < 100:
        raise Exception("[FATAL] Cannot fetch historical NIFTY")
    
    print("\n[3/3] Fetching India VIX...")
    vix_live = fetcher.get_indiavix_live()
    if not vix_live:
        print("    [WARN] VIX unavailable, using default 15.0")
        vix_live = {'price': 15.0}
    else:
        print(f"    {vix_live['price']:.2f}")
    
    # Build canonical cache
    print("\nBuilding canonical cache...")
    cache = {
        "timestamp": pd.Timestamp.utcnow().isoformat(),
        "source": "NSE official APIs",
        "series": {
            "nifty_daily": {
                "meta": {
                    "ticker": "NIFTY50",
                    "period": "730d",
                    "interval": "1d",
                    "source": "NSE official",
                    "purpose": "Training history, technical indicators"
                },
                "data": nifty_hist.reset_index().to_dict(orient='records')
            }
        },
        "spot": {
            "price": nifty_live['price'],
            "open": nifty_live['open'],
            "high": nifty_live['high'],
            "low": nifty_live['low'],
            "change": nifty_live['change'],
            "change_pct": nifty_live['change_pct']
        },
        "vix": {
            "price": vix_live['price']
        }
    }
    
    # Write cache
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, default=str)
    
    print(f"\n[OK] Cache written: {output_path}")
    print("=" * 75)
    print(f"Spot: ₹{nifty_live['price']:.2f}")
    print(f"VIX: {vix_live['price']:.2f}")
    print(f"Historical rows: {len(nifty_hist)}")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    try:
        fetch_all_nse_data()
    except Exception as e:
        print(f"\n[ERROR] {e}\n")
        raise
