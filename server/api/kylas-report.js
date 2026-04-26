// api/kylas-report.js — Vercel Serverless Function
// Updates a Kylas lead with full VetRx Scan data and increments scan count.

const KYLAS_BASE = 'https://api.kylas.io';
const kylasKey = () => process.env.KYLAS_API_KEY;

async function kylasGet(path) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'GET',
        headers: { 'api-key': kylasKey(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas GET error: ${res.status} ${err}`);
    }
    return res.json();
}

async function kylasPost(path, body) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'POST',
        headers: { 'api-key': kylasKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas POST error: ${res.status} ${err}`);
    }
    return res.json();
}

async function kylasPut(path, body) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'PUT',
        headers: { 'api-key': kylasKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas PUT error: ${res.status} ${err}`);
    }
    return res.json();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { contactId, dogProfile, report, selectedPart, selectedSymptoms } = req.body || {};
    if (!contactId) return res.status(400).json({ error: 'contactId required' });

    try {
        const lead = await kylasGet(`/v1/leads/${contactId}`);
        const cf = lead.customFieldValues || {};

        const prevCount = parseInt(cf.cfScanCount || cf.scan_count || '0', 10);
        const prevPaid = parseInt(cf.cfPaidScans || cf.paid_scans || '0', 10);
        const newCount = prevCount + 1;

        const numFree = parseInt(process.env.NUM_FREE_SCAN || '1', 10);
        const isPaidScan = prevCount >= numFree;
        const newPaid = isPaidScan ? Math.max(0, prevPaid - 1) : prevPaid;

        const dog = dogProfile || {};
        const r = report || {};

        if (!lead.customFieldValues) lead.customFieldValues = {};

        const trunc = (str, len = 250) => str ? String(str).substring(0, len) : '';

        Object.assign(lead.customFieldValues, {
            cfScanCount: newCount,
            cfPaidScans: newPaid,
            cfDogName: trunc(dog.name, 100),
            cfDogBreed: trunc(dog.breed, 100),
            cfDogAgeYears: parseInt(dog.ageYears || '0', 10),
            cfDogWeightKg: trunc(dog.weight ? `${dog.weight}kg` : '', 100),

            cfDiagnosis: trunc(r.diagnosis),
            cfSeverity: trunc(r.severity, 100),
            cfBodyPart: trunc(selectedPart, 100),
            cfHealthScore: r.healthScore || 0,

            cfDietAdvice: trunc(r.diet),
            cfCurrentFood: trunc(dog.foodType),
            cfFoodGrams: trunc(dog.foodGrams ? `${dog.foodGrams}g` : '', 100),
            cfFoodTimes: trunc(dog.foodTimes, 100),

            cfSymptoms: trunc(Array.isArray(selectedSymptoms) ? selectedSymptoms.join(', ') : ''),
            cfNotes: trunc(dog.notes)
        });

        if (dog.mobile) {
            if (!lead.phoneNumbers) lead.phoneNumbers = [];
            if (!lead.phoneNumbers.some(p => p.value === dog.mobile)) {
                lead.phoneNumbers.push({
                    type: 'MOBILE',
                    code: 'IN',
                    dialCode: '+91',
                    value: dog.mobile,
                    primary: lead.phoneNumbers.length === 0
                });
            }
        }

        delete lead.createdAt;
        delete lead.updatedAt;
        delete lead.createdBy;
        delete lead.updatedBy;
        delete lead.recordActions;
        delete lead.metaData;
        delete lead.latestActivityCreatedAt;
        delete lead.createdViaId;
        delete lead.createdViaName;
        delete lead.createdViaType;
        delete lead.updatedViaId;
        delete lead.updatedViaName;
        delete lead.updatedViaType;

        await kylasPut(`/v1/leads/${contactId}`, lead);

        // Add Note to Lead
        const noteDescription = `Dog Scan Report
Name: ${dog.name || 'N/A'}
Breed: ${dog.breed || 'N/A'}
Age: ${dog.ageYears || '0'} years
Weight: ${dog.weight ? dog.weight + 'kg' : 'N/A'}
Body Part: ${selectedPart || 'N/A'}
Symptoms: ${Array.isArray(selectedSymptoms) ? selectedSymptoms.join(', ') : 'N/A'}
Health Score: ${r.healthScore || 0}
Diagnosis: ${r.diagnosis || 'N/A'}
Severity: ${r.severity || 'N/A'}
Diet Advice: ${r.diet || 'N/A'}
Current Food: ${dog.foodType || 'N/A'}
Food Grams: ${dog.foodGrams ? dog.foodGrams + 'g' : 'N/A'}
Food Frequency: ${dog.foodTimes || 'N/A'}
Owner Notes: ${dog.notes || 'N/A'}
`.trim();

        await kylasPost('/v1/notes/relation', {
            sourceEntity: {
                description: noteDescription
            },
            targetEntityId: parseInt(contactId, 10),
            targetEntityType: "LEAD"
        });

        return res.status(200).json({ ok: true, scanCount: newCount, paidScans: newPaid });
    } catch (err) {
        console.error('[kylas-report]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
