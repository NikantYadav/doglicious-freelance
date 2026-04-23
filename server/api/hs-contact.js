
// api/hs-contact.js — Vercel Serverless Function
// Gets or creates a HubSpot contact by email, returns id + scanCount + paidScans.

const HS_BASE = 'https://api.hubapi.com';
const hsKey = () => process.env.HUBSPOT_API_KEY;

async function hsPost(path, body) {
    const res = await fetch(`${HS_BASE}${path}`, {
        method: 'POST',
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

    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });

    try {
        const searchRes = await hsPost('/crm/v3/objects/contacts/search', {
            filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
            properties: ['email', 'scan_count', 'paid_scans'],
        });

        if (searchRes.results && searchRes.results.length > 0) {
            const c = searchRes.results[0];
            return res.status(200).json({
                id: c.id,
                scanCount: parseInt(c.properties.scan_count || '0', 10),
                paidScans: parseInt(c.properties.paid_scans || '0', 10),
            });
        }

        // Create new contact
        const createRes = await hsPost('/crm/v3/objects/contacts', {
            properties: { email, scan_count: '0', paid_scans: '0' },
        });
        return res.status(200).json({ id: createRes.id, scanCount: 0, paidScans: 0 });
    } catch (err) {
        console.error('[hs-contact]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
