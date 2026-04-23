
// api/hs-report.js — Vercel Serverless Function
// Updates a HubSpot contact with full VetRx Scan lead data and increments scan_count.

const HS_BASE = 'https://api.hubapi.com';
const hsKey = () => process.env.HUBSPOT_API_KEY;

async function hsGet(path) {
    const res = await fetch(`${HS_BASE}${path}`, {
        headers: { Authorization: `Bearer ${hsKey()}`, 'Content-Type': 'application/json' },
    });
    return res.json();
}

async function hsPatch(path, body) {
    const res = await fetch(`${HS_BASE}${path}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${hsKey()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { contactId, dogProfile, report, selectedPart, selectedSymptoms, initialAnalysis } = req.body || {};
    if (!contactId) return res.status(400).json({ error: 'contactId required' });

    try {
        // Read current scan_count
        const current = await hsGet(`/crm/v3/objects/contacts/${contactId}?properties=scan_count`);
        const prevCount = parseInt(current.properties?.scan_count || '0', 10);
        const newCount = prevCount + 1;

        const dog = dogProfile || {};
        const r = report || {};

        // Map to Lead CRM schema
        const properties = {
            // Identity
            scan_count: String(newCount),
            dog_name: dog.name || '',
            dog_breed: dog.breed || '',
            dog_age_years: String(parseInt(dog.ageYears || '0', 10)),
            dog_weight_kg: dog.weight ? `${dog.weight}kg` : '',
            phone: dog.mobile || '',

            // Diagnosis
            diagnosis: r.diagnosis || '',
            severity: r.severity || '',
            body_part: selectedPart || '',
            health_score: String(r.healthScore || 0),

            // Diet
            diet_advice: r.diet || '',
            current_food: dog.foodType || '',
            food_grams: dog.foodGrams ? `${dog.foodGrams}g` : '',
            food_times: dog.foodTimes || '',

            // Symptoms
            symptoms: Array.isArray(selectedSymptoms) ? selectedSymptoms.join(', ') : '',

            // Lead status
            lead_status: 'new',
            hs_lead_status: 'NEW',
        };

        await hsPatch(`/crm/v3/objects/contacts/${contactId}`, { properties });

        return res.status(200).json({ ok: true, scanCount: newCount });
    } catch (err) {
        console.error('[hs-report]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
