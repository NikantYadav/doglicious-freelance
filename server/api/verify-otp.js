import { createHmac } from 'crypto';

const WYLTO_BASE = 'https://server.wylto.com';
const wyltoKey = () => process.env.WYLTO_API_KEY;
const SECRET = process.env.OTP_SECRET || 'vetrx-otp-secret-change-in-prod';

// ── Token verification ────────────────────────────────────────────────

function verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;

    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (sig !== expected) return null; // tampered

    let data;
    try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()); }
    catch { return null; }

    if (Date.now() > data.exp) return null; // expired
    return data; // { phone, otp, exp }
}

// ── Wylto helpers ─────────────────────────────────────────────────────

async function wyltoRequest(method, path, body) {
    const res = await fetch(`${WYLTO_BASE}${path}`, {
        method,
        headers: {
            'Authorization': `Bearer ${wyltoKey()}`,
            'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Wylto ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
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

async function getOrCreateContact(phone) {
    try {
        // 1. Upsert the contact (POST — message field may be incomplete in response)
        const contact = await wyltoRequest('POST', '/api/v1/contact', {
            externalId: phone,
            name: phone,
            phoneNumber: phone,
        });

        // 2. GET the full contact to reliably read existing metadata
        const full = await wyltoRequest('GET', `/api/v1/contact/${contact.id}`);
        let cf = full.message || {};

        // 3. If it's a new contact or missing our custom fields, initialize them
        if (cf.cfScanCount === undefined) {
            cf = { ...cf, cfScanCount: 0, cfPaidScans: 0 };
            await wyltoPut(`/api/v1/contact/${contact.id}`, { message: cf });
        }

        return {
            id: contact.id,
            scanCount: parseInt(cf.cfScanCount ?? '0', 10),
            paidScans: parseInt(cf.cfPaidScans ?? '0', 10),
        };
    } catch (err) {
        console.error('[verify-otp] getOrCreateContact error:', err.message);
        throw err;
    }
}

// ── Handler ──────────────────────────────────────────────────────────

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { token, otp } = req.body || {};
    if (!token || !otp) return res.status(400).json({ error: 'token and otp required' });

    // 1. Verify HMAC signature + expiry
    const payload = verifyToken(token);
    if (!payload) {
        return res.status(200).json({ valid: false, error: 'Code expired or invalid. Request a new one.' });
    }

    // 2. Compare OTP
    if (String(payload.otp) !== String(otp).trim()) {
        return res.status(200).json({ valid: false, error: 'Incorrect code. Please try again.' });
    }

    // 3. Get or create Wylto contact
    try {
        const { id: contactId, scanCount, paidScans } = await getOrCreateContact(payload.phone);
        return res.status(200).json({
            valid: true,
            contactId,
            phone: payload.phone,
            scanCount,
            paidScans,
            config: {
                numFreeScans: parseInt(process.env.NUM_FREE_SCAN || '1', 10),
                numPaidScansPerPack: parseInt(process.env.NUM_SCAN || '5', 10),
            },
        });
    } catch (err) {
        console.error('[verify-otp Wylto]', err.message);
        // Return valid: true so user can still use the app — CRM failure shouldn't block login
        return res.status(200).json({
            valid: true,
            contactId: null,
            phone: payload.phone,
            scanCount: 0,
            paidScans: 0,
            _wyltoError: err.message,
        });
    }
}
