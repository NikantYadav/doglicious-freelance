# VetRx Scan 🐾

AI-powered canine health diagnostic tool that provides instant visual analysis and personalized diet recommendations for dogs.

## 🚀 Quick Start (Local Development)

### 1. Installation
Install all dependencies for both frontend and backend:
```bash
npm install
```

### 2. Environment Setup
Copy the example environment files and fill in your keys:
```bash
cp frontend.env.example .env
cp backend.env.example .env # (In local dev, they share the root .env)
```

**Required Keys:**
- `VITE_GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/)
- `HUBSPOT_API_KEY`: Private App token from HubSpot
- `GMAIL_USER` / `GMAIL_APP_PASSWORD`: For OTP delivery via SMTP

### 3. Setup HubSpot Database
Run the schema sync script to automatically create the necessary custom properties in your HubSpot account:
```bash
node scripts/setup-hubspot-schema.js
```

### 4. Run Locally
This will start the Express Backend (port 5000) and Vite Frontend (port 5173) simultaneously:
```bash
npm run dev
```

---

## 🏗️ Architecture

- **Frontend:** React (Vite) + CSS. State-managed through `VetRxScan.jsx`.
- **Backend:** Node.js + Express. Stateless HMAC-based OTP authentication.
- **Database:** HubSpot CRM (used as a lead database).
- **AI Engine:** Google Gemini (Gemini 2.5 Flash) for visual analysis and reasoning.

## 🛠️ Implementation Details

- **Stateless Auth:** Uses HMAC-signed tokens to verify OTPs. This avoids HubSpot search indexing delays during login.
- **PWA:** Registered as a Progressive Web App for offline support and mobile installability.
- **Usage Gating:** One free scan per user. Subsequent scans are gated by a Paywall.

---

## ☁️ Deployment

### Backend (Node.js)
Deploy the root as a Node.js web service (Render, Railway, or Heroku).
- **Start Command:** `npm start`
- **Environment:** Use `backend.env.example` as a guide.

### Frontend (Static/Build)
Deploy to Vercel, Netlify, or similar static hosts.
- **Build Command:** `npm run build`
- **Output Dir:** `dist`
- **Environment:** Use `VITE_API_URL` to point to your deployed backend URL.

---

## 🤝 Support
For issues or property customization, refer to the `scripts/setup-hubspot-schema.js` file for the schema map.
