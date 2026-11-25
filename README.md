# FixCycle — Mobile Repair Marketplace & Doorstep Pickup Prototype

**FixCycle** is a modern, responsive web application prototype that connects smartphone owners with nearby mobile repair shops and provides doorstep pickup, quotation comparison, and simulated live repair & delivery tracking.

> **College Prototype Note:** All repair shops, sample prices, customer reviews, contact numbers, and live GPS tracking coordinates are demonstration data persisted locally in browser `localStorage`.

---

## Features Included

1. **Home Page (`/`)** — Clean startup landing page with Hero section, 5-step How It Works, Why FixCycle, 10 Popular Smartphone Brands, and Call to Action.
2. **Phone Brand & Model Selection (`/select-phone`)** — Interactive 3-step selector covering Apple, Samsung, OnePlus, Oppo, Vivo, Xiaomi, Realme, Google, Motorola, and Nothing with instant model search.
3. **Repair Problem Description (`/describe-problem`)** — 12 predefined multi-select problems, optional gallery/camera photo upload with validation (JPG/PNG/WebP, max 5 MB), pickup schedule, and approximate pickup location (demo presets, manual entry, or optional browser GPS).
4. **Interactive Nearby Shops Map (`/shops`)** — Free Leaflet + OpenStreetMap view with shop markers, recenter control, list/map mobile switcher, category & compatibility filters, sorting, and shop profile modal with sample reviews.
5. **Quotation Comparison (`/quotations`)** — Smart ranking engine ("Recommended" badge + independent sorting by rating, distance, price, repair time) and selectable pickup options (Shop Owner/Technician Pickup vs. Delivery Partner Pickup).
6. **Booking Confirmation (`/booking-confirmation/:id`)** — Displays Booking ID, quoted estimate vs. confirmed price distinction, pickup person card, and direct link to live tracking.
7. **Simulated Live Tracking (`/track/:id`)** — Smoothly animated pickup partner marker along a route polyline on Leaflet + OpenStreetMap, Play/Pause/Step controls, and 10-stage progress timeline.
8. **Customer Dashboard (`/my-bookings`)** — View active & completed bookings, progress bars, full timeline modal, and post-completion shop rating & review form.
9. **Shop Owner Dashboard (`/shop-dashboard`)** — Overview KPIs, incoming repair requests (with uploaded reference photos), live quotation submission/decline, confirmed inspection price entry, and booking status management.
10. **Delivery Partner Dashboard (`/delivery-dashboard`)** — Assigned pickup/return tasks, simulated route map, and step-by-step milestone updates synced live across all views.
11. **Role-Based Demo Login (`/login`)** — Instant switching between Customer, Shop Owner, and Delivery Partner roles via `localStorage`.
12. **About FixCycle (`/about`)** — Mission, privacy & trust principles, and engineering prototype architecture notes.

---

## Running Locally

```bash
npm install
npm run dev
```

Then open the local URL printed in the terminal (usually `http://localhost:5173`).

---

## Project Structure

```
src/
├── components/   # Reusable UI, Navbar, Footer, Modals, Leaflet MapView & TrackingMap
├── context/      # Shared FixCycleContext synced with localStorage
├── data/         # Modular sample data (brands, problems, shops, demoUsers, sampleBookings)
├── hooks/        # useLocalStorage custom hook
├── layouts/      # MainLayout wrapper
├── pages/        # All 12 application pages
├── utils/        # Distance, route simulation, formatting, and quotation ranking helpers
├── App.jsx       # Route definitions
└── main.jsx      # React entry point
```
