# Arogya Sahayak (आरोग्य सहायक)

Arogya Sahayak is an offline-first Progressive Web Application (PWA) designed for ASHA workers and rural health teams in India. It combines on-device AI screening, multilingual support, mobile OTP authentication, and lightweight teleconsultation workflows for low-connectivity environments.

## 🚀 What this project includes
- Offline-first health screening with local storage and PWA-friendly behavior
- OTP-based mobile sign-in and sign-up flow for quick onboarding
- English and Hindi support on the landing experience
- Patient screening, dashboard, and teleconsultation views for field use
- SMS/OTP delivery support with a mock fallback for local development

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

### 1) Install dependencies
```bash
cd apps/server
npm install

cd ../web
npm install
```

### 2) Start the backend
```bash
cd apps/server
npm run dev
```

### 3) Start the frontend
In a second terminal:
```bash
cd apps/web
npm run dev
```

Open http://localhost:3000 to view the app.

The frontend proxies API calls to the backend on http://localhost:3001 by default.

### Optional environment variables
For local development, you can set:
```bash
JWT_SECRET=your-dev-secret
PORT=3001
```

If Twilio credentials are not configured, the OTP flow will fall back to a mock local code for testing.

## 🌐 Demo links
- Frontend: https://arogaya-sahayak.vercel.app
- Backend health check: /health

## 📝 Notes
This repository is actively evolving and is intended for demo, prototyping, and field-use validation of rural health workflows.