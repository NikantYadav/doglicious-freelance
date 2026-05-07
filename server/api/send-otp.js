import { createHmac } from 'crypto';

const SECRET = process.env.OTP_SECRET || 'vetrx-otp-secret-change-in-prod';
const WYLTO_BASE = 'https://server.wylto.com';
const wyltoKey = () => process.env.WYLTO_API_KEY;

// ── Token helpers ─────────────────────────────────────────────────────

export function signOtpToken(phone, otp) {
    const payload = Buffer.from(JSON.stringify({
        phone,
        otp,
        exp: Date.now() + 10 * 60 * 1000, // 10 min
    })).toString('base64url');

    const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
}

// ── WhatsApp OTP via Wylto ────────────────────────────────────────────

async function sendOtpWhatsApp(phone, otp) {
    const templateName = process.env.WYLTO_OTP_TEMPLATE || 'vetrx';
    const language = process.env.WYLTO_OTP_LANGUAGE || 'en';

    const body = {
        to: phone,
        message: {
            type: 'template',
            template: {
                templateName,
                language,
                body: [
                    {
                        type: 'text',
                        text: String(otp),
                    },
                ],
                buttons: [
                    {
                        type: 'url',
                        payload: String(otp),
                    },
                ],
                category: 'AUTHENTICATION',
            },
        },
    };

    const res = await fetch(`${WYLTO_BASE}/api/v1/wa/send?sync=true`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${wyltoKey()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Wylto WhatsApp error: ${res.status} ${err}`);
    }

    return res.json();
}

// ── Handler ──────────────────────────────────────────────────────────

import { normalizePhone } from '../utils/phone.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { phone } = req.body || {};
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
        return res.status(400).json({ error: 'Valid phone number required' });
    }

    const normPhone = normalizePhone(phone);

    try {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const token = signOtpToken(normPhone, otp);

        await sendOtpWhatsApp(normPhone, otp);

        return res.status(200).json({ ok: true, token });
    } catch (err) {
        console.error('[send-otp]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
