# 🦅 Eagles Eye

> **AI-Powered Crop Doctor & Outbreak Early-Warning System for Ugandan Smallholder Farmers**  
> Built by **Team Ugandan Eagles** for the **Pre-DevFest Hackathon Kampala 2026** (SDG Theme: Zero Hunger & Climate Action).

---

## 🌍 Overview

Smallholder farmers across Uganda lose an estimated **35–40% of their crop yields** to devastating diseases and pests (such as Banana Bacterial Wilt, Cassava Mosaic Disease, Coffee Leaf Rust, and Fall Armyworm). With agricultural extension officers spread thin across districts, farmers frequently diagnose issues too late or apply incorrect treatments.

**Eagles Eye** solves this through a three-tier intervention:
1. **Farmer Advisory Layer (Mobile Web / PWA):** Farmers snap a photo of an ailing crop and receive instant AI diagnosis with actionable treatment recommendations in English and voice-ready Luganda.
2. **Community Outbreak Layer:** Diagnoses are geotagged (district-level) and logged anonymously to track disease prevalence.
3. **Decision-Maker Surveillance Layer (Web Dashboard):** Agricultural extension officers, NGOs, and local cooperatives visualize live outbreaks on an interactive Google Maps heat map to deploy early interventions.

---

## 📁 Repository Structure & Team Ownership

```
eagles-eye/
├── backend/                   # Python Flask API + Gemini + Firestore (Derek & Lyazi)
│   ├── app.py                 # Flask server with CORS & Gemini endpoints
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment variable template
├── clients/                   # Unified client applications
│   ├── farmer-app/            # Farmer PWA mobile interface (Deborah)
│   │   ├── index.html         # Responsive mobile UI matching Figma
│   │   ├── style.css          # Design system, themes & animations
│   │   ├── app.js             # State, camera, TTS voice & fallback logic
│   │   ├── manifest.json      # PWA installability manifest
│   │   ├── sw.js              # Offline service worker
│   │   └── mock_data.json     # Static mock diagnosis data
│   └── dashboard/             # Surveillance & heat map dashboard (Odriann)
│       ├── index.html         # Officer outbreak surveillance dashboard
│       └── seed_data.json     # Mock outbreak records (Masaka, Mukono, Mbale)
├── shared/                    # Single source of truth for assets
│   └── assets/
│       └── logo.png           # Official Eagles Eye leaf-eye brand logo
├── data/
│   └── sample_crops/          # Test imagery (banana, cassava, coffee, maize, inconclusive)
├── docs/                      # Authoritative specifications & team contracts
│   └── DATA_CONTRACT.md       # Unified JSON schema & AI contract
└── tests/                     # Automated test suites & reports
    ├── run_ai_tests.py        # Gemini diagnosis test runner
    ├── labels.csv             # Ground truth evaluation labels
    └── reports/               # Test execution reports
```

### Team Roles & Ownership

| Team Member | Role | Component Ownership |
|---|---|---|
| **Stephen Wasswa** | Project Coordinator & Product Lead | Architecture, repo governance, UX & pitch |
| **Atulinda Derek Solomon** | Backend Engineer | `backend/` (Flask API, endpoints, Firestore integration) |
| **Lyazi Patrick** | AI & Security Specialist | `backend/` (Gemini API prompt engineering, multimodal analysis) |
| **Deborah Nzopi** | Frontend Developer | `clients/farmer-app/` (Farmer PWA, Figma implementation, camera upload, audio) |
| **Twahirwa Odriann** | Dashboard Developer | `clients/dashboard/` (Surveillance dashboard, Google Maps heat map) |

---

## 🚀 Local Setup & Quickstart

### Prerequisites
- Python 3.10+
- Modern Web Browser (Chrome, Firefox, Edge)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Wasswa-Phen/eagles-eye.git
cd eagles-eye
```

### 2. Backend Setup (`backend/`)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Create your local environment configuration
copy .env.example .env     # Windows
# or: cp .env.example .env # macOS/Linux

# Run the Flask development server
python app.py
```
The backend API will start at: `http://localhost:8080`
- **Health check:** `http://localhost:8080/`
- **Diagnostics endpoint:** `http://localhost:8080/diagnose` (POST)
- **Scans query endpoint:** `http://localhost:8080/scans` (GET)

### 3. Farmer PWA Mobile App (`clients/farmer-app/`)
- Serve the mobile Farmer Progressive Web App:
  ```bash
  cd clients/farmer-app
  python -m http.server 3000
  ```
- Open `http://localhost:3000` in your browser (switch browser DevTools to mobile viewport e.g. iPhone / Pixel).
- Features live camera viewfinder, test chips, Gemini diagnosis, and Luganda voice advice!

### 4. Surveillance Dashboard (`clients/dashboard/`)
- Serve the surveillance dashboard:
  ```bash
  cd clients/dashboard
  python -m http.server 3001
  ```
- Open `http://localhost:3001` in your browser to inspect regional outbreak heat maps.

---

## 📜 Unified Data & AI Contract

All services strictly adhere to the unified JSON schema and Gemini safety rules documented in [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md).

Example diagnosis response payload:
```json
{
  "status": "success",
  "data": {
    "crop": "Cassava",
    "condition": "Cassava Mosaic Disease (CMD)",
    "confidence": 0.94,
    "severity": "moderate",
    "is_healthy": false,
    "advice": "Cut and safely bury badly affected leaves. Use certified virus-free stem cuttings.",
    "advice_luganda": "Simbula era oyokye ebirime ebirwadde mangu ddala okuziyiza okusaasaana...",
    "location": {
      "district": "Masaka",
      "latitude": -0.3411,
      "longitude": 31.7361
    },
    "timestamp": "2026-10-26T14:30:00Z"
  }
}
```

---

## 🛠 Google Technologies Used

- **Google GenAI / Gemini 2.5/Flash:** Multimodal computer vision analysis of crop leaves and diagnostic synthesis.
- **Google Cloud Firestore:** Scalable NoSQL persistence for anonymous scan metadata and geographic outbreak points.
- **Google Maps JavaScript API:** Visualizing outbreak intensity layers and district clusters.
- **Cloud Run:** Containerized deployment for the Python Flask backend.

---

## ⚠️ Advisory Disclaimer
Eagles Eye is an assistive diagnostic advisory system designed to augment agricultural practices. It does not replace field visits by certified agricultural extension specialists.
