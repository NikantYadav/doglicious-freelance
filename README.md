# VetRx Scan 🐾

AI-powered canine health diagnostic tool. Upload a photo of your dog, describe symptoms, and get an instant visual analysis, refined diagnosis, and personalized diet recommendations — powered by Claude or Gemini.

---

## Architecture

- **Frontend:** React 18 (Vite) + CSS, PWA-enabled. All state lives in `src/pages/VetRxScan.jsx`.
- **Backend:** Node.js + Express, structured as Vercel-compatible serverless handlers under `server/api/`.
- **Database:** HubSpot CRM — used as a lead/user database (no traditional DB).
- **AI Engine:** Anthropic Claude (`claude-sonnet-4-5`) by default; falls back to Google Gemini (`gemini-2.5-flash`) if `GEMINI_API_KEY` is set instead.
- **Payments:** PayU hosted checkout (India). Hash generation and verification handled server-side.
- **Auth:** Stateless HMAC-signed OTP tokens delivered via Gmail SMTP. No passwords, no sessions server-side.

---

## Local Development

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Configure environment

**Frontend** — create `.env.frontend` in the project root:
```bash
cp frontend.env.example .env.frontend
```

```env
VITE_API_URL=http://localhost:5000
```

**Backend** — create `server/.env.backend`:
```bash
cp backend.env.example server/.env.backend
```

Fill in the required values (see [Environment Variables](#environment-variables) below).

### 3. Set up HubSpot schema

Run once to create the custom contact properties in your HubSpot account:
```bash
node scripts/setup-hubspot-schema.js
```

### 4. Run

```bash
npm run dev
```

This starts the Express backend on port `5000` and the Vite dev server on port `5173` concurrently. The Vite proxy forwards `/api/*` requests to the backend automatically.

---

## Environment Variables

### Backend (`server/.env.backend`)

| Variable | Required | Description |
|---|---|---|
| `HUBSPOT_API_KEY` | ✅ | HubSpot Private App token (`pat-...`) |
| `GMAIL_USER` | ✅ | Gmail address used to send OTP emails |
| `GMAIL_APP_PASSWORD` | ✅ | Gmail App Password (not your account password) |
| `OTP_SECRET` | ✅ | Random string used to sign HMAC OTP tokens |
| `PAYU_KEY` | ✅ | PayU merchant key (from PayU dashboard) |
| `PAYU_SALT` | ✅ | PayU merchant salt (from PayU dashboard) |
| `PAYU_ENV` | ✅ | `test` or `production` |
| `PAYU_AMOUNT` | ✅ | Payment amount, e.g. `99.00` |
| `PAYU_PRODUCT` | ✅ | Product name shown on PayU checkout |
| `NUM_SCAN` | ✅ | Number of scans unlocked per payment (e.g. `5`) |
| `SERVER_URL` | ✅ | Full URL of this backend (used for PayU `surl`/`furl`) |
| `FRONTEND_URL` | ✅ | Full URL of the frontend (PayU redirects land here) |
| `CLUADE_API_KEY` | ⚠️ | Anthropic API key — used if `GEMINI_API_KEY` is not set |
| `GEMINI_API_KEY` | ⚠️ | Google Gemini API key — takes priority over Claude if set |
| `PORT` | optional | Defaults to `5000` |

> At least one of `CLUADE_API_KEY` or `GEMINI_API_KEY` must be provided.

### Frontend (`.env.frontend`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend URL. Empty string in production if same origin. |
| `VITE_NUM_SCAN` | optional | Mirrors `NUM_SCAN` for display purposes. Defaults to `5`. |

---

## User Flow

1. **Auth** — user enters email → receives 6-digit OTP → verified via HMAC token
2. **Free scan** — first scan is always free
3. **Paywall** — after the free scan, user must pay ₹99 via PayU to unlock 5 more scans
4. **Scan flow** — upload photo → select body part & symptoms → fill dog profile → AI initial analysis → follow-up questions → refined diagnosis report
5. **HubSpot sync** — each completed scan updates the contact's `scan_count`, `paid_scans`, diagnosis, diet advice, and lead status

---

## Payment Flow (PayU)

1. Frontend calls `POST /api/payu-initiate` → backend generates hash server-side and returns PayU params
2. Frontend auto-submits a hidden form to PayU hosted checkout
3. On success, PayU POSTs to `POST /api/payu-success` → backend verifies reverse hash, increments `paid_scans` in HubSpot, redirects to frontend with `?payu_status=payment_success&paidScans=N`
4. On failure, PayU POSTs to `POST /api/payu-failure` → redirects to frontend with `?payu_status=payment_failed`

> PayU test environment: `https://test.payu.in/_payment`  
> PayU production: `https://secure.payu.in/_payment`

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/send-otp` | Send OTP email to user |
| `POST` | `/api/verify-otp` | Verify OTP, return HubSpot contact info |
| `POST` | `/api/hs-contact` | Get or create HubSpot contact by email |
| `POST` | `/api/hs-report` | Save scan report to HubSpot, update scan counts |
| `POST` | `/api/ai` | Run AI diagnosis (initial or refined) |
| `POST` | `/api/payu-initiate` | Generate PayU hash and return checkout params |
| `POST` | `/api/payu-success` | PayU success callback — verify hash, grant scans |
| `POST` | `/api/payu-failure` | PayU failure callback — redirect to frontend |
| `GET`  | `/api/health` | Health check |

---

## Deployment

### Backend → Vercel

The `server/` directory is a self-contained Vercel project with its own `vercel.json` and `package.json`.

```bash
cd server
vercel deploy
```

Set all backend environment variables in the Vercel project settings. After deploying, set `SERVER_URL` to the deployed backend URL and `FRONTEND_URL` to the deployed frontend URL.

### Frontend → Vercel / Netlify / any static host

```bash
npm run build   # outputs to dist/
```

Set `VITE_API_URL` to your deployed backend URL before building.

---

## HubSpot Contact Properties

Custom properties used (created by `scripts/setup-hubspot-schema.js`):

| Property | Type | Description |
|---|---|---|
| `scan_count` | number | Total scans completed |
| `paid_scans` | number | Remaining paid scan quota |
| `dog_name` | string | Dog's name |
| `dog_breed` | string | Breed |
| `dog_age_years` | number | Age in years |
| `dog_weight_kg` | string | Weight |
| `diagnosis` | string | Latest AI diagnosis |
| `severity` | string | Severity level |
| `health_score` | number | AI health score (0–100) |
| `body_part` | string | Affected body area |
| `diet_advice` | string | AI diet recommendation |
| `symptoms` | string | Reported symptoms |
| `payu_txnid` | string | Last PayU transaction ID |
| `payu_status` | string | Last PayU payment status |
