// server/api/vetrx-profile.js
// GET  /api/vetrx/profile?phone=...  → returns user info + scan history
// POST /api/vetrx/profile            → update user name

import { supabase } from '../utils/supabase.js';
import { normalizePhone } from '../utils/phone.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // ── GET: fetch profile + scan history ────────────────────────────
    if (req.method === 'GET') {
        const rawPhone = req.query.phone;
        if (!rawPhone) return res.status(400).json({ error: 'phone query param required' });

        const phone = normalizePhone(rawPhone);

        try {
            // Fetch user record
            const { data: user, error: userErr } = await supabase
                .from('vetrx_users')
                .select('id, phone, name, scan_count, paid_scans, created_at')
                .eq('phone', phone)
                .single();

            if (userErr || !user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Fetch scan history (most recent first, limit 50)
            const { data: scans, error: scansErr } = await supabase
                .from('vetrx_scans')
                .select(
                    'id, dog_name, breed, age_years, age_months, weight, food_type, food_grams, food_times, notes, ' +
                    'body_part, symptoms, diagnosis, severity, urgency, health_score, ' +
                    'health_target, days_to_improve, confidence, confidence_label, diet_advice, image_findings, ' +
                    'summary, steps, natural_remedies, red_flags, current_diet_assessment, ' +
                    'vet_now, is_paid_scan, report_json, created_at'
                )
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (scansErr) {
                console.error('[vetrx-profile] Scans fetch error:', scansErr.message);
            }

            return res.status(200).json({
                user: {
                    id: user.id,
                    phone: user.phone,
                    name: user.name || null,
                    scanCount: user.scan_count ?? 0,
                    paidScans: user.paid_scans ?? 0,
                    memberSince: user.created_at,
                },
                scans: scans || [],
            });
        } catch (err) {
            console.error('[vetrx-profile] GET error:', err);
            return res.status(500).json({ error: err.message || 'Internal error' });
        }
    }

    // ── POST: update user name ────────────────────────────────────────
    if (req.method === 'POST') {
        const { phone: rawPhone, name } = req.body || {};
        if (!rawPhone) return res.status(400).json({ error: 'phone required' });
        if (!name || typeof name !== 'string' || name.trim().length < 1) {
            return res.status(400).json({ error: 'name required' });
        }

        const phone = normalizePhone(rawPhone);
        const trimmedName = name.trim().substring(0, 100);

        try {
            const { data, error } = await supabase
                .from('vetrx_users')
                .update({ name: trimmedName })
                .eq('phone', phone)
                .select('id, phone, name, scan_count, paid_scans')
                .single();

            if (error) throw error;

            return res.status(200).json({
                ok: true,
                user: {
                    id: data.id,
                    phone: data.phone,
                    name: data.name,
                    scanCount: data.scan_count ?? 0,
                    paidScans: data.paid_scans ?? 0,
                },
            });
        } catch (err) {
            console.error('[vetrx-profile] POST error:', err);
            return res.status(500).json({ error: err.message || 'Internal error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
