# TN Land Tracker

A **free, read-only** public web application for searching Tamil Nadu land parcel records — no login required.

## What It Does

- Search land parcels by **survey number, patta number, owner name, or district/village**
- View **full parcel details**: patta, chitta, A-register, area (hectares + acres), land type, soil, water source
- View **current owner** name with relation as recorded in TN eServices
- View **Encumbrance Certificate (EC)** history — up to 30 years of registered transactions from TNREGINET
- View **FMB Sketch** — official plot boundary diagram, fetched from TN eServices and cached in Cloudflare R2
- View **Government Guideline Value** from TNREGINET (clearly labeled — NOT live market price)
- View **interactive map** with OpenStreetMap base + Bhuvan ISRO satellite/LULC layers
- Flag **Poramboke / Government land** parcels

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| Database | Supabase PostgreSQL (free tier) |
| Storage | Cloudflare R2 (FMB sketches) |
| Maps | Leaflet.js + OpenStreetMap + Bhuvan ISRO WMS |
| Hosting | Vercel (frontend) + Render (backend) |

**Total monthly cost: ₹0**

## Rules

- ✅ **Read-only** — no write endpoints exist anywhere
- ✅ **No authentication** — no login, no sessions
- ✅ **Tamil Nadu only** — strictly TN data scope
- ✅ **Free tier only** — Vercel, Render, Supabase, R2 all free
- ✅ **Cache-first** — Supabase is always queried before hitting government portals
- ❌ No admin panel, no blockchain, no market prices

## Folder Structure

```
tn-land-tracker/
├── frontend/        ← Next.js 14 App Router
├── backend/         ← FastAPI Python 3.11
└── supabase/        ← schema.sql + seed.sql
```

## Setup

### 1. Database (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run `supabase/schema.sql`
3. Run `supabase/seed.sql` to load sample data

### 2. Backend

```bash
cd backend
cp .env.example .env           # fill in your Supabase URL and R2 keys
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Sources

| Source | URL | Data |
|---|---|---|
| TN eServices | [eservices.tn.gov.in](https://eservices.tn.gov.in) | Patta, Chitta, A-Register, FMB Sketch |
| TNREGINET | [tnreginet.gov.in](https://tnreginet.gov.in) | EC records, Guideline Value |
| Bhuvan ISRO | [bhuvan.nrsc.gov.in](https://bhuvan.nrsc.gov.in) | Satellite imagery, LULC WMS |
| OpenStreetMap | [openstreetmap.org](https://openstreetmap.org) | Base map tiles |

## Disclaimers

1. Data sourced from TN eServices and TNREGINET. For informational purposes only.
2. Guideline Value is the Government-set rate — **NOT** the live market price.
3. FMB Sketch is the official diagram — **NOT** a GPS-accurate polygon.
4. Map location is approximate (village center). Exact GPS boundary not available.
5. Ownership history covers registered transactions only, up to 30 years.
6. **This is not an official government service.** Verify with the revenue/registration office for legal purposes.
