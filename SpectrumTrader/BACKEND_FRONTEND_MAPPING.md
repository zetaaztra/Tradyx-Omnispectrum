# Backend to Frontend Data Mapping

## Overview
This document describes how the Python backend's omnispectrum inference output maps to the frontend dashboard tiles.

## Backend Output Structure (omnispectrum.json)

```json
{
  "timestamp": "ISO 8601 timestamp",
  "close": "current NIFTY close price",
  "tiles": {
    "tomorrow_expected_move_pts": "point movement for tomorrow",
    "2day_expected_move_pts": "cumulative 2-day movement",
    "3day_expected_move_pts": "cumulative 3-day movement",
    "weekly_range_pts": [low_offset, high_offset],
    "monthly_range_pts": [low_offset, high_offset],
    "directional_tilt": { "bear": prob, "neutral": prob, "bull": prob },
    "short_term_envelope": [low_offset, high_offset],
    "medium_term_envelope": [low_offset, high_offset],
    "volatility_expansion_prob": probability,
    "pattern_match_index": similarity_score,
    "regime_free_trend_strength": trend_value,
    "option_sellers_status": "FAVORABLE|NEUTRAL|CAUTION|AVOID",
    "option_buyers_status": "FAVORABLE|NEUTRAL|CAUTION|AVOID",
    "composite_summary": "text summary"
  }
}
```

## Frontend Tile Mappings

### 1. Spot Price Tile
- **Component**: `tile-spot-price.tsx`
- **Data Source**: `data.spotPrice` (can be enriched from backend)
- **Displays**:
  - Current NIFTY price
  - Percentage change
  - OHLC (Open, High, Low, Close)

### 2. India VIX Tile
- **Component**: `tile-india-vix.tsx`
- **Data Source**: `data.indiaVIX` (can be enriched from backend)
- **Displays**:
  - Current VIX percentage
  - VIX change percentage (inverse coloring: red=increase, green=decrease)
  - OHLC breakdown

### 3. Tomorrow (Point Forecast)
- **Component**: `tile-tomorrow.tsx`
- **Data Source**:
  - `data.tiles.tomorrow_expected_move_pts` → displayed as main point value
  - `data.close` → used to calculate implied price
  - `data.historicalClose` → displayed as 30-day price chart
- **Calculations**:
  - Implied = close + tomorrow_expected_move_pts
  - Direction: positive (green) / negative (red) / neutral (gray)

### 4. 2-Day Point Forecast
- **Component**: `tile-multiday.tsx`
- **Data Source**: `data.tiles.twoday_expected_move_pts`
- **Props**:
  - `title`: "2-Day"
  - `pts`: twoday_expected_move_pts value

### 5. 3-Day Point Forecast
- **Component**: `tile-multiday.tsx`
- **Data Source**:
  - `data.tiles.threeday_expected_move_pts` → main point value
  - `data.tiles.volatility_expansion_prob` → confidence indicator
- **Props**:
  - `title`: "3-Day"
  - `pts`: threeday_expected_move_pts
  - `showConfidence`: true
  - `confidenceProb`: volatility_expansion_prob

### 6. Weekly Range
- **Component**: `tile-range.tsx`
- **Data Source**: `data.tiles.weekly_range_pts`
- **Props**:
  - `title`: "Weekly Range"
  - `subtitle`: "5 trading days"
  - `rangePts`: [low_offset, high_offset]
  - `close`: close price

### 7. Monthly Range
- **Component**: `tile-range.tsx`
- **Data Source**: `data.tiles.monthly_range_pts`
- **Props**:
  - `title`: "Monthly Range"
  - `subtitle`: "21 trading days"
  - `rangePts`: [low_offset, high_offset]
  - `close`: close price

### 8. Directional Tilt (Bull/Bear/Neutral)
- **Component**: `tile-directional-tilt.tsx`
- **Data Source**: `data.tiles.directional_tilt`
- **Structure**:
  ```json
  {
    "bear": 0.12,    // 12% probability
    "neutral": 0.34, // 34% probability
    "bull": 0.54     // 54% probability
  }
  ```
- **Logic**: Dominant direction determined by highest probability

### 9. Short-Term Envelope (Tomorrow)
- **Component**: `tile-envelope.tsx`
- **Data Source**:
  - `data.tiles.short_term_envelope` → [low_offset, high_offset]
  - `data.close` → base price
  - `data.historicalClose` → last 15 prices for chart
- **Props**:
  - `title`: "Short-Term Envelope"
  - `envelope`: short_term_envelope offsets
  - `close`: close price

### 10. Medium-Term Envelope (Weekly)
- **Component**: `tile-envelope.tsx`
- **Data Source**:
  - `data.tiles.medium_term_envelope` → [low_offset, high_offset]
  - `data.close` → base price
  - `data.historicalClose` → last 15 prices for chart
- **Props**:
  - `title`: "Medium-Term Envelope"
  - `envelope`: medium_term_envelope offsets
  - `close`: close price

### 11. Option Sellers Radar
- **Component**: `tile-option-radar.tsx`
- **Data Source**: `data.tiles.option_sellers_status`
- **Status Values**: "FAVORABLE" | "NEUTRAL" | "CAUTION" | "AVOID"
- **Props**:
  - `title`: "Option Sellers Radar"
  - `status`: option_sellers_status

### 12. Option Buyers Radar
- **Component**: `tile-option-radar.tsx`
- **Data Source**: `data.tiles.option_buyers_status`
- **Status Values**: "FAVORABLE" | "NEUTRAL" | "CAUTION" | "AVOID"
- **Props**:
  - `title`: "Option Buyers Radar"
  - `status`: option_buyers_status

### 13. Pattern Match Index
- **Component**: `tile-pattern-match.tsx`
- **Data Source**:
  - `data.tiles.pattern_match_index` → normalized to 0-100 range
  - `data.historicalPatternMatch` → last 20 pattern scores
- **Props**:
  - `index`: pattern_match_index value
  - `historicalPattern`: array of historical scores

### 14. Composite Summary
- **Component**: `tile-composite-summary.tsx`
- **Data Source**: `data.tiles.composite_summary`
- **Props**:
  - `summary`: composite_summary text

## Data Refresh Flow

1. **On Page Load**: Frontend fetches `/api/omnispectrum` (cached data)
2. **User Clicks Refresh**: Frontend calls `POST /api/omnispectrum/refresh`
3. **Backend Execution**:
   - Server calls Python inference script
   - Python downloads latest NIFTY data
   - Runs all 5 ML models (TME_LSTM, VSE_CNN, GFE_AE, Fusion MLP, LightGBM)
   - Generates omnispectrum.json with predictions
4. **Response**: JSON data returned and cached on frontend
5. **Frontend Update**: SWR mutates cache and re-renders all tiles

## Important Notes

- **Range Values**: Returned as offsets (to add/subtract from close), not absolute prices
  - Example: If close=23345 and range_pts=[-245.45, 245.22]
  - Low = 23345 + (-245.45) = 23099.55
  - High = 23345 + 245.22 = 23590.22

- **Volatility Expansion Prob**: Used as confidence indicator
  - < 0.3 = "Stable"
  - 0.3-0.6 = "Moderate"
  - > 0.6 = "Volatile"

- **Pattern Match Index**: Normalized to 0-100 scale
  - >= 70 = "High similarity"
  - 40-70 = "Moderate match"
  - < 40 = "Low precedent"

- **Directional Tilt**: Probabilities should sum to ~1.0 (100%)

- **Timestamps**: Use ISO 8601 format with Z suffix for UTC

## API Endpoints

### GET /api/omnispectrum
- Returns cached omnispectrum data
- Cache: 5 minutes
- Used for initial page load and periodic auto-refresh

### POST /api/omnispectrum/refresh
- Triggers backend Python inference
- Timeout: 3 minutes
- Returns: `{ success: boolean, data: OmniSpectrumData, message?: string }`

### GET /api/health
- Returns backend health status
- Useful for checking if Python backend is accessible
