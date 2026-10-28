# 🦅 Eagles Eye — Engineering, Architecture & Integration Report

> **Project:** Eagles Eye — AI Crop Doctor & Regional Outbreak Surveillance System  
> **Event:** Pre-DevFest Hackathon Kampala 2026 (SDG 2: Zero Hunger & SDG 13: Climate Action)  
> **Team:** Ugandan Eagles (Stephen Wasswa, Atulinda Derek Solomon, Lyazi Patrick, Deborah Nzopi, Twahirwa Odriann)  
> **Date:** 28 October 2026

---

## 1. Executive Summary

**Eagles Eye** delivers an end-to-end agricultural intelligence platform tailored for Ugandan smallholder farmers and district extension officers. Built with lightweight, low-bandwidth **HTML5, CSS3, and Vanilla JavaScript** frontends connected to a **Python Flask + Google Gemini + Cloud Firestore** backend, the system combines instant field-level crop diagnostics in **English and Luganda** with privacy-preserving national outbreak mapping across **54 Ugandan districts**.

> [!IMPORTANT]
> Every diagnosis logged to the surveillance layer strips personal identifiers and exact farm GPS coordinates, snapping records strictly to fixed district administrative centres (`backend/districts.py`) in accordance with `docs/DATA_CONTRACT.md`.

---

## 2. System Architecture

The platform is structured into three decoupled layers that communicate over CORS-enabled JSON/multipart HTTP endpoints while maintaining full offline/degraded resilience:

```mermaid
flowchart LR
    subgraph Edge["1. Farmer & Officer Edge Clients"]
        PWA["Farmer Mobile PWA (clients/farmer-app)"]
        SW["PWA Service Worker (eagles-eye-v5)"]
        DASH["Surveillance Dashboard (clients/dashboard)"]
        PWA <--> SW
    end

    subgraph Core["2. Flask Application & Safety Layer"]
        ROUTES["REST Endpoints: GET /, POST /diagnose, GET /scans"]
        VALID["5MB & MIME Guard + Schema Validator"]
        GEO["54-District Lookup (districts.py)"]
        ROUTES --> VALID
        ROUTES --> GEO
    end

    subgraph Infra["3. Google Cloud & Geospatial Services"]
        GEMINI["Gemini 3.5 Flash-Lite Multimodal API"]
        FIRESTORE["Cloud Firestore ('scans' Collection)"]
        MEMORY["In-Memory Fallback Store"]
        GMAPS["Google Maps JS + HeatmapLayer (+ Leaflet Fallback)"]
    end

    PWA -->|"POST /diagnose & GET /scans"| ROUTES
    DASH -->|"GET /scans?limit=200 & GET /"| ROUTES
    VALID --> GEMINI
    ROUTES --> FIRESTORE
    ROUTES -.->|"Dev Fallback"| MEMORY
    PWA --> GMAPS
    DASH --> GMAPS
```

### Component Breakdown

| Layer | Files | Key Responsibilities |
|---|---|---|
| **Farmer Mobile PWA** | `clients/farmer-app/{index.html,style.css,app.js,manifest.json,sw.js}` | 5-screen mobile flow, hardware camera/file-picker (`#camera-file-input`) with `FileReader` live preview & actual photo thumbnail on Results, live `POST https://eagles-eye-api.onrender.com/diagnose`, bilingual English/Luganda UI & Web Speech TTS, 54-district agro-dealer lookup, live Haversine nearby outbreak map (`GET /scans?limit=50`). |
| **Officer Surveillance Dashboard** | `clients/dashboard/{index.html,style.css,script.js}` | Live 4-KPI calculation from `https://eagles-eye-api.onrender.com` & Firestore (zero mock/seed fallbacks), interactive Uganda district heat map, ranked Top Threats with crop/disease/period filters, district-filtered field reports, 20s live background polling, CSV export. |
| **Backend API & AI Engine** | `backend/{app.py,db.py,districts.py,seed_firestore.py,Dockerfile}` | Multipart upload validation, structured JSON Gemini multimodal inference, inconclusive-image filtering (`confidence <= 0.40`), anonymous district geotagging, Google Cloud Firestore persistence. |
| **Evaluation & Contracts** | `docs/DATA_CONTRACT.md`, `tests/{run_ai_tests.py,labels.csv}` | Single-source JSON contract and automated 15-image Gemini accuracy & health-status evaluation harness. |

---

## 3. User Flow & State Transitions

### 3.1 Smallholder Farmer Journey (`clients/farmer-app/`)

```mermaid
stateDiagram-v2
    [*] --> Welcome
    Welcome --> Scan : Tap Start (EN / LG selected)
    Welcome --> History : View scan history

    Scan --> Analysing : Tap Viewfinder / Shutter / Gallery -> FileReader preview
    Analysing --> Result : 200 OK (status === success, actual user photo displayed)
    Analysing --> Result : 200 OK (status === inconclusive or confidence <= 0.40 -> Retake button)
    Analysing --> RetryToast : Network / HTTP Validation Error
    RetryToast --> Scan : Retry or capture clearer leaf
    Result --> Scan : Tap Retake clearer photo

    Result --> AudioTTS : Listen to advice (EN / Luganda)
    Result --> AgroDealersSheet : Find nearest agro-dealer (54 districts)
    Result --> NearbyAlert : View nearby crop alert / Bell (GET /scans?limit=50)

    AgroDealersSheet --> NearbyAlert : View nearby crop alert
    NearbyAlert --> PreventionTipsSheet : See prevention tips
    History --> Result : Open saved real scan record
    History --> Scan : Scan a crop leaf
```

### 3.2 Extension Officer Surveillance Journey (`clients/dashboard/`)

```mermaid
flowchart TD
    Open(["Launch Officer Dashboard"]) --> Sync["Fetch GET / & GET /scans?limit=200 from https://eagles-eye-api.onrender.com"]
    Sync --> Check{"Live Backend Status"}

    Check -->|"Online + Scans >= 1"| LiveMetrics["Compute Live Firestore KPIs, District Hotspots & Ranked Threats"]
    Check -->|"Online + 0 Scans"| ReadyState["Show 'Live API · 0 scans' + Clean Empty Surveillance State"]
    Check -->|"Unreachable"| OfflineState["Show 'API unreachable' Notice + Sync Live API Retry"]

    LiveMetrics --> Nav{"Navigation Mode"}
    ReadyState --> Nav
    OfflineState --> Nav

    Nav -->|"Overview"| SplitView["4 KPI Cards + Interactive Uganda Heat Map + Top Threats"]
    Nav -->|"Outbreak map"| ExpandedMap["Full-Width Uganda District Map + Popups"]
    Nav -->|"Reports"| ReportTable["Filterable Field Reports + Server ?district= Query"]
    Nav -->|"Settings"| Config["API Base URL Switcher + Live Health Check"]

    SplitView -->|"20s Poll New Scan ID"| AlertDot["Illuminate Notification Bell + Recent District Alerts"]
    SplitView -->|"Download report"| ExportCSV["Generate eagles-eye-live-outbreak-report.csv"]
```

---

## 4. Key Engineering Improvements Delivered

### 4.1 Exact Design System & Real Uganda Geospatial Mapping
- **Design Token Fidelity:** Implemented the `Eagles Eye UI_UX` palette (`--green: #2e7d32`, `--green-dark: #195b27`, `--amber: #f9a825`, `--red: #c62828`, `--canvas: #f7f9f4`, `Inter` typography) across both client apps in pure semantic CSS.
- **Dual-Engine Real Uganda Maps:** Replaced static decorative SVGs with real WGS84 Uganda maps (`UGANDA_CENTER = { lat: 1.3733, lng: 32.2903 }`) powered by **Google Maps JavaScript API** (`HeatmapLayer` + severity halos + district markers) with automatic fallback to **Leaflet + OpenStreetMap** so maps always render cleanly even without billing keys or during quota limits.

### 4.2 Multi-Device & Orientation Responsiveness
- **Surveillance Dashboard (`clients/dashboard/style.css`):**
  - Engineered 5 responsive tiers (`>= 1200px` desktop, `1200px+` short-height `< 760px`, `960px–1199px` compact laptop/tablet, `600px–959px` sticky frosted top navigation bar, `< 600px` & `< 420px` mobile phones) with `minmax(0, ...)` fluid grids, `100dvh` heights, safe-area insets, and a debounced `ResizeObserver` keeping Uganda map bounds centered on resize.
- **Farmer Mobile App (`clients/farmer-app/style.css`):**
  - Refactored `#screen-scan` into a zero-overlap flex-column layout with `.leaf-stage`, proportional `min(250px, 60vw, 34dvh)` leaf framing, `320px`-safe 3-column grid headers, `env(safe-area-inset-*)` padding, and a dedicated two-column **landscape phone mode** (`@media (max-height: 540px) and (orientation: landscape)`).

### 4.3 Live Production Frontend ↔ Render Backend & Firestore Integration (Zero Mock Fallbacks)
- **Direct Live Render Connection (`https://eagles-eye-api.onrender.com`):** Removed all static demo data (`mock_data.json`, `seed_data.json`, static placeholder crop imagery, and preset demo chips) so both the Farmer PWA and Surveillance Dashboard operate strictly on real user uploads and live Firestore records.
- **Hardware Camera & FileReader Pipeline:** Tapping `#viewfinder-card`, `#btn-capture`, or `#btn-gallery` triggers `#camera-file-input`, previews the user's exact photo via `FileReader` (`readAsDataURL`) inside `#scan-photo`, retains the data URL in memory to display the farmer's actual photo thumbnail in `#res-image`, and compresses oversized images (`< 4.8 MB`) via `<canvas>` before `POST /diagnose`.
- **54-District Synchronization & Real Haversine Alerts:** Unified all 54 Ugandan district coordinates across `backend/districts.py`, `clients/farmer-app/app.js`, and `clients/dashboard/script.js`. Opening Nearby Crop Alert or tapping any notification bell queries `GET https://eagles-eye-api.onrender.com/scans?limit=50` and computes real Haversine distances (`km`) from the farmer's selected district.
- **Contract-Exact Inconclusive Handling:** Blurry or non-crop photos (`status === "inconclusive"` or `confidence <= 0.40`) surface an amber `"Needs clearer photo"` badge and primary `"Retake clearer photo"` button (`#btn-retake`) without polluting outbreak history.
- **Live Surveillance Aggregation & 20s Polling:** Connected the Dashboard KPI strip, Uganda heat map, Top Threats ranking, Notification bell, CSV export, and `?district=` report filter exclusively to live `GET /scans?limit=200` with cold-start-tolerant timeouts (`45s`).

---

## 5. Verification Summary

| Check | Scope | Result |
|---|---|---|
| **JavaScript Syntax (`node --check`)** | `farmer-app/app.js`, `farmer-app/sw.js`, `dashboard/script.js` | **Passed (0 syntax errors)** |
| **DOM ID & CSS Brace Audit** | 92 Farmer App IDs, 44 Dashboard IDs, all CSS rules | **Passed (100% matched & balanced)** |
| **54-District Coordinate Parity** | `backend/districts.py` ↔ Farmer App ↔ Dashboard | **Passed (54 / 54 districts synced)** |
| **Flask API Contract Roundtrip** | `GET /`, `POST /diagnose`, `GET /scans?limit=200`, `GET /scans?district=Mbale` | **Passed (HTTP 200 & schema verified)** |
| **Gemini Multimodal Benchmark** | `tests/reports/gemini_test_report.txt` (`gemini-3.5-flash-lite`) | **Verified (0 health-status mismatches)** |

