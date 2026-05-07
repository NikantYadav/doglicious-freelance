// api/wylto-contact.js
// Gets or creates a Wylto contact by phone number.
// Returns id + scanCount + paidScans.

const WYLTO_BASE = 'https://server.wylto.com';
const wyltoKey = () => process.env.WYLTO_API_KEY;

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
        throw new Error(`Wylto error: ${res.status} ${err}`);
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

    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const normPhone = normalizePhone(phone);

    try {
        // 1. Create or get contact (upsert by externalId = normPhone)
        const contact = await wyltoPost('/api/v1/contact', {
            externalId: normPhone,
            name: normPhone,
            phoneNumber: normPhone,
            message: {
                cfScanCount: 0,
                cfPaidScans: 0
            }
        });

        // 2. GET the full contact to reliably read existing custom fields
        const full = await (async () => {
            const r = await fetch(`${WYLTO_BASE}/api/v1/contact/${contact.id}`, {
                headers: { 'Authorization': `Bearer ${wyltoKey()}`, 'Content-Type': 'application/json' }
            });
            return r.json();
        })();
        let cf = full.message || {};

        // 3. If custom fields are still missing, initialize them
        if (cf.cfScanCount === undefined) {
            cf = { ...cf, cfScanCount: 0, cfPaidScans: 0 };
            await wyltoPut(`/api/v1/contact/${contact.id}`, { message: cf });
        }

        return res.status(200).json({
            id: contact.id,
            scanCount: parseInt(cf.cfScanCount ?? '0', 10),
            paidScans: parseInt(cf.cfPaidScans ?? '0', 10),
        });
    } catch (err) {
        console.error('[wylto-contact]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
