// PoopSense session — stored separately from VetRx session
const KEY = 'ps_session';
const TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export function getPsSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() > s.expiresAt) { localStorage.removeItem(KEY); return null; }
    return s; // { phone }
  } catch { return null; }
}

export function savePsSession(phone) {
  localStorage.setItem(KEY, JSON.stringify({ phone, expiresAt: Date.now() + TTL }));
}

export function clearPsSession() {
  localStorage.removeItem(KEY);
}
