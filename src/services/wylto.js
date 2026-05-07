// src/services/wylto.js
// Frontend Wylto CRM service — calls backend API.

const API = import.meta.env.VITE_API_URL ?? '';

export async function pushReport({ contactId, dogProfile, report, selectedPart, selectedSymptoms, scanCount, paidScans }) {
    try {
        const res = await fetch(`${API}/api/wylto-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId, dogProfile, report, selectedPart, selectedSymptoms, scanCount, paidScans }),
        });
        const data = await res.json();
        return data; // { ok, scanCount, paidScans }
    } catch (err) {
        // Fail silently — don't break user flow
        console.error('[wylto] pushReport failed:', err);
        return null;
    }
}

export async function pushLead({ name, phone, email, source, ...customData }) {
    try {
        const res = await fetch(`${API}/api/wylto-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone: phone, email, source, ...customData }),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('[wylto] pushLead failed:', err);
        return null;
    }
}
