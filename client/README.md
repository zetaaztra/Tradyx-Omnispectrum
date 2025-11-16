# SpectrumTrader - React Frontend Dashboard

Real-time NIFTY50 trading signals dashboard. Displays 14 AI-generated trading tiles with predictive confidence scores, market indicators, and technical charts. Built with React, Vite, TypeScript, and Tailwind CSS.

---

## 📊 Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.6.3 | Type safety |
| **Vite** | 5.4.11 | Build tool & dev server |
| **Tailwind CSS** | 3.4.17 | Styling framework |
| **Shadcn/ui** | Latest | Component library |
| **TanStack Query** | 5.60.5 | Data fetching & caching |
| **React Hook Form** | 7.53.1 | Form state management |
| **Chart.js** | 4.4.8 | Chart rendering |
| **Recharts** | 2.14.0 | React chart library |
| **Zod** | 3.24.1 | Schema validation |
| **js-cookie** | 3.0.5 | Cookie management |

---

## 🎨 Frontend Architecture

### Component Hierarchy

```mermaid
graph TD
    App["App.tsx<br/>Root component"]
    
    subgraph Layout["Layout Components"]
        Header["dashboard-header.tsx<br/>Navigation, theme toggle"]
        Footer["dashboard-footer.tsx<br/>Footer info"]
    end
    
    subgraph Pages["Pages"]
        Dashboard["dashboard.tsx<br/>Main 14-tile grid"]
        About["about.tsx"]
        Cookies["cookies.tsx"]
        Privacy["privacy.tsx"]
        Terms["terms.tsx"]
        Disclaimer["disclaimer.tsx"]
    end
    
    subgraph TileComponents["Trading Signal Tiles (8)"]
        Tile1["tile-composite-summary.tsx<br/>Overall market direction"]
        Tile2["tile-directional-tilt.tsx<br/>Trend analysis"]
        Tile3["tile-envelope.tsx<br/>Price envelopes"]
        Tile4["tile-multiday.tsx<br/>Multi-day patterns"]
        Tile5["tile-option-radar.tsx<br/>Option chain signals"]
        Tile6["tile-pattern-match.tsx<br/>Historical patterns"]
        Tile7["tile-range.tsx<br/>Support/resistance"]
        Tile8["tile-tomorrow.tsx<br/>Next-day forecast"]
    end
    
    subgraph UIComponents["UI Components"]
        Card["card.tsx"]
        Badge["badge.tsx"]
        Button["button.tsx"]
        Chart["chart.tsx"]
        Dialog["dialog.tsx"]
        Alert["alert.tsx"]
    end
    
    subgraph Modals["Modal Components"]
        CookieModal["consent-cookie-modal.tsx"]
        DisclaimerModal["consent-disclaimer-modal.tsx"]
        ExplainModal["tile-explanation-modal.tsx"]
        HowToUse["how-to-use-section.tsx"]
    end
    
    subgraph Hooks["Custom Hooks"]
        UseMobile["use-mobile.tsx<br/>Responsive detection"]
        UseToast["use-toast.ts<br/>Notification system"]
    end
    
    subgraph DataLayer["Data & State"]
        QueryClient["queryClient.ts<br/>TanStack Query config"]
        ThemeProvider["theme-provider.tsx<br/>Light/dark mode"]
        Utils["utils.ts<br/>Helper functions"]
    end
    
    App --> Header
    App --> Dashboard
    App --> Pages
    App --> Footer
    
    Dashboard --> TileComponents
    TileComponents --> UIComponents
    
    Dashboard --> Modals
    Modals --> UIComponents
    
    Dashboard --> Hooks
    Hooks --> DataLayer
    
    Dashboard --> DataLayer
    
    style App fill:#e3f2fd,stroke:#1976d2
    style Layout fill:#f3e5f5,stroke:#7b1fa2
    style Pages fill:#fff3e0,stroke:#f57c00
    style TileComponents fill:#e8f5e9,stroke:#388e3c
    style UIComponents fill:#fce4ec,stroke:#c2185b
    style Modals fill:#f1f8e9,stroke:#558b2f
    style Hooks fill:#e0f2f1,stroke:#00796b
    style DataLayer fill:#f0f4c3,stroke:#9e9d24
```

---

## 🎯 Trading Tiles Overview

### Tile 1: Composite Summary (Fusion MLP)

**Signal Type:** Primary direction indicator  
**Accuracy:** 90.8%  
**Input:** 78 fused features from 5 ML models  
**Output:** Bearish | Neutral | Bullish

**Visual:**
- Green card = Bullish (next day return > +0.5%)
- Gray card = Neutral (-0.5% ≤ return ≤ +0.5%)
- Red card = Bearish (return < -0.5%)
- Confidence bar (0-100%)

**Formula:**
```
class = argmax(Softmax(Fusion_MLP(features)))
confidence = max(Softmax_output)
```

---

### Tile 2: Directional Tilt

**Signal Type:** Trend direction  
**Calculation:** EMA crossover + momentum  
**Formula:**
```
EMA_12 = EMA(close, span=12)
EMA_26 = EMA(close, span=26)
tilt = "UP" if EMA_12 > EMA_26 else "DOWN"
momentum = (EMA_12 - EMA_26) / EMA_26 * 100
```

**Visual:** Up/down arrows with momentum percentage

---

### Tile 3: Price Envelopes

**Signal Type:** Volatility & support/resistance  
**Formula:**
```
SMA_20 = Simple Moving Average (20 days)
Envelope = ±2% of SMA_20
Upper = SMA_20 * 1.02
Lower = SMA_20 * 0.98
current_position = (price - Lower) / (Upper - Lower)
```

**Visual:** Price position within envelope (0-100%)

---

### Tile 4: Multi-Day Pattern

**Signal Type:** Multi-day continuation/reversal  
**Logic:**
- Green: 3-day uptrend continues
- Red: 3-day downtrend continues
- Yellow: Reversal expected

---

### Tile 5: Option Radar

**Signal Type:** Option chain sentiment  
**Calculation:**
```
IV_Call = Implied Volatility (calls)
IV_Put = Implied Volatility (puts)
IV_Spread = IV_Call - IV_Put
Put_Call_Ratio = Volume_Puts / Volume_Calls
```

**Signal:**
- If IV_Spread > 0: Calls expensive (bearish)
- If IV_Spread < 0: Puts expensive (bullish)

---

### Tile 6: Pattern Match

**Signal Type:** Historical pattern similarity  
**Method:**
- Current 20-day pattern matched against historical data
- Similarity score (0-100%)
- Shows most similar historical periods and their outcomes

---

### Tile 7: Range Analysis

**Signal Type:** Support & resistance levels  
**Formula:**
```
High_52w = 52-week high
Low_52w = 52-week low
Range = High_52w - Low_52w
Position = (current_price - Low_52w) / Range
```

**Visual:** Price position in historical range (0-100%)

---

### Tile 8: Tomorrow Forecast

**Signal Type:** Next-day price prediction  
**Model:** LightGBM volatility classifier  
**Output:**
- Predicted volatility level
- Expansion/contraction status
- Expected move (%)

---

### Tile 9: RSI Oscillator

**Formula:**
```
RS = avg(gains, 14) / avg(losses, 14)
RSI = 100 - (100 / (1 + RS))
```

**Levels:**
- RSI > 70: Overbought (potential sell)
- RSI < 30: Oversold (potential buy)
- 30-70: Normal range

---

### Tile 10-14: Additional Signals (VIX, Breadth, Sector Rotation, etc.)

Each tile represents a different market perspective for comprehensive trading analysis.

---

## 🏗️ Data Flow Diagram

```mermaid
graph LR
    API["Backend API<br/>/api/data"]
    
    subgraph Client["React Application"]
        subgraph State["State Management"]
            Query["TanStack Query<br/>Data caching"]
        end
        
        subgraph Components["Component Layer"]
            Dashboard["Dashboard Page"]
            Tiles["Tile Components<br/>8+ tiles"]
            UI["UI Components<br/>Card, Chart, Badge"]
        end
        
        subgraph Rendering["Rendering"]
            Charts["Chart.js/Recharts"]
            Tailwind["Tailwind CSS"]
            Theme["Light/Dark Theme"]
        end
    end
    
    Display["Browser Display<br/>14-tile dashboard"]
    
    API -->|omnispectrum.json| Query
    Query -->|Data| Components
    Components -->|Chart data| Charts
    Charts -->|Styled| Tailwind
    Tailwind -->|Theme applied| Theme
    Theme -->|Final HTML| Display
    
    style API fill:#e3f2fd
    style State fill:#f3e5f5
    style Components fill:#e8f5e9
    style Rendering fill:#fff3e0
    style Display fill:#c8e6c9
```

---

## 📁 Directory Structure

```
client/
├── src/
│   ├── App.tsx                          # Main app component
│   ├── main.tsx                         # React DOM root
│   ├── index.css                        # Global styles
│   │
│   ├── pages/
│   │   ├── dashboard.tsx                # Main 14-tile dashboard
│   │   ├── about.tsx                    # About page
│   │   ├── cookies.tsx                  # Cookie policy
│   │   ├── privacy.tsx                  # Privacy policy
│   │   ├── terms.tsx                    # Terms of service
│   │   ├── disclaimer.tsx               # Trading disclaimer
│   │   └── not-found.tsx                # 404 page
│   │
│   ├── components/
│   │   ├── dashboard-header.tsx         # Navigation bar
│   │   ├── dashboard-footer.tsx         # Footer
│   │   ├── how-to-use-section.tsx      # Tutorial modal
│   │   ├── consent-cookie-modal.tsx    # Cookie consent
│   │   ├── consent-disclaimer-modal.tsx # Trading disclaimer
│   │   ├── tile-explanation-modal.tsx  # Tile info modal
│   │   │
│   │   └── tiles/
│   │       ├── tile-composite-summary.tsx    # Fusion MLP output (90.8% accuracy)
│   │       ├── tile-directional-tilt.tsx    # EMA crossover
│   │       ├── tile-envelope.tsx            # Bollinger bands
│   │       ├── tile-multiday.tsx            # Multi-day pattern
│   │       ├── tile-option-radar.tsx        # Option sentiment
│   │       ├── tile-pattern-match.tsx       # Historical patterns
│   │       ├── tile-range.tsx               # Support/resistance
│   │       └── tile-tomorrow.tsx            # Next-day forecast
│   │
│   ├── ui/
│   │   ├── accordion.tsx                # Accordion component
│   │   ├── alert.tsx                    # Alert box
│   │   ├── badge.tsx                    # Status badge
│   │   ├── button.tsx                   # Button component
│   │   ├── card.tsx                     # Card layout
│   │   ├── chart.tsx                    # Chart wrapper
│   │   ├── dialog.tsx                   # Modal dialog
│   │   ├── dropdown-menu.tsx            # Dropdown menu
│   │   ├── input.tsx                    # Input field
│   │   ├── label.tsx                    # Form label
│   │   ├── popover.tsx                  # Popover component
│   │   ├── progress.tsx                 # Progress bar
│   │   ├── select.tsx                   # Select dropdown
│   │   ├── skeleton.tsx                 # Loading skeleton
│   │   ├── switch.tsx                   # Toggle switch
│   │   ├── tabs.tsx                     # Tab navigation
│   │   └── [more ui components...]      # Shadcn/ui components
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx               # Mobile breakpoint detection
│   │   └── use-toast.ts                 # Toast notification hook
│   │
│   ├── lib/
│   │   ├── utils.ts                     # Utility functions (cn, formatting)
│   │   ├── queryClient.ts               # TanStack Query config
│   │   ├── theme-provider.tsx           # Light/dark mode provider
│   │   └── consent.ts                   # Cookie consent logic
│   │
│   └── index.html                       # HTML entry point
│
├── public/                              # Static assets
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite config
├── tailwind.config.ts                   # Tailwind config
├── postcss.config.js                    # PostCSS config
└── README.md                            # This file
```

---

## 🚀 Development Setup

### Step 1: Install Dependencies

```bash
cd client
npm install
```

**Key Packages:**
```json
{
  "react": "18.3.1",
  "typescript": "5.6.3",
  "vite": "5.4.11",
  "tailwindcss": "3.4.17",
  "@tanstack/react-query": "5.60.5",
  "react-hook-form": "7.53.1",
  "chart.js": "4.4.8",
  "recharts": "2.14.0"
}
```

---

### Step 2: Development Server

```bash
npm run dev
```

**Output:**
```
VITE v5.4.11  ready in 345 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Open `http://localhost:5173` in browser.

---

### Step 3: Build for Production

```bash
npm run build
```

**Output:**
```
vite v5.4.11 building for production...
✓ 1234 modules transformed.
dist/index.html                    1.45 kB │ gzip:   0.95 kB
dist/assets/index-a1b2c3d4.js    124.56 kB │ gzip:  41.23 kB
dist/assets/index-e5f6g7h8.css     89.34 kB │ gzip:  18.92 kB
```

---

### Step 4: Preview Production Build

```bash
npm run preview
```

---

## 🎨 Theming & Customization

### Light/Dark Mode

**Location:** `src/lib/theme-provider.tsx`

**Toggle:**
```tsx
// In dashboard-header.tsx
<button onClick={() => toggleTheme()}>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

**Tailwind Colors (light mode):**
```
Background: white
Text: black
Cards: gray-50
Borders: gray-200
Accents: blue-600
```

**Tailwind Colors (dark mode):**
```
Background: gray-950
Text: white
Cards: gray-900
Borders: gray-800
Accents: blue-400
```

---

### Color Scheme for Signals

```
✓ Bullish → Green (#10b981)
⚠ Neutral → Gray (#6b7280)
✗ Bearish → Red (#ef4444)
ℹ Info   → Blue (#3b82f6)
⚡ Alert → Amber (#f59e0b)
```

---

## 📊 Data Fetching (TanStack Query)

### Configuration

**File:** `src/lib/queryClient.ts`

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 10,        // 10 minutes
      retry: 3,
      retryDelay: (attempt) => 
        Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});
```

### Fetching Predictions

**In component:**
```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['predictions'],
  queryFn: async () => {
    const res = await fetch('/api/data');
    return res.json();
  },
  staleTime: 1000 * 60 * 5,  // 5 min cache
});
```

---

## 📋 Form Handling (React Hook Form + Zod)

### Example: Contact Form

```tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
});

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = 
    useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 📈 Charts & Visualization

### Chart.js Example

```tsx
import { Chart as ChartJS, Line, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(Line, Title, Tooltip, Legend);

export function PriceChart({ data }) {
  return (
    <Line
      data={{
        labels: data.dates,
        datasets: [{
          label: 'Price',
          data: data.prices,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        }],
      }}
      options={{
        responsive: true,
        plugins: {
          title: { display: true, text: 'Price Chart' },
        },
        scales: {
          y: { beginAtZero: false },
        },
      }}
    />
  );
}
```

### Recharts Example

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export function SimpleChart({ data }) {
  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="price" stroke="#3b82f6" />
    </LineChart>
  );
}
```

---

## 🔐 Environment Variables

**File:** `.env.local`

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=true
```

**Usage in code:**
```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## ✅ Scripts & Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run type-check` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'react'"
**Solution:** Install dependencies
```bash
npm install
```

### Issue 2: Dev server port 5173 already in use
**Solution:** Use different port
```bash
npm run dev -- --port 5174
```

### Issue 3: "Type error in TSX file"
**Solution:** Check tsconfig.json
```bash
npm run type-check
```

### Issue 4: Tailwind styles not loading
**Solution:** Clear Tailwind cache
```bash
npx tailwindcss init --full
npm run dev
```

### Issue 5: CORS errors when fetching from backend
**Solution:** Check backend CORS configuration
```tsx
// Ensure backend has CORS enabled:
// Access-Control-Allow-Origin: *
```

---

## 🔄 Integration with Backend

### API Endpoint

**Backend provides:**
```
GET /api/data → omnispectrum.json
```

**Response format:**
```json
{
  "tiles": [
    {
      "id": "composite_summary",
      "signal": "BULLISH",
      "confidence": 0.908,
      "details": {...}
    },
    ...
  ]
}
```

### Frontend consumption:
```tsx
const { data: predictions } = useQuery({
  queryKey: ['predictions'],
  queryFn: () => fetch('/api/data').then(r => r.json()),
  refetchInterval: 60000,  // Refresh every minute
});
```

---

## 📦 Build Output

**Production bundle size:**
- JavaScript: ~120 KB (gzipped ~40 KB)
- CSS: ~90 KB (gzipped ~19 KB)
- Total: ~210 KB (gzipped ~59 KB)

**Performance:**
- Lighthouse Score: 95/100 (desktop)
- First Contentful Paint: ~0.8s
- Largest Contentful Paint: ~1.2s
- Cumulative Layout Shift: <0.1

---

## 🚀 Deployment

See main `README.md` for Cloudflare Pages deployment steps.

**Quick deployment:**
```bash
npm run build
# Deploy dist/ folder to hosting
```

---

## 📚 Component Library (Shadcn/ui)

All Shadcn/ui components available in `src/ui/`:

- Accordion, Alert, Avatar, Badge, Breadcrumb
- Button, Card, Carousel, Chart, Checkbox
- Command, Context Menu, Dialog, Drawer
- Dropdown Menu, Form, Hover Card, Input
- Label, Menubar, Navigation Menu, Pagination
- Popover, Progress, Radio Group, Scroll Area
- Select, Skeleton, Switch, Table, Tabs
- Textarea, Toggle, Tooltip, & more

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button onClick={() => {}}>Click me</Button>
```

---

## 🎯 Best Practices

1. **Use TanStack Query for data fetching** - automatic caching & revalidation
2. **Keep components small** - max 300 lines per component
3. **Use TypeScript** - catch errors at compile time
4. **Responsive design** - use Tailwind breakpoints (sm, md, lg, xl)
5. **Accessibility** - add aria labels, semantic HTML
6. **Performance** - lazy load routes with React.lazy()
7. **Theme consistency** - use Tailwind theme tokens

---

**Last Updated:** November 16, 2025 | **Version:** 1.0.0 | **Status:** Production Ready ✅

**Team:** SpectrumTrader Frontend

**Links:**
- Backend README: `../omnispectrum-backend/README.md`
- Server README: `../server/README.md`
- Main README: `../README.md`
