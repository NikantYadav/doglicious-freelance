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
// Throws with err.reason = 'user_not_found' if user was deleted from DB
export async function psLoad(phone) {
  const res = await fetch(`${API}/api/poopsense/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'load', phone }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Load failed');
    err.reason = data.reason;
    throw err;
  }
  return data;
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

export async function psRunAI(imageB64, dog, symptoms, phone) {
  const res = await fetch(`${API}/api/poopsense/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageB64, dog, symptoms, phone }),
  });
  const data = await res.json();
  if (!res.ok) {
    // Attach reason so frontend can show paywall or toast
    const err = new Error(data.error || 'AI analysis failed');
    err.reason     = data.reason;
    err.scanCount  = data.scanCount;
    err.trialScans = data.trialScans;
    err.trialDays  = data.trialDays;
    err.dailyUsed  = data.dailyUsed;
    err.dailyCap   = data.dailyCap;
    err.periodCap  = data.periodCap;
    throw err;
  }
  return data;
}

// ── PayU subscription ─────────────────────────────────────────────────

export async function psInitiatePayment(phone, firstname, email) {
  const res = await fetch(`${API}/api/poopsense/payu-initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, firstname, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment initiation failed');
  return data; // { payuUrl, params }
}

// Submit PayU form programmatically
export function submitPayUForm(payuUrl, params) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payuUrl;
  Object.entries(params).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

// ── Fetch user quota from backend ─────────────────────────────────────

export async function psGetQuota(phone) {
  const res = await fetch(`${API}/api/poopsense/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get-quota', phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch quota');
  return data; // { scanCount, subscribed, subExpiresAt, numFree, isSubscribed, canScan }
}

// ── Save user name (for first-time login) ────────────────────────────

export async function psSaveName(phone, name) {
  const res = await fetch(`${API}/api/poopsense/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save-name', phone, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save name');
  return data;
}
