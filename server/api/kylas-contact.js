// api/kylas-contact.js — Vercel Serverless Function
// Gets or creates a Kylas lead by email, returns id + scanCount + paidScans.

const KYLAS_BASE = 'https://api.kylas.io';
const kylasKey = () => process.env.KYLAS_API_KEY;

async function kylasPost(path, body) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'POST',
        headers: {
            'api-key': kylasKey(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas error: ${res.status} ${err}`);
    }
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
        const searchRes = await kylasPost('/v1/search/lead?size=10', {
            fields: ['emails', 'customFieldValues', 'id'],
            jsonRule: {
                rules: [
                    {
                        id: 'multi_field',
                        field: 'multi_field',
                        type: 'multi_field',
                        input: 'multi_field',
                        operator: 'multi_field',
                        value: email
                    }
                ],
                condition: 'AND',
                valid: true
            }
        });

        if (searchRes.content && searchRes.content.length > 0) {
            // Find an exact email match just in case
            const c = searchRes.content.find(lead => lead.emails && lead.emails.some(e => e.value === email)) || searchRes.content[0];
            const cf = c.customFieldValues || {};
            return res.status(200).json({
                id: c.id,
                scanCount: parseInt(cf.cfScanCount || cf.scan_count || '0', 10),
                paidScans: parseInt(cf.cfPaidScans || cf.paid_scans || '0', 10),
            });
        }

        // Create new lead
        const createRes = await kylasPost('/v1/leads/', {
            firstName: 'Unknown',
            lastName: email.split('@')[0],
            emails: [
                {
                    type: 'OFFICE',
                    value: email,
                    primary: true
                }
            ],
            customFieldValues: {
                cfScanCount: 0,
                cfPaidScans: 0
            }
        });

        return res.status(200).json({ id: createRes.id, scanCount: 0, paidScans: 0 });
    } catch (err) {
        console.error('[kylas-contact]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
