import { createHmac } from 'crypto';
import { supabase } from '../utils/supabase.js';

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

// ── Upsert user + fetch scan counts from Supabase ────────────────────

async function getOrCreateUser(phone) {
    // Upsert: create user if not exists, return existing data if they do
    const { data, error } = await supabase
        .from('vetrx_users')
        .upsert({ phone }, { onConflict: 'phone', ignoreDuplicates: false })
        .select('id, phone, scan_count, paid_scans')
        .single();

    if (error) throw error;
    return data;
}

async function recordLoginEvent(phone) {
    await supabase.from('wa_auth_users').insert({ phone });
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

    // 3. Upsert user in Supabase and record login event (non-blocking for login event)
    let user;
    try {
        user = await getOrCreateUser(payload.phone);
    } catch (err) {
        console.error('[verify-otp] Supabase upsert failed:', err.message);
        // Fail gracefully — return zero counts so user can still proceed
        user = { id: null, phone: payload.phone, scan_count: 0, paid_scans: 0 };
    }

    // Record login event non-blocking
    recordLoginEvent(payload.phone).catch(err =>
        console.warn('[verify-otp] Login event insert failed (non-fatal):', err.message)
    );

    return res.status(200).json({
        valid: true,
        contactId: payload.phone,
        phone: payload.phone,
        scanCount: user.scan_count ?? 0,
        paidScans: user.paid_scans ?? 0,
        config: {
            numFreeScans: parseInt(process.env.NUM_FREE_SCAN || '1', 10),
            numPaidScansPerPack: parseInt(process.env.NUM_SCAN || '5', 10),
        },
    });
}
