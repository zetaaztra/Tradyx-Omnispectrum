# Tradyxa Quant Dashboard

## Overview
An institutional-grade trading dashboard for retail intraday and short-term traders. Features 12 specialized data visualization tiles displaying point forecasts, range projections, and market signals with a stunning spectral dark/light theme.

## Current State
✅ Complete MVP with all core features implemented
- All 12 trading tiles operational with real-time data visualization
- Spectral "Omni Spectrum" theme (void black #000008 + cyan/magenta/violet accents)
- Multi-layer consent system (disclaimer + cookie/advertising)
- Responsive design (3-column desktop → single column mobile)
- Auto-refresh every 30 minutes via SWR

## Recent Changes (2025-01-15)
- **Frontend**: Built all 12 trading tiles with Recharts visualizations
- **Theme System**: Implemented spectral dark mode (void black + prismatic accents) and light mode
- **Consent Management**: Created disclaimer popup (2-day persistence) and cookie consent modal
- **Data Integration**: Connected frontend to backend API with SWR for 30-minute auto-refresh
- **Backend**: API endpoint serving omnispectrum.json market data
- **Navigation**: Added legal pages (Privacy, Cookies, Terms, Disclaimer, About)

## Project Architecture

### Frontend (React + Wouter)
- **Pages**:
  - `/` - Main dashboard with 12 tiles
  - `/privacy`, `/cookies`, `/terms`, `/disclaimer`, `/about` - Legal pages
  
- **Components**:
  - **Tiles**: Tomorrow (2×2), 2-Day, 3-Day, Weekly/Monthly ranges, Directional Tilt, Short/Medium envelopes, Option Seller/Buyer radars, Pattern Match, Composite summary
  - **Header**: Hard refresh button + dark/light theme toggle
  - **Footer**: Legal disclaimers, data sources, company info
  - **Modals**: Disclaimer, cookie consent, tile explanations
  - **Sections**: "How to Use" collapsible guide

- **State Management**:
  - SWR for data fetching with 30-minute revalidation
  - localStorage for theme + disclaimer acceptance (2-day expiry)
  - Cookies for consent preferences (365-day expiry)

### Backend (Express)
- **API Routes**:
  - `GET /api/omnispectrum` - Serves market data JSON with 30-minute cache headers

- **Data**: Static JSON file at `server/data/omnispectrum.json` with:
  - Point forecasts (tomorrow, 2-day, 3-day)
  - Range projections (weekly, monthly)
  - Directional tilt, envelopes, option radars
  - Pattern match index, composite summary
  - Historical close prices and pattern match scores

### Design System

**Color Palette (Dark Mode)**:
- Background: #000008 (void black)
- Cards: #0E1620 (soft navy)
- Accents: #00E5FF (cyan), #2A6BFF (blue), #D400FF (magenta), #7A00FF (violet)
- Bull: #67E480, Bear: #FF6B6B, Neutral: #9AA7B2

**Color Palette (Light Mode)**:
- Background: #FAFAFF (near-white)
- Cards: #FFFFFF
- Spectral gradient: #005CFF → #A000FF
- Bull: #017A3A, Bear: #B00020

**Typography**:
- UI Font: Inter (14px body, 12px small, 16-18px labels)
- Numeric Display: Space Mono (48px for main forecasts, weight 700)

## The 12 Trading Tiles

1. **Tomorrow** (2×2 focal point) - Point forecast with sparkline
2. **2-Day** - Cumulative point movement
3. **3-Day** - Point forecast with confidence badge
4. **Weekly Range** - Horizontal range band with current price marker
5. **Monthly Range** - 21-day range projection
6. **Directional Tilt** - Traffic light (Bear/Neutral/Bull)
7. **Short-Term Envelope** - Tomorrow's price channel
8. **Medium-Term Envelope** - Weekly price channel
9. **Option Sellers Radar** - Favorable/Neutral/Avoid status
10. **Option Buyers Radar** - Favorable/Caution/Avoid status
11. **Pattern Match Index** - 0-100 similarity score with sparkline
12. **Composite Summary** - Plain-English synthesis

## Data Flow
1. Client loads dashboard page
2. SWR fetches `/api/omnispectrum` on mount
3. Backend reads `server/data/omnispectrum.json`
4. Data populates all 12 tiles with visualizations
5. Auto-refresh every 30 minutes
6. User can manually refresh via header button

## User Preferences
- **Theme**: Dark mode (preferred) / Light mode
- **Consent**: Disclaimer acceptance (2-day expiry), cookie/advertising preferences (365-day expiry)

## Accessibility
- WCAG AA contrast ratios in both themes
- Keyboard navigation for all interactive elements
- ARIA labels on buttons and inputs
- Text alternatives for color-coded information
- Responsive font sizing with browser zoom support

## Future Enhancements
- Real-time market data integration (NSE India, Yahoo Finance APIs)
- Historical forecast accuracy tracking (MAE visualization)
- User accounts with personalized watchlists
- Advanced interactive charts with Plotly
- Export functionality (PDF/CSV reports)
- Websocket for live updates
