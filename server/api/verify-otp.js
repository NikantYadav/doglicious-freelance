import { createHmac } from 'crypto';

const HS_BASE = 'https://api.hubapi.com';
const hsKey = () => process.env.HUBSPOT_API_KEY;
const SECRET = process.env.OTP_SECRET || 'vetrx-otp-secret-change-in-prod';

// ── Token verification ───────────────────────────────────────────────

function verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;

    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (sig !== expected) return null;   // tampered

    let data;
    try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()); }
    catch { return null; }

    if (Date.now() > data.exp) return null;  // expired
    return data;  // { email, otp, exp }
}

// ── HubSpot helpers ──────────────────────────────────────────────────

async function hsPost(path, body) {
    const authHeader = `Bearer ${hsKey()}`;
    console.log(`[hsPost] path: ${path}, authHeader: ${authHeader.slice(0, 20)}...`);

    const res = await fetch(`${HS_BASE}${path}`, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok && res.status !== 404) {
        throw new Error(`HubSpot ${res.status}: ${JSON.stringify(data?.message || data)}`);
    }
    return data;
}

async function getOrCreateContact(email) {
    // Search by email
    const searchRes = await hsPost('/crm/v3/objects/contacts/search', {
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
        properties: ['email', 'scan_count', 'paid_scans'],
    });

    if (searchRes.results && searchRes.results.length > 0) {
        const c = searchRes.results[0];
        return {
            id: c.id,
            scanCount: parseInt(c.properties.scan_count || '0', 10),
            paidScans: parseInt(c.properties.paid_scans || '0', 10),
        };
    }

    // Create — this is synchronous in HubSpot, ID is returned immediately
    const createRes = await hsPost('/crm/v3/objects/contacts', {
        properties: { email, scan_count: '0' },
    });

    if (!createRes.id) {
        // Contact might already exist (race condition) — search once more
        const retry = await hsPost('/crm/v3/objects/contacts/search', {
            filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
            properties: ['email', 'scan_count'],
        });
        if (retry.results && retry.results.length > 0) {
            const c = retry.results[0];
            return { id: c.id, scanCount: parseInt(c.properties.scan_count || '0', 10) };
        }
        throw new Error('Failed to create HubSpot contact: ' + JSON.stringify(createRes));
    }

    return { id: createRes.id, scanCount: 0, paidScans: 0 };
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

    // 3. Get or create HubSpot contact
    try {
        const { id: contactId, scanCount, paidScans } = await getOrCreateContact(payload.email);
        return res.status(200).json({
            valid: true,
            contactId,
            scanCount,
            paidScans,
            config: {
                numFreeScans: parseInt(process.env.NUM_FREE_SCAN || '1', 10),
                numPaidScansPerPack: parseInt(process.env.NUM_SCAN || '5', 10)
            }
        });
    } catch (err) {
        console.error('[verify-otp HubSpot]', err.message);
        // Return the HS error so it's visible during debugging
        return res.status(200).json({ valid: true, contactId: null, scanCount: 0, paidScans: 0, _hsError: err.message });
    }
}
