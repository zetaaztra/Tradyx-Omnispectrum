# SpectrumTrader - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js v22.14.0+
- Python 3.12+
- Git

---

## Backend ML Pipeline (Python)

### 1. Setup

```bash
cd omnispectrum-backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run Complete Pipeline

```bash
# Step 1: Fetch live market data (13 tickers)
python -m src.data_fetcher
# ✓ Output: data/prediction_data.json (1235+ days)

# Step 2: Train all 5 ML models
python -m src.train
# ✓ Output: models/{tme_lstm.pt, vse_cnn.pt, gfe_ae.pt, fusion_mlp.joblib, lgb_expansion.txt}
# ✓ Accuracy: 90.8%

# Step 3: Generate predictions for dashboard
python -m src.inference
# ✓ Output: data/omnispectrum.json (14 tiles)
```

### 3. Copy to Server

```bash
# Windows PowerShell
Copy-Item "data\omnispectrum.json" "..\server\data\omnispectrum.json" -Force

# macOS/Linux
cp data/omnispectrum.json ../server/data/omnispectrum.json
```

---

## Frontend Dashboard (React)

### 1. Setup

```bash
cd ..  # Back to root
npm install
```

### 2. Start Development Server

```bash
npm run dev
# ➜ Local: http://localhost:5173
```

### 3. Open Dashboard

```
http://localhost:5173
```

**You'll see:**
- 14 trading signal tiles
- Real-time NIFTY spot price
- Live VIX indicator
- Historical 30-day charts
- Pattern match confidence
- Directional sentiment

---

## Production Build

```bash
# Build frontend & backend
npm run build

# Start production server
npm run start
# Server: http://localhost:3000
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
# Then merge to main

# Main branch auto-deploys to Cloudflare Pages
```

---

## GitHub Actions (Automated Weekly)

**Runs automatically every Sunday 6:30 PM IST:**

1. Fetches latest market data
2. Trains all models
3. Generates predictions
4. Updates dashboard

**Or trigger manually:**

```bash
gh workflow run train.yml
```

---

## Deploy to Cloudflare Pages

### One-Time Setup

```bash
# 1. Build frontend
npm run build

# 2. Sign up at https://dash.cloudflare.com

# 3. Connect GitHub repository
# - Dashboard → Pages → Connect to Git
# - Select: SpectrumTrader
# - Build Command: npm run build
# - Build Output: dist

# 4. Deploy
# - Push to main: git push origin main
# - Cloudflare automatically builds & deploys
# - Live at: yourdomain.com
```

---

## Environment Variables

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
```

### Production (`.env.production`)

```
VITE_API_URL=https://api.yourdomain.com
VITE_ENV=production
```

---

## Tech Stack Summary

### Frontend
- React 18.3 + TypeScript 5.6
- Vite 5.4 (dev server & build)
- Tailwind CSS 3.4 (styling)
- TanStack Query 5.60 (data fetching)
- Chart.js + Recharts (visualization)

### Backend
- Node.js 22.14 + Express 4.21
- TypeScript 5.6
- PostgreSQL (production) / SQLite (dev)

### ML Pipeline
- PyTorch 2.2.0 (deep learning)
- scikit-learn 1.4 (ML algorithms)
- LightGBM 4.0 (boosting)
- Pandas 2.2.2 (data processing)
- NumPy 1.26.0 (numerical computing)

---

## File Locations

| What | Location |
|------|----------|
| Frontend code | `client/src/` |
| Backend code | `server/` |
| ML scripts | `omnispectrum-backend/src/` |
| Trained models | `omnispectrum-backend/models/` |
| Market data | `data/prediction_data.json` |
| Predictions | `server/data/omnispectrum.json` |
| Config | `vite.config.ts`, `package.json` |

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run check            # TypeScript check
npm run db:push          # Sync database schema

# Python ML
python -m src.data_fetcher     # Fetch market data
python -m src.train            # Train models
python -m src.inference        # Generate predictions
python live_data.py            # Fetch live spot prices

# Git
git status              # Check changes
git add .               # Stage all changes
git commit -m "msg"     # Commit changes
git push                # Push to GitHub
git pull                # Pull latest
git log --oneline -5    # View recent commits
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "npm: command not found" | Install Node.js from nodejs.org |
| "venv activation fails" | Run: `python -m venv venv` first |
| "Port 5173 already in use" | Kill process or use: `npm run dev -- --port 3000` |
| "Models not found" | Run: `python -m src.train` first |
| "Old data in dashboard" | Run: `python -m src.inference` and refresh browser |
| "CORS errors" | Check backend is running: `npm run dev` |

---

## Next Steps

1. ✅ Setup backend: `cd omnispectrum-backend && ./venv/Scripts/activate`
2. ✅ Run pipeline: `python -m src.data_fetcher && python -m src.train && python -m src.inference`
3. ✅ Setup frontend: `cd .. && npm install`
4. ✅ Start dev server: `npm run dev`
5. ✅ Open dashboard: http://localhost:5173
6. ✅ Make changes & commit: `git add . && git commit -m "msg" && git push`
7. ✅ Deploy: Push to main → Cloudflare auto-deploys

---

For detailed documentation, see [README.md](./README.md)

**Last Updated:** November 16, 2025
**Version:** 1.0.0
