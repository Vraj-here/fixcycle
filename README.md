# FixCycle — Mobile Repair Marketplace with Doorstep Pickup, Repair & Live Tracking

**Live Website:** https://fixcycle-drab.vercel.app  
**Direct Device Selector:** https://fixcycle-drab.vercel.app/select-phone  
**Repository:** https://github.com/Vraj-here/fixcycle

FixCycle is a modern, mobile-first web application that connects smartphone owners with nearby mobile repair shops across **Pune, Maharashtra** — combining transparent multi-shop quotation comparison with doorstep pickup, repair progress updates, and simulated live delivery tracking.

> **Project Promise:** *"Find trusted repair shops. Compare prices. Get doorstep pickup. Track your repair. Get your phone back."*

---

## Problem Statement & Vision

When a smartphone breaks, users usually have to visit multiple local repair shops manually, guess fair pricing, and leave an expensive device with an unfamiliar counter.

**FixCycle solves this by enabling customers to:**
- Select their smartphone brand and model from **20 major brands (422+ models, including 2025–2026 launches)**.
- Describe one or more hardware/software issues and optionally attach a reference photograph.
- Discover nearby **Pune, Maharashtra** repair shops on an interactive **OpenStreetMap** view — clearly distinguishing **Independent Repair Shops** from **Brand-Authorized Service Centres**.
- Request and compare multiple transparent quotations ranked by rating, distance, estimated price, and turnaround time.
- Choose between **Shop Owner / Technician Pickup** or **Delivery Partner Pickup**.
- Track the complete **10-stage repair and return delivery lifecycle** live on a map.

*(FixCycle is strictly a transparent repair marketplace — not a phone-selling or device-exchange platform.)*

---

## Key Features

### 1. Customer Repair Workflow
- **Home Page (`/`)** — Minimalist startup hero, interactive quotation & pickup preview card, 5-step **How It Works**, **Why FixCycle**, 20 clickable brand shortcuts, and responsive navigation.
- **Phone Brand & Model Selector (`/select-phone`)** — Covers **20 smartphone brands** and **422+ models** including the latest 2025–2026 releases (`Nothing Phone (3)` / `(4a)` / `(3a)`, `iPhone 18` / `17` / `Air`, `Galaxy S26` / `Z Fold 8` / `S25`, `OnePlus 15` / `13s` / `Nord 6`, `Pixel 11` / `10`, `Xiaomi 17` / `15 Ultra` / `Redmi Note 15`, `Vivo X300` / `V60`, `Oppo Find X9` / `Reno 16`, `Realme GT 8` / `15 Pro`, `Motorola Edge 70` / `Razr 60`, `iQOO 16` / `15`, `POCO F7` / `X8`, `Honor Magic 7`, `ASUS ROG Phone 9`, `Sony Xperia 1 VIII`, `HMD Vibe 2`, `Lava Agni 4`, `Infinix GT 50 Pro`, `Tecno Camon 40`, `Huawei Mate 80`). Includes instant search plus a custom model entry fallback.
- **Describe Your Problem (`/describe-problem`)** — Multi-select across 12 predefined issues, optional gallery/camera photo upload with client-side validation (JPG/PNG/WebP, max 5 MB), preferred pickup date/time slot, Pune neighborhood presets, manual area entry, and optional browser GPS permission.
- **Interactive Pune Map & Nearby Shops (`/shops`)** — Built with **Leaflet + OpenStreetMap** (100% free, zero paid map APIs), centered on **Pune, Maharashtra** (`18.5204, 73.8567`) across 8 Pune neighborhoods (`FC Road / Shivajinagar`, `Kothrud`, `Koregaon Park`, `Baner`, `Viman Nagar`, `Hinjewadi`, `Hadapsar`, `Wakad`) and 8 sample Pune repair shops. Includes mobile `Map | List | Both` toggle, recenter button, category & compatibility filters, sorting, and a shop profile modal with sample customer reviews.
- **Quotation Comparison Engine (`/quotations`)** — Simulates 3–7 quotations per request, computes a transparent **Recommended** score (rating, price, distance, repair speed, pickup availability), supports independent sorting, and lets customers pick their preferred pickup method and inspect the assigned pickup person.
- **Booking Confirmation (`/booking-confirmation/:id`)** — Generates a unique Booking ID (`FC-2026-xxxx`), distinguishes indicative estimates from final post-inspection prices, and links straight to live tracking.
- **Simulated Live Tracking (`/track/:id`)** — Displays customer pickup pin, shop location, dashed Pune route polyline, smoothly animated pickup marker with Play/Pause/Next Stage/Restart controls, and a **10-stage timeline** (`Booking confirmed` → `Phone delivered`).
- **Customer Dashboard (`/my-bookings`)** — Active booking progress bars, full timeline modal, completed repair history, and an interactive post-completion **Rate & Review Shop** form.

### 2. Partner Portals & Security
- **Secure Role-Based Authentication (`/login`)** — Clean **Sign In / Create Account** flow supporting `Customer`, `Shop Owner`, and `Delivery Partner` roles. Uses per-user random salt + **SHA-256 password hashing** (`src/utils/auth.js`), strict email/password validation, generic authentication errors, and brute-force lockout after 5 failed attempts. No hardcoded credentials or login bypass info are exposed anywhere on the site.
- **Protected Partner Dashboards** — Wrapped in `ProtectedRoute` so unauthenticated visitors cannot access partner views:
  - **Shop Owner Dashboard (`/shop-dashboard`)** — Overview KPIs, incoming repair requests (with uploaded damage photos), live quotation submission/decline, confirmed final price entry, and repair status updates synced to customer tracking.
  - **Delivery Partner / Technician Dashboard (`/delivery-dashboard`)** — Assigned pickup & return delivery tasks, simulated Pune route map, and step-by-step handover milestone controls.
- **Production Security Headers (`vercel.json`)** — Configured with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.

### 3. Serverless API Endpoints (Vercel)
- `GET /api/health` — Live API health & region status (`Pune, Maharashtra, India`).
- `GET /api/catalog` — Public JSON catalog returning Pune areas, 20 smartphone brands (422 models), and sample repair shop listings.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend Framework | React 18 + Vite 5 (code-split chunks) |
| Styling & Icons | Tailwind CSS 3 + Lucide React + Inter Typography |
| Routing | React Router v6 |
| Interactive Maps | Leaflet + OpenStreetMap (free, no API key required) |
| State & Persistence | React Context + Browser `localStorage` |
| Auth Security | Web Crypto API (Per-user Salted SHA-256) |
| Hosting & Serverless API | Vercel (`vercel.json` + `/api/*` functions) |

---

## Project Structure

```text
fixcycle/
├── api/                         # Vercel Serverless API routes
│   ├── health.js                # GET /api/health
│   └── catalog.js               # GET /api/catalog
├── public/
│   └── _redirects               # SPA fallback support for static hosts
├── scripts/
│   └── verify-app.mjs           # Automated security, catalog, map & API test suite
├── src/
│   ├── components/              # Navbar, Footer, MapView, TrackingMap, Modals, ProtectedRoute
│   ├── context/                 # FixCycleContext (state, auth, bookings, quotations, reviews)
│   ├── data/                    # brands.js (20 brands, 422 models), problems.js, shops.js (Pune)
│   ├── hooks/                   # useLocalStorage.js
│   ├── layouts/                 # MainLayout.jsx
│   ├── pages/                   # All 12 application pages
│   ├── utils/                   # auth.js, helpers.js, quotationEngine.js
│   ├── App.jsx                  # Route definitions & role-based guards
│   ├── index.css                # Tailwind directives & Leaflet custom styling
│   └── main.jsx                 # React entry point
├── .env.example                 # Safe environment variable guidelines
├── .gitignore                   # Excludes .env*, .vercel, node_modules, dist
├── .vercelignore                # Clean Vercel upload filter
├── netlify.toml                 # Optional Netlify SPA & header config
├── vercel.json                  # Vercel SPA rewrites & HTTP security headers
├── vite.config.js               # LAN host exposure (mobile browser testing) + code splitting
└── package.json
```

---

## Running Locally (Desktop & Mobile Browser)

### Prerequisites
- Node.js 18+ and npm

### 1. Install dependencies & run
```bash
npm install
npm run dev
```

Vite is configured with `host: true`, so it prints **both** URLs:
- **Desktop Browser:** `http://localhost:5173/`
- **Mobile Browser (Android / iPhone on the same Wi-Fi):** `http://<your-local-ip>:5173/`

### 2. Run automated verification tests
```bash
npm test
```
Verifies:
- Zero hardcoded API keys, secrets, or exposed login info
- Salted SHA-256 auth hashing & validation
- All 20 smartphone brands & 422+ models
- Pune, Maharashtra coordinates & strict Authorized vs. Independent shop integrity
- Quotation ranking across every brand & multi-problem bundles
- Route interpolation, timeline stages, React Router links, and Vercel API handlers

### 3. Build for production
```bash
npm run build
```

---

## Deploying to Vercel

FixCycle is preconfigured for Vercel via `vercel.json` (zero paid API keys required):

```bash
npx vercel login
npx vercel --prod
```

---

## Prototype Transparency & Academic Notes

This project was designed as a **first-year engineering college project** with a zero-budget, beginner-friendly architecture:
- All repair shop listings, sample prices, customer reviews, staff contact numbers, and GPS movement on the tracking map are **clearly labeled demonstration data**.
- A full commercial launch would add a managed database (e.g., PostgreSQL), server-side JWT/OAuth sessions, verified shop KYC onboarding, real-time WebSocket GPS tracking, and insured device transit.

---

## License

Built for educational and demonstration purposes. Maps powered by [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/) contributors.
