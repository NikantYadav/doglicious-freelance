// src/services/hubspot.js
// Frontend HubSpot service — calls backend Vercel API functions.

const API = import.meta.env.VITE_API_URL ?? '';

export async function pushReport({ contactId, dogProfile, report, selectedPart, selectedSymptoms }) {
    try {
        const res = await fetch(`${API}/api/hs-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId, dogProfile, report, selectedPart, selectedSymptoms }),
        });
        const data = await res.json();
        return data; // { ok, scanCount }
    } catch (err) {
        // Fail silently — don't break user flow
        console.error('[hubspot] pushReport failed:', err);
        return null;
    }
}
