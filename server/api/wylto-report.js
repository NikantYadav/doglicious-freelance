// api/wylto-report.js
// Updates a Wylto contact with full VetRx Scan data and increments scan count.
// Wylto contacts are identified by Wylto's contact ID stored in the user session.
// Scan counts are tracked in our own metadata sent to the CRM as contact notes/updates.

const WYLTO_BASE = 'https://server.wylto.com';
const wyltoKey = () => process.env.WYLTO_API_KEY;

async function wyltoGet(path) {
    const res = await fetch(`${WYLTO_BASE}${path}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${wyltoKey()}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Wylto GET error: ${res.status} ${err}`);
    }
    return res.json();
}

async function wyltoPut(path, body) {
    const res = await fetch(`${WYLTO_BASE}${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${wyltoKey()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Wylto PUT error: ${res.status} ${err}`);
    }
    return res.json();
}

import { normalizePhone } from '../utils/phone.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { contactId, dogProfile, report, selectedPart, selectedSymptoms, scanCount: prevCount, paidScans: prevPaid } = req.body || {};
    if (!contactId) return res.status(400).json({ error: 'contactId required' });

    try {
        const numFree = parseInt(process.env.NUM_FREE_SCAN || '1', 10);
        const currentScanCount = parseInt(prevCount || '0', 10);
        const currentPaidScans = parseInt(prevPaid || '0', 10);

        const newCount = currentScanCount + 1;
        const isPaidScan = currentScanCount >= numFree;
        const newPaid = isPaidScan ? Math.max(0, currentPaidScans - 1) : currentPaidScans;

        const dog = dogProfile || {};
        const r = report || {};

        const trunc = (str, len = 250) => str ? String(str).substring(0, len) : '';

        // Update the Wylto contact record with latest info - Fetch first to merge metadata
        const existing = await wyltoGet(`/api/v1/contact/${contactId}`);
        const rawCf = existing.message;
        const existingCf = rawCf ? (typeof rawCf === 'string' ? JSON.parse(rawCf) : rawCf) : {};

        // Build the contact name: prefer dog owner's name from profile, fall back to phone
        const contactName = dog.ownerName || existing.name || undefined;

        const updatedContact = await wyltoPut(`/api/v1/contact/${contactId}`, {
            ...(contactName ? { name: contactName } : {}),
            ...(dog.mobile || dog.phone ? { phoneNumber: normalizePhone(dog.mobile || dog.phone) } : {}),
            message: JSON.stringify({
                ...existingCf,
                // Scan tracking
                cfScanCount: newCount,
                cfPaidScans: newPaid,
                // Dog profile
                cfDogName: trunc(dog.name, 100),
                cfBreed: trunc(dog.breed, 100),
                cfAge: `${dog.ageYears || 0}y ${dog.ageMonths || 0}m`,
                cfAgeYears: parseInt(dog.ageYears || '0', 10),
                cfWeight: dog.weight ? `${dog.weight}kg` : '',
                cfFoodType: trunc(dog.foodType, 100),
                cfFoodGrams: dog.foodGrams ? `${dog.foodGrams}g` : '',
                cfFoodTimes: trunc(dog.foodTimes, 100),
                cfNotes: trunc(dog.notes),
                // Scan results
                cfBodyPart: trunc(selectedPart, 100),
                cfSymptoms: trunc(Array.isArray(selectedSymptoms) ? selectedSymptoms.join(', ') : ''),
                cfDiagnosis: trunc(r.diagnosis),
                cfSeverity: trunc(r.severity, 100),
                cfUrgency: trunc(r.urgency, 100),
                cfHealthScore: r.healthScore || 0,
                cfConfidence: r.confidence || 0,
                cfDietAdvice: trunc(r.diet),
                cfLastScanDate: new Date().toISOString().split('T')[0],
            })
        });

        console.log(`[wylto-report] Updated contact ${contactId}. Scan #${newCount}, paid remaining: ${newPaid}`);

        return res.status(200).json({ ok: true, scanCount: newCount, paidScans: newPaid });
    } catch (err) {
        console.error('[wylto-report]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
