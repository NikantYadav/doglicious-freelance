// server/api/db-lead.js
// Saves a generic lead (from tool CTAs, homepage forms, etc.) to Supabase.
// Replaces the old wylto-lead.js webhook approach.

import { supabase } from '../utils/supabase.js';
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
        const { error } = await supabase.from('leads').insert({
            phone: normPhone,
            name: name || null,
            email: email || null,
            source: source || 'website',
            extra_data: Object.keys(customData).length > 0 ? customData : null,
        });

        if (error) throw error;

        console.log(`[db-lead] Lead saved for ${normPhone} | source: ${source || 'website'}`);
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[db-lead]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
