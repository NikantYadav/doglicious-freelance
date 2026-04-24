// src/services/auth.js
// Manages OTP auth flow and localStorage session.

const API = import.meta.env.VITE_API_URL ?? '';
const SESSION_KEY = 'vetrx_session';
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (Date.now() > s.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return s;
    } catch {
        return null;
    }
}

export function saveSession({ email, contactId, scanCount, paidScans = 0, config = null }) {
    const session = {
        email,
        contactId,
        scanCount,
        paidScans,
        config,
        expiresAt: Date.now() + SESSION_TTL
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

export function updateSessionScanCount(scanCount) {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        s.scanCount = scanCount;
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch { /* ignore */ }
}

export function updateSessionPaidScans(paidScans) {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        s.paidScans = paidScans;
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch { /* ignore */ }
}

export async function sendOtp(email) {
    const res = await fetch(`${API}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data; // { ok, token }
}

export async function verifyOtp(email, otp, token) {
    const res = await fetch(`${API}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data; // { valid, contactId, scanCount, paidScans, config }
}

export async function getConfig() {
    const res = await fetch(`${API}/api/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return await res.json(); // { numFreeScans, numPaidScansPerPack, ... }
}
