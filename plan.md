# TN Land Tracker — Master Agent Plan

---

## Rules for This Project

> **Any agent or developer working on this project must follow these rules without exception. No deviations.**

1. **READ-ONLY SYSTEM.** No write, update, delete, or insert endpoints from the user side. All data flows in one direction: from government sources → Supabase cache → frontend display.
2. **NO AUTHENTICATION.** No login, no user registration, no sessions, no JWT, no OAuth — nothing.
3. **NO ADMIN PANEL.** No approval workflows, no transfer workflows, no content management of any kind.
4. **NO BLOCKCHAIN.** No smart contracts, no wallet integration, no on-chain anything.
5. **TAMIL NADU ONLY.** Data scope is strictly Tamil Nadu. No other Indian state, no other country, no pan-India feature.
6. **GUIDELINE VALUE LABELING.** Guideline value must always be labeled as "Government Guideline Value." It must NEVER be called or implied to be market price.
7. **FMB SKETCH AS-IS.** FMB sketch is displayed exactly as downloaded from TN eServices. No GPS polygon rendering, no coordinate extraction, no GeoJSON conversion.
8. **MAP IS APPROXIMATE.** Map location is the village center point only. Never claim exact parcel GPS. Always show the disclaimer.
9. **FREE TIER ONLY.** Every service — Vercel, Render, Supabase, Cloudflare R2, Bhuvan, OSM — must remain on its free tier. No paid API keys, no paid hosting plans.
10. **CACHE IN SUPABASE.** Backend caches all scraped data in Supabase after the first fetch. The same land parcel is never scraped twice. Always check DB first before hitting any external portal.

---

## Project Summary

**TN Land Tracker** is a read-only, public-facing web application that lets anyone search and view land ownership details across Tamil Nadu — for free, with no login required.

It pulls data from three government sources (TN eServices, TNREGINET, Bhuvan ISRO), caches it in a Supabase PostgreSQL database, and presents it through a clean Next.js frontend with a Leaflet.js map.

The system covers: patta details, owner info, land type, area, ownership history (EC data up to 30 years), FMB sketch, guideline value, and satellite/land-use map view.

It does **NOT** support: registration, land transfer, document submission, admin workflows, user accounts, or any data outside Tamil Nadu.

Total monthly infrastructure cost: **₹0**.

---

## 11 Confirmed Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Survey & Patta Numbers** | Survey number, sub-division number, and patta number for each parcel |
| 2 | **Current Owner Name** | Full name of the current patta holder as recorded in TN eServices |
| 3 | **Land Area** | Area displayed in both hectares and acres simultaneously |
| 4 | **District → Taluk → Village Hierarchy** | Full administrative location chain for every parcel |
| 5 | **Land Type** | Nanjai (wet/irrigated), Punjai (dry), Nilam (soil type classification) |
| 6 | **Ownership History** | Full chain of ownership from TNREGINET EC, covering up to 30 years |
| 7 | **FMB Sketch** | Downloadable Field Measurement Book boundary diagram from TN eServices, displayed as-is |
| 8 | **Guideline Value** | Government-set rate from TNREGINET, clearly labeled as NOT live market price |
| 9 | **Encumbrance Certificate Details** | All registered transactions (sale, mortgage, gift deed) with party names, amounts, dates, SRO office |
| 10 | **Satellite + Land Use Map** | Leaflet.js map with OpenStreetMap base layer and Bhuvan ISRO WMS overlay (LULC layer toggleable) |
| 11 | **Poramboke / Govt Land Check** | Flag indicating whether the parcel is private land or government/poramboke land |

---

## Complete Tech Stack

| Layer | Tool | Role | Why Chosen |
|-------|------|------|------------|
| **Frontend Framework** | Next.js 14 (App Router) | Full frontend — pages, routing, SSR/CSR | Industry standard React framework; App Router gives clean layouts and server components |
| **Frontend Hosting** | Vercel (free tier) | Deploy and serve the Next.js app | Free for personal projects; unlimited deploys; zero config Next.js deploy |
| **Backend Framework** | FastAPI (Python 3.11) | REST API server — all 6 endpoints | Fast, async, auto-generates OpenAPI docs; Python ecosystem ideal for scraping |
| **Backend Hosting** | Render.com (free tier) | Host the FastAPI backend | Free 512MB RAM, 750 hrs/month; simple GitHub deploy |
| **Database** | Supabase PostgreSQL (free tier) | Store and cache all land parcel data | Free 500MB + 2GB bandwidth; managed Postgres with REST and direct connection |
| **File Storage** | Cloudflare R2 (free tier) | Cache FMB sketch images and EC PDFs | Free 10GB storage, 10M reads/month; no egress fees |
| **Maps** | Leaflet.js | Render interactive maps in the browser | Open source, lightweight, WMS-compatible |
| **Map Tiles — Base** | OpenStreetMap | Road network, place names, district labels | Free for non-commercial use, globally reliable |
| **Map Tiles — Satellite/LULC** | Bhuvan ISRO WMS | Satellite imagery + land use layer for Tamil Nadu | Completely free; LULC layer at 1:50,000 scale; direct WMS URL consumable in Leaflet |
| **Styling** | Tailwind CSS | UI styling across all components | Free, utility-first, zero runtime CSS overhead |
| **PDF Viewer** | react-pdf | Render FMB sketch PDFs inline in the browser | Open source npm package; no paid license |
| **HTTP Client (Frontend)** | Axios | Make API calls from Next.js to FastAPI | Clean API, interceptors, TypeScript support |
| **HTTP Client (Backend)** | httpx (Python) | Async HTTP calls to TN eServices and TNREGINET | Async-native, perfect for FastAPI; supports sessions and cookies |
| **Scraping Layer** | BeautifulSoup4 (Python) | Parse HTML responses from government portals | Mature, reliable HTML parser; pairs with httpx |
| **Environment Secrets** | python-dotenv | Load `.env` variables in FastAPI | Standard Python secrets management; keeps keys out of code |

---

## Database Schema — 4 Tables

> **Do not modify any column name, data type, or constraint. Use this SQL exactly.**

### Table 1: `land_parcels`

```sql
CREATE TABLE land_parcels (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patta_number          TEXT,
  survey_number         TEXT        NOT NULL,
  subdivision_number    TEXT,
  district              TEXT        NOT NULL,
  taluk                 TEXT        NOT NULL,
  village               TEXT        NOT NULL,
  area_hectares         DECIMAL,
  area_acres            DECIMAL,
  land_type             TEXT,
  land_nature           TEXT,
  soil_type             TEXT,
  water_source          TEXT,
  is_govt_land          BOOLEAN     DEFAULT false,
  poramboke_type        TEXT,
  guideline_value       DECIMAL,
  guideline_value_unit  TEXT        DEFAULT 'per sqft',
  fmb_sketch_url        TEXT,
  status                TEXT        DEFAULT 'active',
  last_synced_at        TIMESTAMP   DEFAULT NOW(),
  created_at            TIMESTAMP   DEFAULT NOW()
);
```

### Table 2: `owners`

```sql
CREATE TABLE owners (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT      NOT NULL,
  relation_type  TEXT,
  relative_name  TEXT,
  address        TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

### Table 3: `land_owner_map`

```sql
CREATE TABLE land_owner_map (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id       UUID      REFERENCES land_parcels(id),
  owner_id      UUID      REFERENCES owners(id),
  is_current    BOOLEAN   DEFAULT true,
  patta_number  TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### Table 4: `ownership_history`

```sql
CREATE TABLE ownership_history (
  id                UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id           UUID      REFERENCES land_parcels(id),
  transaction_type  TEXT,
  seller_name       TEXT,
  buyer_name        TEXT,
  transaction_date  DATE,
  document_number   TEXT,
  sro_office        TEXT,
  transaction_amount DECIMAL,
  deed_description  TEXT,
  ec_period_start   DATE,
  ec_period_end     DATE,
  created_at        TIMESTAMP DEFAULT NOW()
);
```

---

## API Design — 6 Read-Only Endpoints

> **All endpoints are GET only. No POST, PUT, PATCH, or DELETE endpoints exist anywhere in this system.**

### 1. `GET /land/search`

**Query Parameters:**
- `district` (optional) — e.g., `Chennai`
- `taluk` (optional) — e.g., `Egmore`
- `village` (optional)
- `survey_number` (optional) — e.g., `123`
- `patta_number` (optional) — e.g., `456`
- `owner_name` (optional) — e.g., `Ramesh`

**Returns:** List of matching land parcels with basic info (survey no, patta no, owner name, village, area, land type, status).

---

### 2. `GET /land/:id`

**Path Parameter:** `id` — UUID of the land parcel.

**Returns:** Full land parcel details covering all 11 features. Includes current owner resolved via `land_owner_map`.

---

### 3. `GET /land/:id/history`

**Path Parameter:** `id` — UUID of the land parcel.

**Returns:** All `ownership_history` records for that parcel, sorted oldest to newest. Source: Encumbrance Certificate data from TNREGINET.

---

### 4. `GET /land/:id/fmb`

**Path Parameter:** `id` — UUID of the land parcel.

**Returns:** FMB sketch URL. Logic: checks if URL already exists in Cloudflare R2 → returns immediately if cached. If not cached → fetches from TN eServices → uploads to R2 → saves URL in DB → returns URL.

---

### 5. `GET /land/:id/guideline-value`

**Path Parameter:** `id` — UUID of the land parcel.

**Returns:** Guideline value (decimal) + unit + mandatory label: `"Government Guideline Value only. Not live market price."`

---

### 6. `GET /land/map/geojson`

**Query Parameters:**
- `district` (optional) — filter pins by district

**Returns:** Basic lat/lon center points of parcels for map pin rendering. **No polygon data.** Location is village center point only.

---

## Frontend Pages — Complete Detail

### Page 1: Home / Search Page (`/`)

**Layout:** Full-width centered layout with a prominent search experience at the top.

**Components:**
- **Big Search Bar** — single input accepting survey number, patta number, owner name, or district+village combination. Fires `GET /land/search` on submit.
- **Cascading Filter Dropdowns** — three linked dropdowns: District → Taluk → Village. Selecting District filters Taluk options; selecting Taluk filters Village options. Values sourced from `constants.ts`.
- **Search Result Cards (LandCard)** — rendered below the search bar as a grid. Each card displays:
  - Survey Number
  - Patta Number
  - Owner Name
  - Village
  - Area (hectares + acres)
  - Land Type
  - Status badge (Active / Disputed / Govt/Poramboke)
  - Clicking any card navigates to `/land/[id]`

---

### Page 2: Land Detail Page (`/land/[id]`)

The core page of the application. Divided into seven named sections:

**Section A — Land Identity**
- Survey Number + Subdivision Number
- Patta Number
- District → Taluk → Village (full hierarchy)
- Land Status badge: Active / Disputed / Govt/Poramboke

**Section B — Land Measurements**
- Area in Hectares
- Area in Acres
- Land Type: Nanjai (wet) / Punjai (dry)
- Land Nature / Soil Type
- Water Source (if applicable)

**Section C — Current Owner**
- Owner Full Name
- Relation Type and Relative Name exactly as recorded in Patta (e.g., "Son of Rajan")

**Section D — Guideline Value**
- Guideline value displayed prominently
- Mandatory note below the value: *"This is the Government Guideline Value set by TNREGINET. This is NOT the live market price."*
- Rendered by the `GuidelineValueBadge` component

**Section E — Ownership History Timeline**
- Vertical visual timeline rendered by `OwnershipTimeline`
- Each entry shows: Seller → Buyer, Date, Transaction Type (sale / mortgage / gift deed), Document Number, SRO Office, Transaction Amount
- Source label: *"EC data covers up to 30 years of registered transactions."*
- Data sourced from `ownership_history` table (originally from TNREGINET EC)

**Section F — FMB Sketch**
- FMB sketch image or PDF displayed inline using `FMBViewer`
- Download button for the sketch file
- Label: *"Field Measurement Book (FMB) — Official plot boundary diagram from TN Revenue Department."*
- Image served from Cloudflare R2 URL

**Section G — Map View**
- `MapView` component with Leaflet.js
- OpenStreetMap base layer by default
- Bhuvan LULC WMS layer as toggleable overlay
- Single pin dropped at the land's approximate location (village center coordinates)
- Note: *"Exact GPS polygon not available. Location is approximate based on village coordinates."*

---

### Page 3: Map Explorer (`/map`)

**Layout:** Full-screen Leaflet map of Tamil Nadu.

**Components:**
- Map centered on Tamil Nadu (`[11.1271, 78.6569]`, zoom 7)
- All land parcels shown as pins (sourced from `GET /land/map/geojson`)
- Click any pin → popup showing: Survey No, Owner, Area, Land Type → "View Full Details" button linking to `/land/[id]`
- **Sidebar:** District filter dropdown to filter visible pins
- **Layer Toggle Control:** Switch between OSM base map / Bhuvan Satellite / Bhuvan LULC layer

---

### Page 4: About (`/about`)

**Sections:**
- What this system is and what it does
- Data source credits with links:
  - TN eServices — `eservices.tn.gov.in`
  - TNREGINET — `tnreginet.gov.in`
  - Bhuvan ISRO — `bhuvan.nrsc.gov.in`
  - OpenStreetMap
- All 6 UI disclaimers (see Disclaimers section below)
- Statement that this is not an official government service

---

## Complete Folder Structure

```
tn-land-tracker/
│
├── frontend/                             ← Next.js 14 App Router project
│   ├── app/
│   │   ├── page.tsx                      ← Home / Search page
│   │   ├── land/
│   │   │   └── [id]/
│   │   │       └── page.tsx              ← Land Detail page (dynamic route)
│   │   ├── map/
│   │   │   └── page.tsx                  ← Map Explorer page
│   │   └── about/
│   │       └── page.tsx                  ← About + disclaimers page
│   │
│   ├── components/
│   │   ├── SearchBar.tsx                 ← Main search input + submit handler
│   │   ├── LandCard.tsx                  ← Search result card component
│   │   ├── OwnershipTimeline.tsx         ← Vertical EC history timeline
│   │   ├── FMBViewer.tsx                 ← Inline FMB image/PDF viewer + download button
│   │   ├── MapView.tsx                   ← Leaflet map with OSM + Bhuvan WMS layers
│   │   ├── GuidelineValueBadge.tsx       ← Guideline value display with mandatory disclaimer label
│   │   └── LandDetailSection.tsx        ← Reusable section wrapper (title + content slot)
│   │
│   ├── lib/
│   │   ├── api.ts                        ← All Axios calls to the FastAPI backend
│   │   └── constants.ts                  ← Static lists: districts, taluks, villages of Tamil Nadu
│   │
│   ├── public/                           ← Static assets (icons, og image, etc.)
│   └── tailwind.config.ts                ← Tailwind CSS configuration
│
├── backend/                              ← FastAPI Python backend
│   ├── main.py                           ← App entry point; sets up CORS, mounts routers
│   ├── routers/
│   │   └── land.py                       ← All 6 read-only GET endpoints
│   ├── models/
│   │   └── land.py                       ← SQLAlchemy ORM models for all 4 tables
│   ├── schemas/
│   │   └── land.py                       ← Pydantic request/response schemas for all endpoints
│   ├── services/
│   │   ├── tneservices.py                ← Scraper: fetches Patta, Chitta, A-Register, FMB from TN eServices
│   │   ├── tnreginet.py                  ← Scraper: fetches EC data and guideline value from TNREGINET
│   │   └── r2_storage.py                ← Cloudflare R2 handler: upload FMB sketches, return CDN URL
│   ├── database.py                       ← Supabase PostgreSQL connection via asyncpg
│   ├── requirements.txt                  ← Python dependencies (fastapi, httpx, bs4, asyncpg, etc.)
│   └── .env                              ← Supabase URL, R2 keys — NEVER commit this file
│
└── supabase/
    ├── schema.sql                        ← All 4 CREATE TABLE statements (use exactly as written above)
    └── seed.sql                          ← 10–15 sample TN land records for local dev/testing
```

---

## Data Flow

### Flow 1 — Search Flow

1. User types a survey number / patta number / owner name / district+village into the search bar on `/`.
2. Frontend fires `GET /land/search?{params}` to the FastAPI backend on Render.
3. FastAPI queries Supabase PostgreSQL `land_parcels` table for matching records.
4. **Cache hit:** Records found in Supabase → return immediately as JSON → frontend renders cards.
5. **Cache miss:** No record in DB → FastAPI calls `tneservices.py` → scrapes TN eServices portal for the given survey number / patta details.
6. Scraped data is parsed by BeautifulSoup4 and saved into `land_parcels`, `owners`, and `land_owner_map` tables in Supabase.
7. Result is returned to frontend → rendered as `LandCard` components.
8. Subsequent searches for the same parcel skip scraping entirely — Supabase cache is the source of truth from this point.

---

### Flow 2 — Land Detail Page Load

1. User clicks a `LandCard` → navigates to `/land/[id]`.
2. Frontend fires `GET /land/:id` → FastAPI returns all parcel + owner data from Supabase. Sections A, B, C, D render immediately.
3. Frontend fires `GET /land/:id/history` → FastAPI checks `ownership_history` table.
   - **Cache hit:** Returns EC records from Supabase → `OwnershipTimeline` renders.
   - **Cache miss:** `tnreginet.py` fetches EC data from TNREGINET → parsed → saved to `ownership_history` → returned to frontend.
4. Frontend fires `GET /land/:id/fmb` → FastAPI checks if `fmb_sketch_url` exists in `land_parcels`.
   - **Cache hit (R2 URL present):** Returns URL directly → `FMBViewer` loads image/PDF from R2 CDN.
   - **Cache miss:** `tneservices.py` fetches FMB from TN eServices → `r2_storage.py` uploads it to Cloudflare R2 → R2 CDN URL saved to `fmb_sketch_url` in DB → URL returned → `FMBViewer` renders.
5. Map section (`Section G`) loads `MapView` → Leaflet renders OSM base tiles → Bhuvan LULC WMS streams live from ISRO — no download or caching needed. Pin dropped at village center lat/lon from `constants.ts`.

---

## Free Data Sources

### 1. TN eServices
- **URL:** `https://eservices.tn.gov.in`
- **Data Provided:**
  - Patta details: owner name, survey number, area, patta number
  - Chitta details: land type (wet/dry), soil nature, water source
  - A-Register extract: survey no, subdivision, patta no, area, tax details, soil type, land type, water resource, owner name
  - FMB Sketch: downloadable boundary diagram of the plot
  - TSLR (Town Survey Land Record): for urban land — block, ward, owner, land details
- **How Backend Fetches:** `tneservices.py` uses `httpx` (async HTTP) to POST form data to the portal and `BeautifulSoup4` to parse the HTML response tables.

---

### 2. TNREGINET
- **URL:** `https://tnreginet.gov.in`
- **Data Provided:**
  - Encumbrance Certificate (EC): all registered transactions on a land parcel up to 30 years — buyer/seller names, dates, amounts, deed type
  - Guideline Value: government-set value per zone/street
  - Document search: registered deeds searchable by document number or party name
- **How Backend Fetches:** `tnreginet.py` uses `httpx` with session handling to navigate the portal and `BeautifulSoup4` to extract EC table rows and guideline value data.

---

### 3. Bhuvan ISRO
- **URL:** `https://bhuvan.nrsc.gov.in` / WMS: `https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms`
- **Data Provided:**
  - Satellite imagery tile layer covering all of India including Tamil Nadu
  - Land Use / Land Cover (LULC) layer at 1:50,000 scale
- **How Backend Fetches:** NOT fetched by the backend. Bhuvan WMS tiles are streamed **live and directly** in the user's browser via Leaflet.js `L.tileLayer.wms()`. No server-side caching needed.

---

### 4. OpenStreetMap
- **URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Data Provided:** Road network, place names, district and village labels, base map tiles
- **How Backend Fetches:** NOT fetched by the backend. OSM tiles are streamed live directly in the browser via Leaflet.js `L.tileLayer()`.

---

## Bhuvan WMS Integration — Exact Leaflet.js Code

```javascript
// OSM base layer
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

// Bhuvan satellite layer (WMS)
const bhuvanSatellite = L.tileLayer.wms('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', {
  layers: 'india_hd',
  format: 'image/jpeg',
  transparent: false,
  attribution: '© ISRO Bhuvan'
});

// Bhuvan LULC land use layer (WMS)
const bhuvanLULC = L.tileLayer.wms('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', {
  layers: 'lulc:TN_LULC50K_1112',
  format: 'image/png',
  transparent: true,
  opacity: 0.6,
  attribution: '© ISRO Bhuvan LULC'
});

// Initialize map centered on Tamil Nadu
const map = L.map('map').setView([11.1271, 78.6569], 7);
osm.addTo(map);

// Layer toggle control
L.control.layers({
  "OpenStreetMap": osm,
  "Bhuvan Satellite": bhuvanSatellite
}, {
  "Land Use Layer": bhuvanLULC
}).addTo(map);
```

---

## 4-Week Build Order

> Track progress by checking off each task. Complete them in order — later weeks depend on earlier ones.

### Week 1 — Foundation

- [ ] Create Supabase project (free tier) and note the database URL and anon key
- [ ] Run `supabase/schema.sql` — create all 4 tables (`land_parcels`, `owners`, `land_owner_map`, `ownership_history`)
- [ ] Write `supabase/seed.sql` — insert 10–15 real TN land records (manually look up from `eservices.tn.gov.in`)
- [ ] Run seed.sql to populate the DB with test data
- [ ] Set up FastAPI project: `pip install fastapi uvicorn asyncpg httpx beautifulsoup4 python-dotenv`
- [ ] Write `backend/database.py` — connect FastAPI to Supabase PostgreSQL via asyncpg
- [ ] Write `backend/models/land.py` — SQLAlchemy ORM models for all 4 tables
- [ ] Write `backend/schemas/land.py` — Pydantic schemas for all 6 endpoint request/response shapes
- [ ] Write `backend/routers/land.py` — stub all 6 endpoints returning hardcoded seed data (no scraping yet)
- [ ] Write `backend/main.py` — mount router, configure CORS to allow `http://localhost:3000`
- [ ] Test all 6 endpoints with Postman or `curl` against seeded data
- [ ] Confirm all endpoints return correct shape and all 4 tables query correctly

---

### Week 2 — Frontend Core

- [ ] Initialise Next.js 14 project: `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] Write `frontend/lib/constants.ts` — full static list of TN districts, taluks, and villages
- [ ] Write `frontend/lib/api.ts` — Axios client with base URL pointing to FastAPI; one function per endpoint
- [ ] Build `SearchBar.tsx` — text input + submit handler that calls `api.searchLand()`
- [ ] Build cascading District → Taluk → Village dropdown filters on the home page
- [ ] Build `LandCard.tsx` — card layout showing survey no, patta no, owner, village, area, land type, status badge
- [ ] Wire home page (`app/page.tsx`) — search bar + dropdowns + results grid of `LandCard`
- [ ] Build `LandDetailSection.tsx` — reusable section wrapper with a title and a children slot
- [ ] Build Land Detail page (`app/land/[id]/page.tsx`) — call `GET /land/:id` and render Sections A, B, C
- [ ] Build `GuidelineValueBadge.tsx` — value display + hardcoded disclaimer text. Wire to Section D
- [ ] Build `OwnershipTimeline.tsx` — vertical timeline; call `GET /land/:id/history` and map entries. Wire to Section E
- [ ] Build `FMBViewer.tsx` — display FMB image/PDF using react-pdf; download button. Wire to Section F using `GET /land/:id/fmb`
- [ ] Add loading skeleton states to Search page and Land Detail page
- [ ] Add empty/error states: "Land not found", "Portal unavailable — try again later"

---

### Week 3 — Map + Data Layer

- [ ] Install Leaflet: `npm install leaflet react-leaflet` in frontend; fix Next.js dynamic import for SSR
- [ ] Build `MapView.tsx` — Leaflet map with OSM base layer + Bhuvan LULC WMS layer toggle. Wire to Section G on Land Detail page
- [ ] Build Map Explorer page (`app/map/page.tsx`) — full-screen map; call `GET /land/map/geojson` to load pins
- [ ] Add popup on each map pin: Survey No, Owner, Area, Land Type, "View Full Details" link
- [ ] Add District filter sidebar to Map Explorer page
- [ ] Write `backend/services/tneservices.py` — async httpx scraper for Patta, Chitta, A-Register, FMB from TN eServices; returns structured dict
- [ ] Write `backend/services/tnreginet.py` — async httpx scraper for EC records and guideline value from TNREGINET; returns structured dict
- [ ] Set up Cloudflare R2 bucket (free tier): note bucket name, account ID, access key, secret key
- [ ] Write `backend/services/r2_storage.py` — upload bytes to R2, return public CDN URL; use `boto3` with S3-compatible endpoint
- [ ] Integrate `tneservices.py` into `GET /land/search` — cache miss triggers scrape → save to Supabase → return
- [ ] Integrate `tnreginet.py` into `GET /land/:id/history` — cache miss triggers EC fetch → save to `ownership_history` → return
- [ ] Integrate `r2_storage.py` into `GET /land/:id/fmb` — cache miss triggers FMB fetch → upload to R2 → save URL in DB → return
- [ ] Test full end-to-end: search a real TN survey number → data scraped → cached → returned correctly

---

### Week 4 — Polish + Deploy

- [ ] Build `app/about/page.tsx` — what the system is, all data source credits with links, all 6 disclaimers
- [ ] Audit all pages: confirm every guideline value display has its disclaimer label
- [ ] Audit map page: confirm "approximate location" note is visible on every map view
- [ ] Audit FMB viewer: confirm "not GPS-accurate" label is present
- [ ] Add `robots.txt` and basic meta tags (title, description) to all pages
- [ ] Add `.env.example` to both `frontend/` and `backend/` with all required variable names (no values)
- [ ] Deploy backend to Render.com: connect GitHub repo, set env vars (`SUPABASE_URL`, `SUPABASE_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`), note the public URL
- [ ] Deploy frontend to Vercel: connect GitHub repo, set `NEXT_PUBLIC_API_URL` to the Render backend URL
- [ ] Run full end-to-end test on production: search → land detail → history → FMB → map → about
- [ ] Verify Bhuvan WMS layers load correctly in production (no CORS issues — it's client-side only)
- [ ] Verify Cloudflare R2 CDN URLs are publicly accessible
- [ ] Confirm Render free tier doesn't block requests (account for cold start on first hit after inactivity)
- [ ] Done ✅

---

## UI Disclaimers

> **These 6 disclaimers must appear verbatim in the application UI. They must be visible to every user.**

1. *"Data sourced from TN eServices (eservices.tn.gov.in) and TNREGINET (tnreginet.gov.in). This platform is for informational purposes only."*

2. *"Guideline Value shown is the Government-set rate from TNREGINET. It is NOT the live market price of the property."*

3. *"FMB Sketch is the official Field Measurement Book diagram. It is NOT a GPS-accurate polygon."*

4. *"Map location is approximate based on village coordinates. Exact parcel GPS boundary is not available."*

5. *"Ownership history covers registered transactions only, up to 30 years, as available in TNREGINET EC records."*

6. *"This is not an official government service. Always verify with the relevant revenue or registration office for legal purposes."*

**Placement:** All 6 disclaimers must appear on the `/about` page. Disclaimers 2, 3, 4, and 5 must additionally appear inline on the Land Detail page, adjacent to their respective sections (D, F, G, E respectively).

---

## Free Cost Breakdown

| Service | Free Tier Limit | Usage in This Project |
|---------|----------------|----------------------|
| Vercel | Unlimited personal deploys, 100GB bandwidth/mo | Frontend hosting |
| Render | 512MB RAM, 750 hrs/mo | FastAPI backend |
| Supabase | 500MB DB, 2GB bandwidth, 1GB file storage | PostgreSQL database |
| Cloudflare R2 | 10GB storage, 10M reads/mo | FMB sketch + EC PDF cache |
| Bhuvan WMS | Unlimited streaming | Live map tiles |
| OpenStreetMap | Unlimited for non-commercial | Base map tiles |
| TN eServices | Public portal, no rate limit stated | Land data source |
| TNREGINET | Public portal, free EC view | EC + guideline value source |

**Total monthly cost: ₹0**

---

## How to Start

> **Run these exact 3 commands first, then create this exact first file.**

### Commands

```bash
# 1. Clone / initialise the project root
mkdir tn-land-tracker && cd tn-land-tracker

# 2. Set up the FastAPI backend
mkdir backend && cd backend
pip install fastapi uvicorn asyncpg httpx beautifulsoup4 python-dotenv boto3

# 3. Initialise the Next.js frontend (from the project root)
cd ..
npx create-next-app@latest frontend --typescript --tailwind --app
```

### First File to Create

Create **`supabase/schema.sql`** with all 4 `CREATE TABLE` statements exactly as written in the Database Schema section above.

Then go to [supabase.com](https://supabase.com), create a free project, open the SQL editor, paste and run `schema.sql`. Your database is live — the project is ready to build.

**Next step after that:** Write `backend/database.py` to connect FastAPI to the Supabase PostgreSQL URL. Then stub all 6 endpoints in `backend/routers/land.py` returning the seeded data. That's your working skeleton.
