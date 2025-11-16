# SpectrumTrader - Complete Deployment Guide

Production deployment guide covering Cloudflare Pages, backend hosting, GitHub Actions CI/CD, and full infrastructure setup.

---

## 📋 Table of Contents

1. [Frontend Deployment (Cloudflare Pages)](#frontend-deployment-cloudflare-pages)
2. [Backend Deployment (Railway/Heroku)](#backend-deployment)
3. [GitHub Actions CI/CD Pipeline](#github-actions-cicd)
4. [Environment Configuration](#environment-configuration)
5. [Domain & DNS Setup](#domain--dns-setup)
6. [Production Checklist](#production-checklist)

---

## 🚀 Frontend Deployment (Cloudflare Pages)

### Architecture

```mermaid
graph TB
    subgraph GitHub["GitHub"]
        Repo["Repository<br/>SpectrumTrader"]
    end
    
    subgraph CI["GitHub Actions"]
        Build["Build Step<br/>npm run build"]
        Test["Test Step<br/>Type check"]
    end
    
    subgraph Cloudflare["Cloudflare Platform"]
        Pages["Pages Project<br/>spectrumtrader"]
        Cache["Cache<br/>Edge locations"]
        WAF["WAF<br/>DDoS protection"]
        Analytics["Analytics<br/>Performance"]
    end
    
    subgraph CDN["Global CDN"]
        Edge["Edge Servers<br/>Worldwide"]
    end
    
    subgraph Users["End Users"]
        Browser["Browser<br/>spectrumtrader.dev"]
    end
    
    Repo -->|Push to main| CI
    CI -->|Build dist/| Cloudflare
    Cloudflare -->|Cache static| Cache
    Cache -->|Distribute| Edge
    Edge -->|Serve static| Browser
    Browser -->|Analytics| Analytics
    
    style GitHub fill:#e3f2fd
    style CI fill:#f3e5f5
    style Cloudflare fill:#e8f5e9
    style CDN fill:#fff3e0
    style Users fill:#fce4ec
```

### Step 1: Prepare GitHub Repository

**1a. Create GitHub Repository**

```bash
git init
git add .
git commit -m "Initial commit: SpectrumTrader"
git remote add origin https://github.com/YOUR_USERNAME/SpectrumTrader.git
git branch -M main
git push -u origin main
```

**1b. Create `.github/workflows/build.yml`:**

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd client && npm ci
          cd ../server && npm ci
      
      - name: Type check
        run: |
          cd client && npm run type-check
          cd ../server && npm run type-check
      
      - name: Build frontend
        run: cd client && npm run build
        env:
          VITE_API_URL: https://api.spectrumtrader.dev
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: client-dist
          path: client/dist/
```

---

### Step 2: Create Cloudflare Pages Project

**2a. Sign up at Cloudflare**

- Go to [Cloudflare Pages](https://pages.cloudflare.com)
- Click "Create a project"
- Connect GitHub account

**2b. Configure Pages Project**

- **Project name:** `spectrumtrader`
- **Repository:** Select your GitHub repo
- **Branch:** `main`
- **Framework preset:** `Vite`
- **Build command:** `npm run build && cd client && npm run build`
- **Build output directory:** `client/dist`
- **Environment variables:**
  ```
  VITE_API_URL = https://api.spectrumtrader.dev
  NODE_ENV = production
  ```

---

### Step 3: Custom Domain Configuration

**3a. Add Custom Domain**

1. Go to Pages project settings
2. Click "Custom domains"
3. Add domain: `spectrumtrader.dev`
4. Choose subdomain routing

**3b. Update DNS Records**

Go to Cloudflare DNS settings:

```
Type    Name                Content              Priority
CNAME   spectrumtrader      spectrumtrader.pages.dev
```

Or use Cloudflare nameservers:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

---

### Step 4: Cloudflare Configuration

**4a. Enable Security**

1. **SSL/TLS:**
   - Mode: Full (strict)
   - Min TLS: 1.3

2. **DDoS Protection:**
   - Security level: High
   - Challenge passage: 30 minutes

3. **WAF (Web Application Firewall):**
   - Enable OWASP rules
   - Block:
     - SQL injection
     - XSS attacks
     - Local file inclusion

**4b. Caching Rules**

```
Rule 1:
- Condition: Path contains /api/
- Action: Bypass cache (dynamic)

Rule 2:
- Condition: Path contains /assets/
- Action: Cache 1 month
- Compress: Yes

Rule 3:
- Condition: Everything else
- Action: Cache 5 minutes
```

**4c. Page Rules**

```
URL: spectrumtrader.dev/*
- Caching level: Cache Everything
- Browser TTL: 4 hours
```

---

### Step 5: Environment & Build Configuration

**Create `wrangler.toml` (Cloudflare config):**

```toml
name = "spectrumtrader"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
routes = [
  { pattern = "spectrumtrader.dev", zone_id = "YOUR_ZONE_ID" }
]

[env.production]
vars = { ENVIRONMENT = "production" }
```

---

### Step 6: Deploy & Verify

**Automatic Deployment:**
```bash
git push origin main
# Cloudflare automatically builds and deploys
```

**Manual Deployment:**
```bash
npm run build
cd client
npm run build
# Cloudflare automatically detects and deploys
```

**Verify Deployment:**
```bash
# Check domain
curl -I https://spectrumtrader.dev

# Check DNS propagation
nslookup spectrumtrader.dev
dig spectrumtrader.dev

# Test API connectivity
curl https://spectrumtrader.dev/api/health
```

---

## 🔧 Backend Deployment

### Option 1: Railway.app (Recommended)

#### Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

#### Step 2: Configure Backend Service

**Create `railway.json`:**

```json
{
  "name": "SpectrumTrader API",
  "runtime": "nodejs",
  "buildCommand": "npm install && npm run build",
  "startCommand": "NODE_ENV=production npm start"
}
```

**Create `Procfile`:**

```
web: npm start
```

#### Step 3: Configure Environment Variables

In Railway dashboard:

```
DATABASE_URL = postgresql://user:pass@host:5432/spectrumtrader
NODE_ENV = production
PORT = 3000
API_KEY = your-secret-key
LOG_LEVEL = info
```

#### Step 4: Deploy

```bash
npm install -g @railway/cli
railway login
railway up
```

**Output:**
```
[OK] App deployed
[OK] Service URL: https://spectrumtrader-api.up.railway.app
```

---

### Option 2: Heroku

#### Step 1: Heroku Setup

```bash
npm install -g heroku
heroku login
heroku create spectrumtrader-api
```

#### Step 2: Add PostgreSQL

```bash
heroku addons:create heroku-postgresql:hobby-dev -a spectrumtrader-api
```

#### Step 3: Configure Environment

```bash
heroku config:set NODE_ENV=production -a spectrumtrader-api
heroku config:set API_KEY=your-secret -a spectrumtrader-api
```

#### Step 4: Deploy

```bash
git push heroku main
```

---

### Option 3: Self-Hosted (VPS)

#### Step 1: Provision VPS

**DigitalOcean/Linode/AWS EC2:**

```bash
# Ubuntu 22.04 LTS, 2GB RAM, $6/month
```

#### Step 2: SSH & Setup

```bash
ssh root@your.vps.ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx
```

#### Step 3: Clone & Configure

```bash
cd /srv
git clone https://github.com/YOUR_USERNAME/SpectrumTrader.git
cd SpectrumTrader/server

npm install
npm run build

# Create .env
cp .env.example .env
# Edit .env with production values
```

#### Step 4: Start with PM2

```bash
pm2 start npm --name "spectrumtrader-api" -- start
pm2 startup
pm2 save
```

#### Step 5: Configure Nginx

**Create `/etc/nginx/sites-available/spectrumtrader`:**

```nginx
server {
    listen 80;
    server_name api.spectrumtrader.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable & restart:**
```bash
ln -s /etc/nginx/sites-available/spectrumtrader /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 6: SSL Certificate (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.spectrumtrader.dev
```

---

## ⚙️ GitHub Actions CI/CD Pipeline

### Complete Workflow

**File: `.github/workflows/deploy.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd client && npm ci && cd ..
          cd server && npm ci && cd ..
          cd omnispectrum-backend && pip install -r requirements.txt && cd ..
      
      - name: Type check (TypeScript)
        run: |
          cd client && npm run type-check && cd ..
          cd server && npm run type-check && cd ..
      
      - name: Lint code
        run: |
          cd client && npm run lint && cd ..
          cd server && npm run lint && cd ..
        continue-on-error: true
      
      - name: Build frontend
        run: cd client && npm run build && cd ..
        env:
          VITE_API_URL: ${{ secrets.API_URL_PROD }}
      
      - name: Build backend
        run: cd server && npm run build && cd ..

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: spectrumtrader
          directory: client/dist
          productionBranch: main

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        run: |
          npx railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  notify:
    needs: [test, deploy-frontend, deploy-backend]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment Status: ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### CI/CD Pipeline Diagram

```mermaid
graph TB
    Push["Push to main"]
    
    subgraph Tests["Testing Phase"]
        TypeCheck["Type Check<br/>TypeScript"]
        Lint["Linting<br/>Code quality"]
        BuildClient["Build Frontend<br/>Vite bundle"]
        BuildServer["Build Backend<br/>Node.js bundle"]
    end
    
    subgraph Build["Build Phase"]
        DockerBuild["Docker Build<br/>Container image"]
        Registry["Push to Registry<br/>ghcr.io"]
    end
    
    subgraph Deploy["Deployment Phase"]
        Front["Frontend Deploy<br/>Cloudflare Pages"]
        Back["Backend Deploy<br/>Railway.app"]
        ML["ML Backend<br/>Auto-retrain"]
    end
    
    subgraph Verify["Verification"]
        HealthCheck["Health Check<br/>API endpoints"]
        Smoke["Smoke Tests<br/>Critical paths"]
    end
    
    Notify["Slack Notification<br/>Success/Failure"]
    
    Push --> TypeCheck
    Push --> Lint
    Push --> BuildClient
    Push --> BuildServer
    
    TypeCheck --> DockerBuild
    Lint --> DockerBuild
    BuildClient --> DockerBuild
    BuildServer --> DockerBuild
    
    DockerBuild --> Registry
    Registry --> Front
    Registry --> Back
    
    Front --> HealthCheck
    Back --> Smoke
    
    HealthCheck --> Notify
    Smoke --> Notify
    
    style Push fill:#e3f2fd
    style Tests fill:#f3e5f5
    style Build fill:#e8f5e9
    style Deploy fill:#fff3e0
    style Verify fill:#fce4ec
```

---

## 🔐 Environment Configuration

### Frontend Environment Variables

**File: `client/.env.production`**

```env
VITE_API_URL=https://api.spectrumtrader.dev
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=warn
```

### Backend Environment Variables

**File: `server/.env.production`**

```env
# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@host:5432/spectrumtrader
DATABASE_SSL=true

# API
API_KEY=your-production-api-key
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS
CORS_ORIGIN=https://spectrumtrader.dev

# ML Backend
ML_BACKEND_URL=http://localhost:8000
ML_BACKEND_API_KEY=your-ml-key
```

### ML Backend Environment Variables

**File: `omnispectrum-backend/.env.production`**

```env
# Data Fetching
YFINANCE_TIMEOUT=30
YFINANCE_RETRY_COUNT=5
CACHE_PATH=/data/cache

# Model Training
DEVICE=cuda  # or cpu
BATCH_SIZE=32
EPOCHS=100

# Inference
MODEL_PATH=/models
OUTPUT_PATH=/data/omnispectrum.json
```

---

## 🌐 Domain & DNS Setup

### DNS Records

**Primary domain: spectrumtrader.dev**

```
Type    Name                    Content                          TTL
A       @                       104.21.32.1                      3600
CNAME   www                     spectrumtrader.pages.dev         3600
CNAME   api                     spectrumtrader-api.up.railway.app 3600
CNAME   ml                      ml.spectrumtrader.dev            3600
CNAME   admin                   admin.spectrumtrader.dev         3600

MX      @                       10 mail.spectrumtrader.dev       3600
TXT     @                       "v=spf1 include:_spf.google.com ~all"
TXT     _dmarc                  "v=DMARC1; p=none"
```

### SSL Certificate

**Automatic (via Cloudflare):**
- Cloudflare provides free SSL
- Auto-renewal
- No action needed

**Manual (Let's Encrypt):**
```bash
certbot certonly --dns-cloudflare \
  -d spectrumtrader.dev \
  -d api.spectrumtrader.dev \
  -d *.spectrumtrader.dev
```

---

## ✅ Production Checklist

### Pre-Deployment

- [ ] All tests passing (CI/CD green)
- [ ] Type safety verified (TypeScript no errors)
- [ ] Code reviewed and approved
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Backups created
- [ ] Monitoring configured
- [ ] Alerting setup
- [ ] Documentation updated

### Frontend (Cloudflare Pages)

- [ ] Build command working
- [ ] Output directory correct
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate valid
- [ ] Cache rules configured
- [ ] WAF rules enabled
- [ ] Analytics enabled
- [ ] Performance monitored

### Backend (Railway/Heroku)

- [ ] Database connected
- [ ] Environment variables set
- [ ] Secrets stored securely
- [ ] Process manager running
- [ ] Health checks passing
- [ ] Logs configured
- [ ] Monitoring enabled
- [ ] Auto-scaling configured

### Security

- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection protected (Drizzle ORM)
- [ ] XSS prevention enabled
- [ ] CSRF tokens implemented
- [ ] API keys rotated
- [ ] Secrets not in version control

### Monitoring & Logging

- [ ] Uptime monitoring active
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring (NewRelic/DataDog)
- [ ] Log aggregation setup (ELK/CloudWatch)
- [ ] Alerts configured
- [ ] Dashboard created
- [ ] Incident response plan ready

### Performance

- [ ] Lighthouse score > 90
- [ ] Page load time < 2s
- [ ] API response time < 200ms
- [ ] Database queries optimized
- [ ] CDN cache configured
- [ ] Compression enabled (gzip/brotli)

### Backup & Disaster Recovery

- [ ] Database backups automated
- [ ] Code backups (GitHub)
- [ ] Configuration backups
- [ ] Recovery plan documented
- [ ] Restore testing done
- [ ] Incident response plan ready

---

## 📊 Post-Deployment Monitoring

### Key Metrics

```
Frontend Performance:
- Lighthouse score: 95+/100
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

Backend Performance:
- API response time: < 200ms (p95)
- Error rate: < 0.1%
- Uptime: > 99.9%
- Database connection pool: 60-80% utilized

ML Pipeline:
- Model accuracy: > 90%
- Inference time: < 2s
- Prediction freshness: < 5 min
```

### Monitoring Tools

1. **Uptime Monitoring:** UptimeRobot, Pingdom
2. **Error Tracking:** Sentry, BugSnag
3. **Performance:** Vercel Analytics, NewRelic
4. **Logging:** ELK Stack, CloudWatch
5. **APM:** DataDog, New Relic

---

## 🚨 Troubleshooting Deployment

### Issue 1: Build fails on Cloudflare

**Solution:**
```bash
# Test build locally
npm run build

# Check environment variables
echo $VITE_API_URL

# Verify build output
ls -la client/dist/
```

### Issue 2: Backend deployment fails

**Solution:**
```bash
# Test locally
npm run build
npm start

# Check logs
heroku logs -t -a spectrumtrader-api
railway up --log
```

### Issue 3: CORS errors in production

**Solution:**
```typescript
// Ensure backend CORS allows frontend domain
cors({
  origin: 'https://spectrumtrader.dev',
  credentials: true
})
```

### Issue 4: Database connection issues

**Solution:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
ps aux | grep postgres

# Verify SSL setting
echo $DATABASE_SSL
```

---

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Railway Docs](https://docs.railway.app/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Performance](https://react.dev/reference/react/useMemo)

---

**Last Updated:** November 16, 2025 | **Version:** 1.0.0 | **Status:** Production Ready ✅

**Deployment Team:** SpectrumTrader DevOps

**Key Contacts:**
- Frontend Lead: [Your Name]
- Backend Lead: [Your Name]
- DevOps Lead: [Your Name]

---

### Quick Links

- [Frontend README](../client/README.md)
- [Backend README](../omnispectrum-backend/README.md)
- [Server README](../server/README.md)
- [Main README](../README.md)
- [Quick Start](../QUICKSTART.md)
