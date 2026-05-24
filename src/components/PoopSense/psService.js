// PoopSense — backend service layer
// All Supabase access goes through these backend API calls.

const API = import.meta.env.VITE_API_URL ?? '';

// ── Auth (reuses VetRx OTP endpoints) ────────────────────────────────

export async function psSendOtp(phone) {
  const res = await fetch(`${API}/api/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
  return data; // { ok, token }
}

export async function psVerifyOtp(phone, otp, token) {
  const res = await fetch(`${API}/api/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, otp, phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verification failed');
  return data; // { valid, phone }
}

// ── Sync ──────────────────────────────────────────────────────────────

async function sync(action, phone, payload = {}) {
  const res = await fetch(`${API}/api/poopsense/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, phone, ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sync failed');
  return data;
}

// Load all user data from Supabase on login
// Returns { user, dogs, hist }
export function psLoad(phone) {
  return sync('load', phone);
}

// Save a single scan entry
export function psSaveScan(phone, entry, dogId) {
  return sync('save-scan', phone, { entry, dogId });
}

// Save full dogs array (upserts + deletes removed dogs)
export function psSaveDogs(phone, dogs) {
  return sync('save-dogs', phone, { dogs });
}

// Save user settings (vet info, lang, subscription)
export function psSaveSettings(phone, settings) {
  return sync('save-settings', phone, { settings });
}

// ── AI scan ───────────────────────────────────────────────────────────

export async function psRunAI(imageB64, dog, symptoms) {
  const res = await fetch(`${API}/api/poopsense/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageB64, dog, symptoms }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI analysis failed');
  return data;
}
