import yfinance as yf
from datetime import datetime, timezone
from pathlib import Path

def get_series(ticker, period="5d", interval="5m", n=120):
    """Fetch intraday price series"""
    try:
        df = yf.Ticker(ticker).history(period=period, interval=interval, auto_adjust=False)
        if df.empty:
            return []
        return [float(x) for x in df["Close"].tail(n).values]
    except Exception as e:
        print(f"[WARN] Failed to get intraday series for {ticker}: {e}")
        return []

def get_daily_series(ticker, period="1y"):
    """Fetch daily price series"""
    try:
        df = yf.Ticker(ticker).history(period=period, interval="1d", auto_adjust=False)
        if df.empty:
            return []
        return [float(x) for x in df["Close"].values]
    except Exception as e:
        print(f"[WARN] Failed to get daily series for {ticker}: {e}")
        return []

def get_current_price(ticker):
    """Get current/live price from yfinance"""
    try:
        ticker_obj = yf.Ticker(ticker)
        
        # Try info first (real-time during market hours)
        try:
            info = ticker_obj.info
            price = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose")
            if price is not None:
                return float(price)
        except:
            pass
        
        # Try fast_info
        try:
            fast_info = ticker_obj.fast_info
            price = fast_info.get("lastPrice") or fast_info.get("regularMarketPrice")
            if price is not None:
                return float(price)
        except:
            pass
        
        # Fallback to latest 1-minute data
        try:
            hist = ticker_obj.history(period="1d", interval="1m", auto_adjust=False)
            if not hist.empty:
                return float(hist["Close"].iloc[-1])
        except:
            pass
        
        # Final fallback to latest 5-minute data
        hist = ticker_obj.history(period="5d", interval="5m", auto_adjust=False)
        if not hist.empty:
            return float(hist["Close"].iloc[-1])
        
        return None
    except Exception as e:
        print(f"[WARN] Error fetching current price for {ticker}: {e}")
        return None

def get_ohlc(ticker, days=5):
    """Get OHLC data for specified days"""
    try:
        ticker_obj = yf.Ticker(ticker)
        hist = ticker_obj.history(period=f"{days}d", interval="1d", auto_adjust=False)
        
        if hist.empty or len(hist) == 0:
            return {}
        
        latest = hist.iloc[-1]
        return {
            "open": float(latest["Open"]) if "Open" in latest else None,
            "high": float(latest["High"]) if "High" in latest else None,
            "low": float(latest["Low"]) if "Low" in latest else None,
            "close": float(latest["Close"]) if "Close" in latest else None
        }
    except Exception as e:
        print(f"[WARN] Error fetching OHLC for {ticker}: {e}")
        return {}

def fetch_market_data():
    """Fetch all market data for dashboard"""
    print("[INFO] Fetching live market data...")
    
    Path("data").mkdir(exist_ok=True)
    
    # Fetch NIFTY data
    spot_series = get_series("^NSEI", "5d", "5m", 120)
    current_spot = get_current_price("^NSEI")
    nifty_ohlc = get_ohlc("^NSEI", 5)
    
    # Fetch VIX data
    vix_series = get_series("^INDIAVIX", "5d", "5m", 120)
    vix_daily = get_daily_series("^INDIAVIX", "1y")
    current_vix = get_current_price("^INDIAVIX")
    vix_ohlc = get_ohlc("^INDIAVIX", 5)
    
    # Calculate VIX 52-week high/low
    vix_52w_high = max(vix_daily) if vix_daily else None
    vix_52w_low = min(vix_daily) if vix_daily else None
    
    out = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "spotSeries": spot_series,
        "vixSeries": vix_series,
        "spot": current_spot,
        "vix": current_vix,
        "vixDaily": vix_daily,
        "vix52wHigh": vix_52w_high,
        "vix52wLow": vix_52w_low,
        "vixOhlc": vix_ohlc,
        "niftyOhlc": nifty_ohlc
    }
    
    # Save to file
    import json
    with open("data/market_data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    
    print("[INFO] Market data saved to data/market_data.json")
    return out

if __name__ == "__main__":
    fetch_market_data()
