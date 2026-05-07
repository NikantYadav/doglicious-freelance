// server/api/wylto-lead.js
// Handles generic lead push via Wylto.
// Stores all custom data in the 'message' field as a JSON object.

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

    const { name, phone, email, source, ...customData } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const normPhone = normalizePhone(phone);

    try {
        // 1. Create or get contact (upsert by externalId = normPhone)
        const contact = await wyltoPost('/api/v1/contact', {
            externalId: normPhone,
            name: name || normPhone,
            phoneNumber: normPhone,
        });

        // 2. GET the full contact to safely read existing metadata before merging
        const existing = await wyltoGet(`/api/v1/contact/${contact.id}`);
        const rawCf = existing.message;
        const existingCf = rawCf ? (typeof rawCf === 'string' ? JSON.parse(rawCf) : rawCf) : {};

        // 3. Merge existing metadata with new lead data (don't overwrite with empty values)
        const newCf = {
            ...existingCf,
            cfSource: source || existingCf.cfSource || 'website',
            cfEmail: email || existingCf.cfEmail || '',
            cfName: name || existingCf.cfName || '',
            ...Object.keys(customData).reduce((acc, key) => {
                const cfKey = `cf${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                acc[cfKey] = customData[key] ?? existingCf[cfKey] ?? '';
                return acc;
            }, {})
        };

        // 4. Update contact with merged metadata
        const updated = await wyltoPut(`/api/v1/contact/${contact.id}`, {
            message: JSON.stringify(newCf),
        });

        console.log(`[wylto-lead] Lead captured for ${normPhone} | source: ${source || 'website'}`);
        return res.status(200).json({ ok: true, contactId: updated.id });
    } catch (err) {
        console.error('[wylto-lead]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
