# Arogya Sahayak (आरोग्य सहायक)

Arogya Sahayak is an offline-first Progressive Web Application (PWA) designed for ASHA workers and rural health teams in India. It combines on-device AI screening, multilingual support, mobile OTP authentication, offline-first sync, and lightweight teleconsultation workflows for low-connectivity environments.

## 🚀 What this project includes
- Offline-first health screening with Dexie local storage and PWA-ready service worker caching
- On-device AI risk scoring using the browser ML stack
- OTP-based mobile sign-in and sign-up flow with optional Twilio integration and local mock fallback
- Patient registration, screening, dashboard analytics, and PHC district mapping
- Teleconsultation booking API and in-browser call UI for remote doctor interaction
- Admin and PHC dashboards with role-based patient and teleconsultation workflows

## 🧩 Tech stack
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS, Zustand, Dexie, Leaflet
- Backend: Node.js, Fastify, JWT, Knex.js, PostgreSQL
- AI/ML: ONNX Runtime Web for on-device inference

## 📁 Project structure
- apps/web: Next.js frontend and UI pages
- apps/server: Fastify API, auth routes, database migrations, and OTP helpers
- apps/server/src/db: database connection and schema setup

## ▶️ Local development
Prerequisites:
- Node.js 18+
- npm

### 0) Clone the repository
```bash
git clone https://github.com/amritanshushaw-cpu/Arogya-Sahayak.git
cd Arogya-Sahayak
```

### 1) Install dependencies
```bash
cd apps/server
npm install

cd ../web
npm install
```

### 2) Configure environment variables
Copy `.env.example` in `apps/server` and update the values as needed:
```bash
cd apps/server
cp .env.example .env
```

Required values:
- `JWT_SECRET`
- `PORT` (default: `3001`)
- `DATABASE_URL`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (optional; without them the OTP flow uses a mock local code)

### 3) Start the backend
```bash
cd apps/server
npm run dev
```

### 4) Start the frontend
In a second terminal:
```bash
cd apps/web
npm run dev
```

Open http://localhost:3000 to view the app.

The frontend proxies API calls to the backend on http://localhost:3001 by default.

### Optional backend commands
```bash
cd apps/server
npm run migrate
```

If Twilio credentials are not configured, the OTP flow will fall back to a mock local code for testing.

## 🌐 Demo links
- Frontend: https://arogaya-sahayak.vercel.app
- Backend health check: /health

## 📝 Notes
This repository is actively evolving and is intended for demo, prototyping, and field-use validation of rural health workflows.