# 🏥 Arogya Sahayak — AI-Powered Rural Health Platform

**IEMH4-HC-01 | Track: Healthcare | Category: Software | Difficulty: Advanced**

> AI-driven early disease risk prediction & rural health access platform for ASHA/ANM workers, designed for low-connectivity, low-literacy environments.

---

## 🎯 Problem Statement

India's rural population lacks access to timely diagnostics. Chronic conditions (diabetes, hypertension, CVD, anemia) are detected only after symptoms become severe. ASHA/ANM workers lack digital decision-support tools, and PHCs are overloaded.

**Arogya Sahayak** predicts early-stage disease risk from easily collectible data and connects at-risk patients with the nearest appropriate care.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **On-Device ML Risk Engine** | XGBoost models running in-browser via ONNX WebAssembly — works 100% offline |
| 🎙️ **Voice-First Interface** | ASHA workers speak vitals in Hindi/English — auto-extracted via NER |
| 📴 **Offline-First PWA** | Full functionality without internet. Syncs automatically when online |
| 🚨 **Automated Alerts** | RED/YELLOW risk patients auto-flagged to nearest PHC doctor |
| 📊 **District Dashboard** | Disease trends, heatmaps, and alert management for health officers |
| 📞 **Teleconsultation** | WebRTC video/audio calls with adaptive bitrate for 2G/3G |
| 🤖 **Multilingual Chatbot** | FAQ triage bot in Hindi/English for pre-diagnosis |
| 🔐 **ABDM/FHIR R4 Ready** | FHIR R4 bundles with ECDH encryption for NDHM compliance |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (PWA)                          │
│  Next.js + Tailwind │ ONNX WASM │ Dexie.js │ WebRTC    │
└──────────┬──────────────────────────────────┬───────────┘
           │ REST API + WebSocket             │ P2P
┌──────────▼──────────┐         ┌─────────────▼───────────┐
│   Fastify Backend   │         │  Google STUN Server     │
│  JWT Auth │ Knex ORM│         │  (NAT Traversal)       │
└──────────┬──────────┘         └─────────────────────────┘
           │
┌──────────▼──────────┐
│  SQLite / PostgreSQL │
│  Patients│Screenings│
│  Alerts │ Teleconsult│
└─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Local Development

```bash
# 1. Clone
git clone https://github.com/saptakgg/SCHEMEGG.git
cd SCHEMEGG

# 2. Install & run backend
cd apps/server
npm install
npm run migrate
npm run dev          # → http://localhost:3001

# 3. Install & run frontend (new terminal)
cd apps/web
npm install
npm run dev          # → http://localhost:3000
```

### Environment Variables

Copy `apps/server/.env.example` to `apps/server/.env` and fill in:

```env
PORT=3001
JWT_SECRET=your-secret-here
DATABASE_URL=              # Leave empty for local SQLite
TWILIO_ACCOUNT_SID=        # Optional: for SMS alerts
TWILIO_AUTH_TOKEN=          # Optional
TWILIO_PHONE_NUMBER=       # Optional
```

---

## 🧠 ML Risk Engine — Clinical Validity

Our hybrid risk engine uses **3 layers** to ensure clinical accuracy:

1. **Clinical Rules (WHO/ICMR)** — Published medical thresholds (BP ≥ 140/90 → Hypertension, Glucose ≥ 126 → Diabetes, Hb < 12 → Anemia)
2. **ML Model (XGBoost/ONNX)** — Multi-variate risk estimation trained on NFHS-5 Indian demographic data
3. **Safety Gate** — Clinical rules ALWAYS override ML. A dangerous reading is never suppressed.

---

## 📱 Target Users

- **ASHA / ANM Workers** — Primary data collectors in villages
- **PHC Doctors** — Receive alerts, provide teleconsultation
- **District Health Officers** — Monitor trends via dashboard
- **Rural Patients** — Benefit from early detection & triage

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, TypeScript |
| Offline Storage | Dexie.js (IndexedDB) |
| ML Runtime | ONNX Runtime Web (WebAssembly) |
| Voice Input | Web Speech API (Chrome) |
| Maps | Leaflet.js + OpenStreetMap |
| Charts | Recharts |
| Backend | Fastify, Knex.js |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Teleconsult | WebRTC + WebSocket signaling |
| Deployment | Vercel (frontend) + Render (backend + DB) |

---

## 👥 Team

Built for **IEM Hacks 4.0** Hackathon

---

## 📄 License

MIT