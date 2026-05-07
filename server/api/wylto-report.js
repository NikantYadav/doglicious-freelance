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

async function wyltoPost(path, body) {
    const res = await fetch(`${WYLTO_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${wyltoKey()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Wylto POST error: ${res.status} ${err}`);
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

        // Update contact metadata via PUT (name, phone are the only Wylto contact fields)
        // Build a rich note message to capture scan details via WhatsApp
        const noteText = `🐾 VetRx Scan Report
Dog: ${dog.name || 'N/A'} (${dog.breed || 'N/A'})
Age: ${dog.ageYears || '0'} yrs | Weight: ${dog.weight ? dog.weight + 'kg' : 'N/A'}
Body Part: ${selectedPart || 'N/A'}
Symptoms: ${Array.isArray(selectedSymptoms) ? selectedSymptoms.join(', ') : 'N/A'}
Health Score: ${r.healthScore || 0}
Diagnosis: ${r.diagnosis || 'N/A'}
Severity: ${r.severity || 'N/A'}
Diet Advice: ${trunc(r.diet, 200)}
Current Food: ${dog.foodType || 'N/A'} | ${dog.foodGrams ? dog.foodGrams + 'g' : 'N/A'} | ${dog.foodTimes || 'N/A'}
Owner Notes: ${dog.notes || 'N/A'}
Scan #${newCount} | Paid scans remaining: ${newPaid}`.trim();

        // Send summary to the contact via WhatsApp text message (if they have a number)
        if (dog.mobile || dog.phone) {
            const rawPhone = dog.mobile || dog.phone;
            const targetPhone = normalizePhone(rawPhone);
            try {
                await wyltoPost('/api/v1/wa/send', {
                    to: targetPhone,
                    message: {
                        type: 'text',
                        text: {
                            message: noteText,
                        },
                    },
                });
            } catch (msgErr) {
                console.warn('[wylto-report] WhatsApp note send failed (non-fatal):', msgErr.message);
            }
        }

        // Update the Wylto contact record with latest info - Fetch first to merge metadata
        const existing = await wyltoGet(`/api/v1/contact/${contactId}`);
        const existingCf = existing.message || {};

        const updatedContact = await wyltoPut(`/api/v1/contact/${contactId}`, {
            name: dog.name || undefined,
            phoneNumber: normalizePhone(dog.mobile || dog.phone),
            message: {
                ...existingCf,
                cfScanCount: newCount,
                cfPaidScans: newPaid,
                cfDogName: dog.name || '',
                cfBreed: dog.breed || '',
                cfAge: `${dog.ageYears || 0}y ${dog.ageMonths || 0}m`,
                cfWeight: dog.weight || '',
                cfFoodType: dog.foodType || '',
                cfNotes: dog.notes || ''
            }
        });

        console.log(`[wylto-report] Updated contact ${contactId}. Scan #${newCount}, paid remaining: ${newPaid}`);

        return res.status(200).json({ ok: true, scanCount: newCount, paidScans: newPaid });
    } catch (err) {
        console.error('[wylto-report]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
