# SpectrumTrader - Express Backend Server

RESTful API server serving ML predictions and managing user preferences. Built with Express.js, Node.js, Drizzle ORM, and PostgreSQL. Serves the omnispectrum.json predictions to the React frontend dashboard.

---

## 📊 Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 22.14.0 | JavaScript runtime |
| **Express** | 4.21.1 | Web framework |
| **TypeScript** | 5.6.3 | Type safety |
| **Drizzle ORM** | 0.36.0 | Database ORM |
| **PostgreSQL** | Latest | Primary database |
| **SQLite** | 5.1.7 | Development database |
| **tsx** | 4.19.2 | TypeScript executor |

---

## 🏗️ Server Architecture

### Request-Response Flow

```mermaid
graph LR
    subgraph Client["Client Layer"]
        Browser["React Browser<br/>Port 5173"]
    end
    
    subgraph Network["HTTP/Network"]
        HTTPS["HTTPS Requests"]
    end
    
    subgraph Server["Express Server"]
        App["Express App<br/>Port 3000"]
        Middleware["Middleware<br/>CORS, JSON, Static"]
        Routes["Route Handlers<br/>GET/POST/PUT"]
        Vite["Vite Integration<br/>HMR, Dev server"]
    end
    
    subgraph DataAccess["Data Access Layer"]
        Storage["storage.ts<br/>Database queries"]
        Cache["prediction_data.json<br/>Predictions cache"]
    end
    
    subgraph Database["Database Layer"]
        PostgreSQL["PostgreSQL<br/>Production"]
        SQLite["SQLite<br/>Development"]
    end
    
    subgraph Files["File System"]
        OmniJSON["data/omnispectrum.json<br/>ML predictions"]
        Static["public/static<br/>Assets"]
    end
    
    Browser -->|Fetch /api/*| HTTPS
    HTTPS -->|HTTP request| App
    App -->|Router| Routes
    Routes -->|Middleware| Middleware
    Middleware -->|Query| Storage
    Storage -->|SQL| PostgreSQL
    Storage -->|Read JSON| Cache
    
    Routes -->|Serve static| Static
    Routes -->|JSON response| HTTPS
    HTTPS -->|JSON data| Browser
    
    Vite -->|Dev rebuild| App
    
    style Client fill:#e3f2fd
    style Network fill:#f3e5f5
    style Server fill:#e8f5e9
    style DataAccess fill:#fff3e0
    style Database fill:#fce4ec
    style Files fill:#f1f8e9
```

---

## 🔌 API Endpoints

### GET `/api/data`

**Purpose:** Fetch latest ML predictions

**Response:**
```json
{
  "tiles": [
    {
      "id": "composite_summary",
      "name": "Composite Summary",
      "signal": "BULLISH",
      "confidence": 0.908,
      "explanation": "Fusion MLP indicates bullish trend"
    },
    {
      "id": "directional_tilt",
      "signal": "UP",
      "momentum": 2.45,
      "confidence": 0.75
    },
    ...
  ],
  "lastUpdated": "2025-11-16T10:30:00Z",
  "modelAccuracy": 0.908
}
```

**Status Codes:**
- `200 OK` - Success
- `304 Not Modified` - Data unchanged (caching)
- `500 Server Error` - Backend error

**Query Parameters:**
```
?format=json          # JSON format (default)
?cache=false          # Bypass cache
&timestamp=true       # Include timestamp
```

---

### GET `/api/health`

**Purpose:** Health check & server status

**Response:**
```json
{
  "status": "ok",
  "server": "SpectrumTrader API v1.0.0",
  "database": "connected",
  "predictions": "ready",
  "uptime": 3600,
  "timestamp": "2025-11-16T10:30:00Z"
}
```

---

### POST `/api/user/preferences`

**Purpose:** Save user preferences (theme, notifications)

**Request Body:**
```json
{
  "userId": "user123",
  "theme": "dark",
  "notifications": true,
  "tileVisibility": {
    "composite_summary": true,
    "directional_tilt": true,
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences saved",
  "preference": { ...saved data }
}
```

---

### GET `/api/user/:userId/preferences`

**Purpose:** Fetch user preferences

**Response:**
```json
{
  "userId": "user123",
  "theme": "dark",
  "notifications": true,
  "tileVisibility": {...}
}
```

---

### GET `/api/stats`

**Purpose:** Server statistics

**Response:**
```json
{
  "requestsPerMinute": 1250,
  "averageResponseTime": 45,
  "totalRequests": 125000,
  "memoryUsage": "52.3 MB",
  "cpuUsage": "8.2%",
  "predictions_updated": "2025-11-16T10:25:00Z"
}
```

---

## 📁 Directory Structure

```
server/
├── src/
│   ├── index.ts                 # Express app initialization
│   ├── routes.ts                # API route definitions
│   ├── storage.ts               # Database queries & ORM
│   ├── vite.ts                  # Vite dev server integration
│   └── middleware/
│       ├── cors.ts              # CORS configuration
│       ├── logger.ts            # Request logging
│       └── errorHandler.ts      # Error handling
│
├── data/
│   ├── omnispectrum.json        # ML predictions (from backend)
│   └── schema.sql               # Database schema
│
├── public/                      # Static files
│   ├── index.html               # Entry point
│   └── favicon.ico
│
├── dist/                        # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
├── README.md                    # This file
└── .env.example                 # Environment template
```

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Preferences Table

```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  theme VARCHAR(20) DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  tile_composite_summary BOOLEAN DEFAULT true,
  tile_directional_tilt BOOLEAN DEFAULT true,
  tile_envelope BOOLEAN DEFAULT true,
  tile_multiday BOOLEAN DEFAULT true,
  tile_option_radar BOOLEAN DEFAULT true,
  tile_pattern_match BOOLEAN DEFAULT true,
  tile_range BOOLEAN DEFAULT true,
  tile_tomorrow BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

### Predictions Table

```sql
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  tile_id VARCHAR(50) NOT NULL,
  signal VARCHAR(50) NOT NULL,
  confidence DECIMAL(5,4),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tile_id (tile_id)
);
```

---

## 🚀 Development Setup

### Step 1: Install Dependencies

```bash
cd server
npm install
```

---

### Step 2: Environment Configuration

**Create `.env` file:**
```env
# Server
NODE_ENV=development
PORT=3000

# Database (PostgreSQL - Production)
DATABASE_URL=postgresql://user:password@localhost:5432/spectrumtrader
DATABASE_SSL=true

# Or SQLite (Development)
DATABASE_URL=sqlite:./data/local.db

# API Keys
VITE_API_URL=http://localhost:5173
VITE_API_TIMEOUT=30000

# Logging
LOG_LEVEL=debug
```

---

### Step 3: Database Setup

**Initialize PostgreSQL database:**
```bash
psql -U postgres -c "CREATE DATABASE spectrumtrader;"
npm run migrate
```

**Or use SQLite (simpler for development):**
```bash
# SQLite auto-creates file
npm run dev
```

---

### Step 4: Start Development Server

```bash
npm run dev
```

**Output:**
```
[INFO] Starting Express server...
[OK] Database connected (SQLite)
[OK] CORS enabled for http://localhost:5173
[OK] API Server running on http://localhost:3000
[OK] Vite HMR ready
```

---

### Step 5: Verify Server is Running

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "server": "SpectrumTrader API v1.0.0",
  "database": "connected",
  "uptime": 1234
}
```

---

## 📚 Key Files Explained

### index.ts - Main Express App

```typescript
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { viteDevMiddleware } from './vite';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.VITE_API_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Vite HMR (development)
if (process.env.NODE_ENV === 'development') {
  app.use(viteDevMiddleware);
}

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### routes.ts - API Routes

```typescript
import express from 'express';
import { getPredictions, getHealth, savePreferences } from './storage';

const router = express.Router();

// Predictions endpoint
router.get('/data', async (req, res) => {
  try {
    const data = await getPredictions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Health check
router.get('/health', async (req, res) => {
  const health = await getHealth();
  res.json(health);
});

// User preferences
router.post('/user/preferences', async (req, res) => {
  try {
    const saved = await savePreferences(req.body);
    res.json({ success: true, preference: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

export default router;
```

---

### storage.ts - Database Access

```typescript
import { drizzle } from 'drizzle-orm';
import * as fs from 'fs';

// Initialize Drizzle ORM
const db = drizzle(process.env.DATABASE_URL);

// Fetch predictions from JSON file
export async function getPredictions() {
  const data = fs.readFileSync('./data/omnispectrum.json', 'utf-8');
  return JSON.parse(data);
}

// Save user preferences to database
export async function savePreferences(prefs: any) {
  return db.insert(userPreferences)
    .values(prefs)
    .onConflictDoUpdate({
      set: { ...prefs, updated_at: new Date() }
    })
    .returning();
}

// Health check
export async function getHealth() {
  return {
    status: 'ok',
    database: 'connected',
    predictions: 'ready',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}
```

---

## 🔐 CORS Configuration

**Default settings in `index.ts`:**

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',      // Dev
    'http://localhost:3000',      // Local
    'https://yourdomain.dev',     // Production
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

---

## ✅ Scripts & Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with sample data |
| `npm run type-check` | Check TypeScript types |

---

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
```

**Output:**
```
dist/
├── index.js
├── routes.js
├── storage.js
└── [compiled files]
```

### Start Production Server

```bash
NODE_ENV=production npm start
```

---

## 🔄 Integration with Frontend

### Frontend fetches predictions:

```typescript
const response = await fetch('http://localhost:3000/api/data');
const predictions = await response.json();
```

### Server serves from omnispectrum.json:

The backend ML pipeline generates `omnispectrum.json` which is copied to `server/data/` and served via API.

---

## 🧪 Testing

### Manual API Testing

**Using curl:**
```bash
# Get predictions
curl http://localhost:3000/api/data

# Health check
curl http://localhost:3000/api/health

# Save preferences
curl -X POST http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "theme": "dark"}'
```

**Using Postman:**
1. Import collection from `postman_collection.json`
2. Set base URL: `http://localhost:3000`
3. Run requests

---

## 🐛 Troubleshooting

### Issue 1: "Port 3000 already in use"
**Solution:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue 2: "Database connection failed"
**Solution:** Verify `.env` file
```bash
# Check connection string
echo $DATABASE_URL

# Test PostgreSQL connection
psql -U user -d spectrumtrader -c "SELECT 1"

# Or use SQLite (easier)
# Remove DATABASE_URL or set to SQLite path
```

### Issue 3: "CORS error in browser"
**Solution:** Check CORS configuration
```typescript
// In index.ts, ensure origin matches frontend URL
origin: process.env.VITE_API_URL
// Should be http://localhost:5173 (dev) or your domain (prod)
```

### Issue 4: "omnispectrum.json not found"
**Solution:** Copy from backend
```bash
# Windows
copy "..\omnispectrum-backend\data\omnispectrum.json" "data\omnispectrum.json"

# macOS/Linux
cp ../omnispectrum-backend/data/omnispectrum.json data/omnispectrum.json
```

---

## 🚀 Production Deployment

### Hosting Options

1. **Heroku:**
```bash
heroku create spectrumtrader-api
git push heroku main
```

2. **Railway.app:**
```bash
# Install CLI
npm install -g @railway/cli

# Deploy
railway up
```

3. **Render:**
```bash
# Connect GitHub repo
# Auto-deploy from main branch
```

4. **DigitalOcean App Platform:**
- Push code to GitHub
- Connect DigitalOcean to GitHub
- Auto-deploy

---

## 📊 Performance Optimization

### Caching Strategy

```typescript
// Cache predictions for 5 minutes
router.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(predictions);
});
```

### Database Query Optimization

- Add indexes on frequently queried columns
- Use SELECT only needed fields
- Implement connection pooling

```typescript
const pool = new Pool({
  max: 20,                    // Max connections
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});
```

---

## 🔐 Security Best Practices

1. **Environment Variables:** Never commit `.env`
```bash
echo ".env" >> .gitignore
```

2. **Input Validation:** Sanitize all user inputs
```typescript
import { z } from 'zod';
const userSchema = z.object({
  email: z.string().email(),
  theme: z.enum(['light', 'dark'])
});
```

3. **SQL Injection Prevention:** Use parameterized queries (Drizzle ORM handles this)

4. **Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // limit per IP
});

app.use(limiter);
```

5. **HTTPS:** Always use HTTPS in production

---

## 📈 Monitoring & Logging

### Winston Logger

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log API requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

---

## 🔗 API Documentation

### Swagger/OpenAPI

```bash
npm install swagger-ui-express swagger-jsdoc
```

**Generate API docs:**
```bash
npm run docs
```

**Access:** `http://localhost:3000/api-docs`

---

**Last Updated:** November 16, 2025 | **Version:** 1.0.0 | **Status:** Production Ready ✅

**Team:** SpectrumTrader Backend

**Links:**
- ML Backend: `../omnispectrum-backend/README.md`
- Frontend: `../client/README.md`
- Main README: `../README.md`
- Quick Start: `../QUICKSTART.md`
