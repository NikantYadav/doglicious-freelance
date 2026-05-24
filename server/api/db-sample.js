// server/api/db-sample.js
// Saves a sample food booking to Supabase.
// Replaces the old wylto-sample.js webhook approach.

import { supabase } from '../utils/supabase.js';
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
        const { error } = await supabase.from('sample_bookings').insert({
            phone: normPhone,
            dog_name: dogName || null,
            address: address || null,
            city: city || null,
            pincode: pincode || null,
            recipe: recipe || null,
            grams: grams || null,
            price: price || null,
            status: 'booked',
        });

        if (error) throw error;

        console.log(`[db-sample] Sample booking saved for ${normPhone}`);
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[db-sample]', err);
        // Fail gracefully so user flow isn't blocked
        return res.status(200).json({ ok: false, error: err.message });
    }
}
