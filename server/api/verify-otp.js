import { createHmac } from 'crypto';

const KYLAS_BASE = 'https://api.kylas.io';
const kylasKey = () => process.env.KYLAS_API_KEY;
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

// ── Kylas helpers ──────────────────────────────────────────────────

async function kylasPost(path, body) {
    console.log(`[kylasPost] path: ${path}`);
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'POST',
        headers: {
            'api-key': kylasKey(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Kylas ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
}

async function getOrCreateContact(email) {
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
        const c = searchRes.content.find(lead => lead.emails && lead.emails.some(e => e.value === email)) || searchRes.content[0];
        const cf = c.customFieldValues || {};
        return {
            id: c.id,
            scanCount: parseInt(cf.cfScanCount || cf.scan_count || '0', 10),
            paidScans: parseInt(cf.cfPaidScans || cf.paid_scans || '0', 10),
        };
    }

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

    // 3. Get or create Kylas lead
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
        console.error('[verify-otp Kylas]', err.message);
        // Return the error so it's visible during debugging
        return res.status(200).json({ valid: true, contactId: null, scanCount: 0, paidScans: 0, _kylasError: err.message });
    }
}
