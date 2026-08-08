# Arogya Sahayak (आरोग्य सहायक)

**AI-Powered Early Disease Risk Prediction & Rural Health Access**

Arogya Sahayak is an offline-first Progressive Web Application (PWA) designed for ASHA (Accredited Social Health Activist) workers in rural India. It provides zero-latency AI diagnostic intelligence without the need for constant internet connectivity.

## 🚀 Live Links
- **Frontend App**: [https://arogaya-sahayak.vercel.app](https://arogaya-sahayak.vercel.app)
- **Backend API API**: [https://schemegg.onrender.com/health](https://schemegg.onrender.com/health)

## ✨ Core Features
1. **AI Risk Screening**: On-device neural network models predict cardiovascular, diabetes, and respiratory risk instantly (Offline PWA).
2. **Vernacular Voice Input**: Speech-to-text symptom intake for rapid patient registration.
3. **Teleconsultation**: Low-bandwidth WebRTC video connection linking rural workers directly with district hospital doctors.
4. **Admin Dashboard**: Real-time epidemiological heatmaps and village health statistics.
5. **Auto-Alert SMS (Mocked for Demo)**: Integrates Twilio SMS alerts for doctors when a high-risk patient is detected.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, Leaflet Maps
- **Backend**: Node.js, Fastify, Supabase (PostgreSQL), Knex.js
- **Machine Learning**: ONNX Runtime Web (On-device Inference)

## 📦 Local Setup
```bash
# Install dependencies
npm install

# Start Backend
cd apps/server
npm run dev

# Start Frontend
cd apps/web
npm run dev
```