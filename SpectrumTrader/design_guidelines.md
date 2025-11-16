# Tradyxa Quant Dashboard - Design Guidelines

## Design Philosophy
Institutional, authoritative, minimal noise. Users must feel "secure" through calm UI and clear numbers. Avoid probabilistic jargon on primary elements—show point values and simple labels (UP/DOWN/FLAT/SELLERS: OK/BUYERS: CAUTION).

## Color System - "Omni Spectrum"

### Dark Mode (Primary/Default)
- **Background**: #000008 (void black)
- **Surface Cards**: #0E1620 (soft navy) with 1px border rgba(255,255,255,0.03)
- **Spectral Accents**:
  - Cyan: #00E5FF
  - Electric Blue: #2A6BFF
  - Magenta: #D400FF
  - Violet: #7A00FF
  - Glow: #06F7DD
- **Bull/Positive**: #67E480 (greenish)
- **Bear/Negative**: #FF6B6B (muted red)
- **Neutral**: #9AA7B2 (cool grey-blue)
- **Text Primary**: #E6EEF3
- **Text Muted**: #9FB0BD
- **Range Fills**: rgba(103,228,128,0.12) bullish, rgba(255,107,107,0.10) bearish

### Light Mode
- **Background**: #FAFAFF (near-white, faint blue bias)
- **Surface Cards**: #FFFFFF with shadow 0 6px 18px rgba(14,22,32,0.06)
- **Spectral Gradient**: Linear Blue→Purple (#005CFF → #A000FF)
- **Bull**: #017A3A (deeper green)
- **Bear**: #B00020 (deep red)
- **Borders/Grid**: #D5D8E0 (cool scientific grey)
- **Text Primary**: #0B1720

## Typography
- **Primary UI**: Inter (14px body, 12px small, 16-18px labels, 14-16px tile titles)
- **Numeric Display**: Space Mono (48px for main forecasts, weight 700)
- **Weights**: 400 (body), 600 (tile titles), 700 (large numbers)

## Layout & Grid

### Desktop (max-width: 1280px)
- **Primary Split**: CSS Grid `1fr 420px` (main tiles left, summary panel right)
- **Main Tiles Grid**: 3 columns, 16px gap
- **Tomorrow Tile**: Spans 2 columns × 2 rows (top-left focal point)
- **Secondary Tiles**: Single cells, varying sizes

### Mobile
Single column stack: Tomorrow → 2-day → 3-day → weekly → monthly → envelopes → option radars → pattern → composite

## 12 Core Tiles

### A. Tomorrow (Primary) - 2×2 Span
Large numeric (Space Mono 48px) + mini sparkline beneath. Display: "+120 pts" with implied price. Color: bull/bear/neutral based on sign. Soft glow on dark mode: box-shadow: 0 6px 20px rgba(103,228,128,0.12)

### B. 2-Day Point
Numeric + micro bar comparing magnitude with change arrow

### C. 3-Day Point
Numeric + confidence badge (green/amber/red) with trend arrow

### D. Weekly Range
Horizontal range band: left/right endpoints with current price vertical line, mid-point numeric

### E. Monthly Range
Similar to weekly, labeled "21 trading days"

### F. Directional Tilt
Traffic light: 3 horizontal segments (Bear—Neutral—Bull), highlight dominant. Text: "Market leaning: BULLISH"

### G. Short-Term Envelope
Candlestick sparkline with translucent band (area shading green/red)

### H. Medium-Term Envelope
Similar area chart, weekly scale

### I. Option Sellers Radar
Compact status chip: "Sellers: Favorable/Neutral/Avoid" with color-coded badge

### J. Option Buyers Radar
Status chip: "Buyers: Favorable/Caution/Avoid"

### K. Pattern Match Index
Progress bar 0-100 with sparkline of historical matches

### L. Composite Summary
Single-line bold sentence. Click expands modal with 3-point explanation

## Right Panel (420px)
- Composite summary card
- Audit card (MAE, model date, last update)
- How to Use (collapsible section)

## Interactive Elements

### Tile Click Behavior
Click any tile → theme-matched popup with detailed explanation, close button

### Header Controls
- Hard refresh button
- Dark/light mode toggle with theme persistence

### Consent System
1. **Initial Disclaimer** (appears every 2 days): No close button, requires "I Understand" click
2. **Cookie/Advertising Consent** (new users): Granular controls for Analytics/Adsterra with Accept/Reject/Save

### Footer
Data sources, engine version (v1.0.0), legal text, Zeta Aztra Technologies info, email, links to Privacy/Cookie/Terms/Disclaimer/About (empty pages for now)

## Micro-Interactions
- Tile entrance: fade + translateY 8px (360ms)
- Value update: subtle count-up (600ms)
- Gauge sweep: ease-out arc (600ms)
- Range morphing: animated area paths
- Keep motion restrained

## Charts & Visualization
- **Sparklines**: Recharts (SVG, lightweight)
- **Range Bands**: Recharts AreaChart with custom fills
- **Gauge/Dial**: Custom SVG ring with Framer Motion
- **Traffic Light**: CSS Grid, 3 cells, dynamic backgrounds
- **Progress Bar**: Tailwind width % transitions

## Accessibility
- WCAG AA contrast ratios in both modes
- Text alternatives for all color-coded info
- Keyboard focusability
- Readable sizes, scalable with browser zoom
- ARIA labels for interactive elements
- Timezone (IST) and ISO timestamps

## Performance
- Static JSON fetch on load
- 30-minute auto-refresh (SWR)
- Subtle animations only (no heavy DOM work)
- Canvas/SVG charts (Recharts preferred)

## Images
No hero images. This is a data-dense dashboard with numeric tiles as primary visual elements. All visuals are chart-based (sparklines, gauges, range bands).