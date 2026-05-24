// src/services/wylto.js → now backed by Supabase via backend API
// Kept the same export names so no other files need to change.

const API = import.meta.env.VITE_API_URL ?? '';

/**
 * Push a VetRx scan report to the backend (saved to Supabase).
 * Returns { ok, scanCount, paidScans }
 */
export async function pushReport({ contactId, dogProfile, report, selectedPart, selectedSymptoms, scanCount, paidScans }) {
    try {
        const res = await fetch(`${API}/api/db-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId, dogProfile, report, selectedPart, selectedSymptoms, scanCount, paidScans }),
        });
        const data = await res.json();
        return data; // { ok, scanCount, paidScans }
    } catch (err) {
        // Fail silently — don't break user flow
        console.error('[db] pushReport failed:', err);
        return null;
    }
}

/**
 * Push a lead (from tool CTAs, homepage forms, etc.) to the backend (saved to Supabase).
 */
export async function pushLead({ name, phone, email, source, ...customData }) {
    try {
        const res = await fetch(`${API}/api/db-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, source, ...customData }),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('[db] pushLead failed:', err);
        return null;
    }
}
