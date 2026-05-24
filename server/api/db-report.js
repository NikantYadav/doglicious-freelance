// server/api/db-report.js
// Saves a VetRx scan report to Supabase and updates the user's scan counts.
// Replaces the old wylto-report.js webhook approach.

import { supabase } from '../utils/supabase.js';
import { normalizePhone } from '../utils/phone.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const {
        contactId,
        dogProfile,
        report,
        selectedPart,
        selectedSymptoms,
        scanCount: prevCount,
        paidScans: prevPaid,
    } = req.body || {};

    try {
        const numFree = parseInt(process.env.NUM_FREE_SCAN || '1', 10);
        const currentScanCount = parseInt(prevCount || '0', 10);
        const currentPaidScans = parseInt(prevPaid || '0', 10);

        const newCount = currentScanCount + 1;
        const isPaidScan = currentScanCount >= numFree;
        const newPaid = isPaidScan ? Math.max(0, currentPaidScans - 1) : currentPaidScans;

        const dog = dogProfile || {};
        const r = report || {};
        const trunc = (str, len = 250) => str ? String(str).substring(0, len) : null;

        const phone = dog.mobile ? normalizePhone(dog.mobile) : (contactId || null);

        // 1. Ensure user exists and get their id
        let userId = null;
        if (phone) {
            const { data: user, error: upsertErr } = await supabase
                .from('vetrx_users')
                .upsert(
                    { phone, name: dog.name || undefined, scan_count: newCount, paid_scans: newPaid },
                    { onConflict: 'phone' }
                )
                .select('id')
                .single();

            if (upsertErr) {
                console.error('[db-report] User upsert error:', upsertErr.message);
            } else {
                userId = user?.id;
            }
        }

        // 2. Insert scan record
        const scanPayload = {
            user_id: userId,
            phone: phone || contactId || 'unknown',
            dog_name: trunc(dog.name, 100),
            breed: trunc(dog.breed, 100),
            age_years: parseInt(dog.ageYears || '0', 10) || null,
            age_months: parseInt(dog.ageMonths || '0', 10) || null,
            weight: dog.weight ? `${dog.weight}kg` : null,
            food_type: trunc(dog.foodType, 100),
            food_grams: dog.foodGrams ? `${dog.foodGrams}g` : null,
            food_times: trunc(dog.foodTimes, 100),
            notes: trunc(dog.notes),
            body_part: trunc(selectedPart, 100),
            symptoms: Array.isArray(selectedSymptoms) ? selectedSymptoms.join(', ') : null,
            diagnosis: trunc(r.diagnosis),
            severity: trunc(r.severity, 100),
            urgency: trunc(r.urgency, 100),
            health_score: r.healthScore || null,
            confidence: r.confidence || null,
            diet_advice: trunc(r.diet),
            is_paid_scan: isPaidScan,
        };

        // Remove null values
        Object.keys(scanPayload).forEach(k => scanPayload[k] === null && delete scanPayload[k]);

        const { error: scanErr } = await supabase.from('vetrx_scans').insert(scanPayload);
        if (scanErr) {
            console.error('[db-report] Scan insert error:', scanErr.message);
        }

        console.log(`[db-report] Saved scan #${newCount} for ${phone}, paid remaining: ${newPaid}`);

        return res.status(200).json({ ok: true, scanCount: newCount, paidScans: newPaid });
    } catch (err) {
        console.error('[db-report]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
