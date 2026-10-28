# 🦅 Eagles Eye — Unified Data & AI Contract

> **Version:** 1.1.0 (Pre-DevFest Hackathon Kampala 2026)  
> **Author:** Stephen Wasswa (Project Coordinator)  
> **Stakeholders:** Derek & Lyazi (Backend & AI), Deborah (Farmer PWA), Odriann (Dashboard)  
> **Status:** Authoritative Baseline Specification (Consolidated Single Source of Truth)

---

## 1. Overview & Architectural Scope

This document is the sole, authoritative specification governing data schemas, API contracts, AI inference constraints, and security standards across all components of **Eagles Eye**:
- **Backend API (`backend/`)**: Receives crop photos, orchestrates multimodal Gemini API analysis, logs records to Firestore, and serves outbreak data.
- **Farmer Web App (`clients/farmer-app/`)**: Responsive mobile PWA enabling smallholder farmers to capture leaf photos, review diagnosis cards, and listen to voice advice in English and Luganda.
- **Surveillance Dashboard (`clients/dashboard/`)**: Map-based surveillance tool for agricultural extension officers and cooperatives to track regional outbreaks.
- **Curated Dataset (`data/sample_crops/`)**: Benchmark imagery across target crops (Banana, Cassava, Coffee, Maize) for evaluation.

All subsystems MUST adhere to this contract to guarantee seamless interoperability.

---

## 2. Core Diagnosis Schema

Each diagnosis record represents an evaluated crop leaf assessment.

### Field Definitions

| Field | Type | Required | Description / Constraints | Example |
|---|---|---|---|---|
| `crop` | `string` | **Yes** | Common name of the recognized crop. Allowed values: `"Banana / Matooke"`, `"Cassava"`, `"Coffee"`, `"Maize"`, `"Beans"`, `"Tomato"`, `"Unknown"`. | `"Cassava"` |
| `condition` | `string` | **Yes** | Identified pest, pathogen, deficiency, or `"Healthy Foliage"`. If unrecognizable, use `"Inconclusive Image"`. | `"Cassava Mosaic Disease (CMD)"` |
| `confidence` | `number` | **Yes** | Qualitative model certainty normalized between `0.00` and `1.00`. | `0.94` |
| `severity` | `string` | **Yes** | Urgency and damage level. Enum: `"none"`, `"low"`, `"moderate"`, `"high"`. | `"moderate"` |
| `is_healthy` | `boolean` | **Yes** | `true` if crop exhibits no disease/pest damage; `false` if condition detected. | `false` |
| `advice` | `string` | **Yes** | Plain-language, actionable guidance for smallholder farmers in English. | `"Cut and safely bury badly affected leaves. Use certified virus-free stem cuttings."` |
| `advice_luganda` | `string` | **Yes** | Contextually translated Luganda guidance suitable for text display and Text-to-Speech (TTS) audio playback. | `"Simbula era oyokye ebirime ebirwadde mangu ddala okuziyiza okusaasaana..."` |
| `location` | `object` | **Yes** | District-level geographic context for community surveillance. | See Location Object below |
| `timestamp` | `string` | **Yes** | ISO-8601 UTC timestamp format: `YYYY-MM-DDTHH:MM:SSZ`. | `"2026-10-26T14:30:00Z"` |

### Nested `location` Object

| Sub-field | Type | Required | Description | Example |
|---|---|---|---|---|
| `district` | `string` | **Yes** | Ugandan administrative district where scan was recorded. | `"Masaka"` |
| `latitude` | `number` | **Yes** | Decimal coordinate latitude (WGS 84). | `-0.3411` |
| `longitude` | `number` | **Yes** | Decimal coordinate longitude (WGS 84). | `31.7361` |

---

## 3. API Endpoints

### 3.1 `POST /diagnose`
Analyzes an uploaded crop photo and returns the diagnostic assessment.

- **Request Type:** `multipart/form-data`
  - `image`: Binary file (JPEG/PNG/WebP, max 5MB).
  - `district`: *(Optional, string)* e.g., `"Masaka"` (defaults to `"Unknown"` if omitted).
  - `crop_hint`: *(Optional, string)* Farmer-provided crop hint if known.

- **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "crop": "Banana / Matooke",
    "condition": "Banana Bacterial Wilt (BXW)",
    "confidence": 0.92,
    "severity": "high",
    "is_healthy": false,
    "advice": "Cut down the infected plant at ground level and bury plant residues. Disinfect all farming tools with fire or bleach before using them on other plants.",
    "advice_luganda": "Sazaako ekitooke ekirwadde wansi ku ttaka era oziike ebisigalira. Oziyize okusaasaana ng'ookya ebyuma oba okubizika mu ddagala lya klorini.",
    "location": {
      "district": "Masaka",
      "latitude": -0.3411,
      "longitude": 31.7361
    },
    "timestamp": "2026-10-26T15:10:00Z"
  }
}
```

- **Inconclusive / Low Quality Image Response (200 OK):**
```json
{
  "status": "inconclusive",
  "data": {
    "crop": "Unknown",
    "condition": "Inconclusive Image",
    "confidence": 0.25,
    "severity": "none",
    "is_healthy": false,
    "advice": "The photo is too blurry or distant to provide an accurate diagnosis. Please take a closer, well-lit photo of the affected leaves or stems.",
    "advice_luganda": "Ekifanyi kino tekirabika bulungi oba kiri wala nnyo. Nsaba okube ekifanyi ekirala ekiri okumpi era nga kiriko ekitangaala eky'amaanyi.",
    "location": {
      "district": "Unknown",
      "latitude": 0.3476,
      "longitude": 32.5825
    },
    "timestamp": "2026-10-26T15:12:00Z"
  }
}
```

---

### 3.2 `GET /scans`
Retrieves logged scans for surveillance mapping.

- **Query Parameters:**
  - `district` *(optional)*: Filter by district name (e.g. `?district=Masaka`).
  - `limit` *(optional)*: Number of records (default: 50).

- **Success Response (200 OK):**
```json
{
  "status": "success",
  "count": 3,
  "scans": [
    {
      "id": "scan_001",
      "crop": "Banana / Matooke",
      "condition": "Banana Bacterial Wilt (BXW)",
      "confidence": 0.95,
      "severity": "high",
      "is_healthy": false,
      "advice": "Cut down the infected pseudostem immediately and de-bud using a wooden fork.",
      "advice_luganda": "Temako ekitooke ekirwadde mangu ddala era okozese ekitayiriro okuggyako empumpu.",
      "location": {
        "district": "Masaka",
        "latitude": -0.3411,
        "longitude": 31.7361
      },
      "timestamp": "2026-10-26T10:15:00Z"
    },
    {
      "id": "scan_002",
      "crop": "Cassava",
      "condition": "Cassava Mosaic Disease (CMD)",
      "confidence": 0.88,
      "severity": "moderate",
      "is_healthy": false,
      "advice": "Rogue out stunted or curling cassava plants. Inspect for whitefly infestations.",
      "advice_luganda": "Simbula ebiwuka ebikyamye ebiraga obulwadde bwa mosaic. Kebera obuwuka obweru.",
      "location": {
        "district": "Mukono",
        "latitude": 0.3549,
        "longitude": 32.7523
      },
      "timestamp": "2026-10-26T11:45:00Z"
    },
    {
      "id": "scan_003",
      "crop": "Coffee",
      "condition": "Coffee Leaf Rust (CLR)",
      "confidence": 0.91,
      "severity": "high",
      "is_healthy": false,
      "advice": "Prune excess branches to improve aeration and apply approved copper-based fungicides before wet seasons.",
      "advice_luganda": "Saalira emiti gy'emmwanyi okuyingiza empewo era osaaseeko eddagala lya kopa erikakasibwa ng'enkuba tenatandika.",
      "location": {
        "district": "Mbale",
        "latitude": 1.0784,
        "longitude": 34.1754
      },
      "timestamp": "2026-10-26T13:20:00Z"
    }
  ]
}
```

---

### 3.3 `GET /`
Health check endpoint.
```json
{
  "status": "healthy",
  "service": "Eagles Eye API",
  "version": "1.0.0"
}
```

---

## 4. AI Inference, Prompting, & Uncertainty Rules

1. **Multimodal Analysis**:
   - The backend passes the validated image bytes directly to Google Gemini (`gemini-2.5-flash` or `gemini-1.5-flash`) using structured JSON mode.
   - The model must identify: `crop`, `condition`, `confidence`, `severity`, `is_healthy`, `advice`, and `advice_luganda`.
2. **Metadata Integrity**:
   - Gemini must NEVER invent coordinates, GPS locations, or timestamps. Geographic coordinates and ISO timestamps are added exclusively by the backend application logic.
3. **Uncertainty & Inconclusive Handling**:
   - When an image is blurry, underexposed, or does not clearly display crop foliage, Gemini must return an inconclusive assessment rather than fabricating a false diagnosis.
   - The response must adopt the `"inconclusive"` status, set `condition` to `"Inconclusive Image"`, and advise the farmer in English and Luganda to capture a clearer, well-lit photo.
4. **Advisory Framing**:
   - AI predictions represent preliminary advisory guidance and must always carry the disclaimer: *"Advisory only. Confirm with your local extension officer."*

---

## 5. Security & Privacy Standards

- **Server-Side API Keys**: `GEMINI_API_KEY` and Google Cloud credentials must remain strictly on the backend server. They must NEVER be exposed in frontend bundles or committed to Git.
- **Untrusted Input Validation**: All uploaded image files must be validated for size (max 5MB), MIME type (`image/jpeg`, `image/png`, `image/webp`), and file integrity before dispatching to the Gemini API.
- **Farmer Privacy**: Scans are geotagged at the **district administrative center** level (approximate coordinates) to protect the exact physical homestead location of smallholder farmers from public disclosure.

---

## 6. Team Component Ownership

| Team Member | Role | Component Ownership | Primary Deliverables |
|---|---|---|---|
| **Stephen Wasswa** | Project Coordinator & Product Lead | Architecture & Repo Governance | Repo refactoring, UX consistency, pitch deck, coordination |
| **Atulinda Derek Solomon** | Backend Engineer | `backend/` | Flask API, `/diagnose`, Firestore persistence, `/scans` endpoint |
| **Lyazi Patrick** | AI & Security Specialist | `backend/` & AI Prompting | Gemini prompt engineering, Luganda translation accuracy, testing |
| **Deborah Nzopi** | Frontend Developer | `clients/farmer-app/` | Mobile Farmer PWA, Figma UI matching, camera upload, TTS audio |
| **Twahirwa Odriann** | Dashboard Developer | `clients/dashboard/` | Outbreak surveillance dashboard, Google Maps heat map |

---

## 7. Model Testing & Evaluation Criteria

The AI component must be benchmarked against 10–20 test photographs organized in `data/sample_crops/`:
- **Banana**: Healthy leaves vs. Banana Bacterial Wilt (BXW).
- **Cassava**: Healthy foliage vs. Cassava Mosaic Disease (CMD).
- **Coffee**: Healthy foliage vs. Coffee Leaf Rust (CLR).
- **Maize**: Healthy foliage vs. Fall Armyworm (FAW) damage.
- **Inconclusive**: Distant or blurry photos verifying proper error handling.

Evaluation criteria:
1. Crop classification accuracy.
2. Plausibility and safety of smallholder treatment steps.
3. Quality and natural phrasing of Luganda voice guidance.
4. Schema conformance to this unified contract.
