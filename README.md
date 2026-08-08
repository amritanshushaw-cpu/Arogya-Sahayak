# Arogya Sahayak (आरोग्य सहायक)

Arogya Sahayak is a state-of-the-art **hybrid Offline-First AI Healthcare Platform** designed specifically for ASHA workers, ANMs, and rural health clinics (PHCs) in India. 

It tackles the core challenges of rural healthcare by providing real-time clinical triage using **Groq's Ultra-Fast LPU LLMs**, while seamlessly falling back to an in-browser deterministic risk engine when the internet goes out. It features full **12-Language Support** with native Text-to-Speech (Google Translate TTS) and Speech-to-Text (Microphone) integration, breaking down digital and literacy barriers for rural healthcare workers.

## 🚀 Key Features
- **Hybrid AI Triage Engine:** Connects to Groq `llama-3.1-8b-instant` for expert clinical analysis, instantly switching to a local heuristic offline model if the network drops.
- **Universal Multilingual Support:** UI elements, Speech-to-Text (Dictation), and Text-to-Speech (Audio playback) fully support 12 major Indian languages (Hindi, Bengali, Telugu, Marathi, Tamil, etc.).
- **Offline-First Data Sync:** Powered by Dexie.js and CRDTs, workers can record vitals in remote villages with zero connectivity, and seamlessly auto-sync to the central PostgreSQL database once back online.
- **Smart Patient Dashboard:** Beautiful, glassmorphic UI built with Tailwind CSS, supporting auto-fetching geolocation and complex clinical forms.
- **Admin & PHC Teleconsultation:** Role-based dashboards for District Admins, Doctors, and PHC Admins to monitor alerts and schedule teleconsultation follow-ups.

## 🧩 Tech Stack
- **Frontend:** Next.js 14, React 18, Tailwind CSS, Zustand, Dexie.js (Offline DB)
- **Backend:** Fastify (Node.js), PostgreSQL, Knex.js, JSON Web Tokens (JWT)
- **AI & Integrations:** Groq Cloud (Llama 3.1 8b), Google Translate API (Translation & TTS), Web Speech API (STT)

## 📁 Complete Repository Structure

```text
Arogya-Sahayak/
├── .gitignore
├── README.md
├── apps/
│   ├── server/
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── knexfile.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── data/
│   │   │   └── .gitkeep
│   │   └── src/
│   │       ├── index.js
│   │       ├── db/
│   │       │   ├── connection.js
│   │       │   ├── seed.js
│   │       │   └── migrations/
│   │       │       └── 001_initial_schema.js
│   │       ├── routes/
│   │       │   ├── abdm.js
│   │       │   ├── admin.js
│   │       │   ├── alerts.js
│   │       │   ├── auth.js
│   │       │   ├── chat.js (Groq Integration)
│   │       │   ├── dashboard.js
│   │       │   ├── patients.js
│   │       │   ├── screenings.js (Hybrid AI Engine)
│   │       │   └── teleconsult.js
│   │       └── services/
│   │           ├── fhir.js
│   │           └── sms.js
│   └── web/
│       ├── .gitignore
│       ├── next-env.d.ts
│       ├── next.config.js
│       ├── package-lock.json
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       ├── public/
│       │   ├── manifest.json
│       │   ├── sw.js
│       │   ├── icons/
│       │   └── models/
│       └── src/
│           ├── app/
│           │   ├── globals.css
│           │   ├── layout.tsx
│           │   ├── page.tsx
│           │   ├── admin/
│           │   ├── auth/
│           │   │   ├── login/
│           │   │   └── register/
│           │   ├── dashboard/
│           │   │   ├── layout.tsx
│           │   │   ├── page.tsx
│           │   │   ├── phc/
│           │   │   └── register/
│           │   ├── patient-vitals/
│           │   │   └── page.tsx (Vitals, AI, Multilingual STT/TTS)
│           │   ├── patients/
│           │   ├── screening/
│           │   └── teleconsult/
│           ├── components/
│           │   ├── Chatbot.tsx
│           │   ├── NetworkSyncProvider.tsx
│           │   ├── PhcMap.tsx
│           │   ├── ProtectedRoute.tsx
│           │   ├── RiskCard.tsx
│           │   └── VoiceInput.tsx
│           ├── lib/
│           │   ├── authStore.ts
│           │   ├── db.ts
│           │   ├── sync.ts
│           │   ├── ml/
│           │   │   ├── nerParser.ts
│           │   │   └── riskEngine.ts (Offline Fallback Engine)
│           │   └── offline/
│           └── store/
│               └── useNetworkStore.ts
```

## ▶️ Setup & Deployment

### 1. Clone the Repository
```bash
git clone https://github.com/amritanshushaw-cpu/Arogya-Sahayak.git
cd Arogya-Sahayak
```

### 2. Environment Variables
You must provide a `GROQ_API_KEY` (or `ml_key`) in the server environment to enable the Online AI Engine. If no key is provided, the backend safely defaults to the heuristic offline model.

**Server `.env` Example:**
```env
PORT=3001
JWT_SECRET=arogya-secret
DATABASE_URL=postgres://user:pass@host/db
GROQ_API_KEY=gsk_your_api_key_here
```

### 3. Running Locally
```bash
# Terminal 1: Backend
cd apps/server
npm install
npm run migrate
node src/db/seed.js # Seeds demo admin/asha accounts
npm run dev

# Terminal 2: Frontend
cd apps/web
npm install
npm run dev
```

## 🌐 Live Deployments
- **Frontend (Vercel):** https://arogaya-sahayak.vercel.app
- **Backend (Render):** https://schemegg.onrender.com

## 📝 Demo Login Credentials
Seed accounts provided for local and demo environments:
- **Admin/PHC:** Phone: `9876543212`, Password: `1234`
- **Doctor:** Phone: `9876543211`, Password: `1234`
- **ASHA Worker:** Phone: `9876543210`, Password: `demo123`