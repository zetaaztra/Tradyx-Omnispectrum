"""
OmniSpectrum: Synthetic Market Data Generator
==============================================
Generates realistic fake NIFTY data for pipeline testing/development.
Use when live data sources (yfinance, NSE API) are unavailable.

Generates:
- 2-year daily OHLC with realistic volatility
- 1d/2d/3d intraday 5-min candles
- India VIX series
- 8 sector correlations
"""
import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_ohlc(base_price=23500, days=730, volatility=0.015):
    """Generate realistic OHLC data with random walk"""
    np.random.seed(42)  # reproducible
    
    dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    prices = [base_price]
    
    for _ in range(days - 1):
        daily_return = np.random.normal(0, volatility)
        new_price = prices[-1] * (1 + daily_return)
        prices.append(new_price)
    
    # Generate OHLC from close prices
    records = []
    for i, date in enumerate(dates):
        close = prices[i]
        high = close * (1 + abs(np.random.normal(0, volatility/2)))
        low = close * (1 - abs(np.random.normal(0, volatility/2)))
        open_price = close * (1 + np.random.normal(0, volatility/3))
        volume = int(np.random.gamma(shape=2, scale=500000))
        
        records.append({
            'Date': date,
            'Open': round(open_price, 2),
            'High': round(max(high, open_price, close), 2),
            'Low': round(min(low, open_price, close), 2),
            'Close': round(close, 2),
            'Volume': volume
        })
    
    return pd.DataFrame(records)

def generate_synthetic_intraday(base_price=23500, candles=72):
    """Generate intraday 5-min candles"""
    records = []
    current_time = datetime.now() - timedelta(hours=candles/12)
    
    for i in range(candles):
        close = base_price * (1 + np.random.normal(0, 0.001))
        high = close * (1 + abs(np.random.normal(0, 0.0005)))
        low = close * (1 - abs(np.random.normal(0, 0.0005)))
        open_price = close * (1 + np.random.normal(0, 0.0003))
        volume = int(np.random.gamma(shape=2, scale=50000))
        
        records.append({
            'Datetime': current_time + timedelta(minutes=5*i),
            'Open': round(open_price, 2),
            'High': round(max(high, open_price, close), 2),
            'Low': round(min(low, open_price, close), 2),
            'Close': round(close, 2),
            'Volume': volume
        })
    
    return pd.DataFrame(records)

def main():
    print("\n" + "=" * 75)
    print("OmniSpectrum: Synthetic Data Generator")
    print("=" * 75)
    print("Generating realistic fake market data for offline testing...")
    
    # Generate NIFTY daily
    print("\n[1/5] Generating NIFTY daily (2 years)...")
    nifty_daily = generate_synthetic_ohlc(base_price=23500, days=730)
    print(f"      {len(nifty_daily)} days from {nifty_daily['Date'].min().date()} to {nifty_daily['Date'].max().date()}")
    print(f"      Close range: ₹{nifty_daily['Close'].min():.2f} - ₹{nifty_daily['Close'].max():.2f}")
    
    # Generate intraday
    print("\n[2/5] Generating NIFTY intraday (1d, 2d, 3d @ 5m)...")
    intraday_1d = generate_synthetic_intraday(base_price=nifty_daily['Close'].iloc[-1], candles=72)
    intraday_2d = generate_synthetic_intraday(base_price=nifty_daily['Close'].iloc[-1], candles=144)
    intraday_3d = generate_synthetic_intraday(base_price=nifty_daily['Close'].iloc[-1], candles=216)
    print(f"      1d: {len(intraday_1d)} candles")
    print(f"      2d: {len(intraday_2d)} candles")
    print(f"      3d: {len(intraday_3d)} candles")
    
    # Generate VIX
    print("\n[3/5] Generating India VIX (2 years)...")
    vix_daily = generate_synthetic_ohlc(base_price=15.0, days=730, volatility=0.05)
    vix_current = vix_daily['Close'].iloc[-1]
    print(f"      VIX range: {vix_daily['Close'].min():.2f} - {vix_daily['Close'].max():.2f}")
    print(f"      Current VIX: {vix_current:.2f}")
    
    # Generate sectors
    print("\n[4/5] Generating 8 sector indices (2 years)...")
    sectors = {}
    sector_names = {
        'nsebank': 45000,
        'finservice': 12500,
        'it': 18000,
        'pharma': 7500,
        'auto': 5000,
        'metal': 6500,
        'fmcg': 4500,
        'energy': 2500
    }
    
    for name, base_price in sector_names.items():
        sector_df = generate_synthetic_ohlc(base_price=base_price, days=730)
        sectors[name] = sector_df
        print(f"      {name:12s}: ₹{sector_df['Close'].iloc[-1]:,.2f}")
    
    # Build canonical cache
    print("\n[5/5] Building canonical cache...")
    
    spot = nifty_daily['Close'].iloc[-1]
    cache = {
        "timestamp": pd.Timestamp.utcnow().isoformat(),
        "source": "SYNTHETIC (for testing)",
        "note": "This is fake data generated for offline testing. Use real data_fetcher for production.",
        "series": {
            "nifty_daily": {
                "meta": {
                    "ticker": "^NSEI",
                    "period": "730d",
                    "interval": "1d",
                    "source": "SYNTHETIC"
                },
                "data": nifty_daily.to_dict(orient='records')
            },
            "nifty_1d_5m": {
                "meta": {"ticker": "^NSEI", "period": "1d", "interval": "5m"},
                "data": intraday_1d.to_dict(orient='records')
            },
            "nifty_2d_5m": {
                "meta": {"ticker": "^NSEI", "period": "2d", "interval": "5m"},
                "data": intraday_2d.to_dict(orient='records')
            },
            "nifty_3d_5m": {
                "meta": {"ticker": "^NSEI", "period": "3d", "interval": "5m"},
                "data": intraday_3d.to_dict(orient='records')
            },
            "vix": {
                "meta": {"ticker": "^INDIAVIX", "period": "730d", "interval": "1d"},
                "data": vix_daily.to_dict(orient='records')
            }
        },
        "spot": {
            "price": float(spot),
            "open": float(nifty_daily['Open'].iloc[-1]),
            "high": float(nifty_daily['High'].iloc[-1]),
            "low": float(nifty_daily['Low'].iloc[-1]),
            "change": float(nifty_daily['Close'].iloc[-1] - nifty_daily['Close'].iloc[-2]),
            "change_pct": float((nifty_daily['Close'].iloc[-1] / nifty_daily['Close'].iloc[-2] - 1) * 100)
        },
        "vix": {
            "price": float(vix_current)
        }
    }
    
    # Add sectors to cache
    for name, df in sectors.items():
        cache['series'][name] = {
            "meta": {"ticker": name, "period": "730d", "interval": "1d"},
            "data": df.to_dict(orient='records')
        }
    
    # Write cache
    output_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "prediction_data.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, default=str)
    
    print(f"\n[OK] Synthetic cache written: {output_path}")
    print("=" * 75)
    print(f"Spot: ₹{spot:,.2f}")
    print(f"VIX: {vix_current:.2f}")
    print(f"Daily rows: {len(nifty_daily)}")
    print(f"Sectors: {len(sectors)}")
    print("=" * 75)
    print("\nWARNING: This is SYNTHETIC data. For production, use:")
    print("  python -m src.data_fetcher    (with yfinance)")
    print("  python -m src.nse_data_fetcher (with NSE APIs)")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    main()
