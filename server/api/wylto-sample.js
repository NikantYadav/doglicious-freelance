// server/api/wylto-sample.js
// Handles sample booking CRM push via Wylto.

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

    const { dogName, phone, address, city, pincode, recipe, grams, price } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const normPhone = normalizePhone(phone);

    try {
        // 1. Create or Get contact
        let contact = await wyltoPost('/api/v1/contact', {
            externalId: normPhone,
            name: `${dogName || 'Dog Parent'} (${normPhone})`,
            phoneNumber: normPhone
        });

        // 2. Merge existing metadata with new sample data
        const rawCf = contact.message;
        const existingCf = rawCf ? (typeof rawCf === 'string' ? JSON.parse(rawCf) : rawCf) : {};
        const newCf = {
            ...existingCf,
            cfDogName: dogName || '',
            cfAddress: address || '',
            cfCity: city || '',
            cfPincode: pincode || '',
            cfRecipe: recipe || '',
            cfGrams: grams || '',
            cfPrice: price || '',
            cfStatus: 'booked'
        };

        // 3. Update contact with merged metadata
        contact = await wyltoPut(`/api/v1/contact/${contact.id}`, {
            message: JSON.stringify(newCf)
        });

        // 2. Send WhatsApp message with booking details
        const messageText = `📦 New Sample Booking!\nDog: ${dogName || 'N/A'}\nRecipe: ${recipe} (${grams}g)\nAmount: ₹${price}\nAddress: ${address}, ${city} - ${pincode}\nStatus: booked`.trim();

        try {
            await wyltoPost('/api/v1/wa/send', {
                to: normPhone,
                message: {
                    type: 'text',
                    text: {
                        message: messageText,
                    }
                }
            });
        } catch (msgErr) {
            console.warn('[wylto-sample] WhatsApp notification failed (non-fatal):', msgErr.message);
        }

        return res.status(200).json({ ok: true, contactId: contact.id });
    } catch (err) {
        console.error('[wylto-sample]', err);
        // Fail gracefully so user flow isn't blocked
        return res.status(200).json({ ok: false, error: err.message });
    }
}
