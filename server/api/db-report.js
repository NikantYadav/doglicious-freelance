// server/api/db-report.js  v2
// Saves a VetRx scan report to Supabase and updates the user's scan counts.

import { supabase } from '../utils/supabase.js';
import { normalizePhone } from '../utils/phone.js';

console.log('[db-report] v2 loaded — full report storage enabled');

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
    } = req.body || {};

    try {
        const numFree = parseInt(process.env.NUM_FREE_SCAN || '1', 10);

        const lookupPhone = dogProfile?.mobile
            ? normalizePhone(dogProfile.mobile)
            : (contactId || null);

        // Fetch authoritative counts from DB
        let currentScanCount = 0;
        let currentPaidScans = 0;
        if (lookupPhone) {
            try {
                const { data: user, error: userErr } = await supabase
                    .from('vetrx_users')
                    .select('scan_count, paid_scans')
                    .eq('phone', lookupPhone)
                    .single();
                if (!userErr && user) {
                    currentScanCount = parseInt(user.scan_count || 0, 10);
                    currentPaidScans = parseInt(user.paid_scans || 0, 10);
                }
            } catch (e) {
                console.warn('[db-report] Could not read user counts:', e.message);
            }
        }

        const newCount  = currentScanCount + 1;
        const isPaidScan = currentScanCount >= numFree;
        const newPaid   = isPaidScan ? Math.max(0, currentPaidScans - 1) : currentPaidScans;

        const dog = dogProfile || {};
        const r   = report    || {};

        // trunc only for short identifier fields — text fields get full length
        const trunc = (str, len = 5000) => str ? String(str).substring(0, len) : null;

        const phone = lookupPhone;

        // 1. Upsert user
        let userId = null;
        if (phone) {
            try {
                const { data: user, error: upsertErr } = await supabase
                    .from('vetrx_users')
                    .upsert(
                        { phone, scan_count: newCount, paid_scans: newPaid },
                        { onConflict: 'phone' }
                    )
                    .select('id')
                    .single();
                if (upsertErr) {
                    console.error('[db-report] User upsert error:', upsertErr.message);
                } else {
                    userId = user?.id;
                }
            } catch (e) {
                console.error('[db-report] User upsert failed:', e.message);
            }
        }

        // 2. Build scan payload — store everything
        const scanPayload = {
            user_id:                userId,
            phone:                  phone || contactId || 'unknown',
            // Dog profile
            dog_name:               trunc(dog.name, 100),
            breed:                  trunc(dog.breed, 100),
            age_years:              parseInt(dog.ageYears  || '0', 10) || null,
            age_months:             parseInt(dog.ageMonths || '0', 10) || null,
            weight:                 dog.weight    ? `${dog.weight}kg`    : null,
            food_type:              trunc(dog.foodType, 100),
            food_grams:             dog.foodGrams ? `${dog.foodGrams}g`  : null,
            food_times:             trunc(dog.foodTimes, 100),
            notes:                  trunc(dog.notes, 1000),
            // Scan context
            body_part:              trunc(selectedPart, 100),
            symptoms:               Array.isArray(selectedSymptoms)
                                        ? selectedSymptoms.join(', ')
                                        : null,
            // Flat report fields (queryable)
            diagnosis:              trunc(r.diagnosis, 500),
            severity:               trunc(r.severity, 100),
            urgency:                trunc(r.urgency, 200),
            health_score:           r.healthScore   != null ? r.healthScore   : null,
            health_target:          r.healthTarget  != null ? r.healthTarget  : null,
            days_to_improve:        r.daysToImprove != null ? r.daysToImprove : null,
            confidence:             r.confidence    != null ? r.confidence    : null,
            confidence_label:       trunc(r.confidenceLabel, 100),
            // Long text fields — no truncation
            diet_advice:            r.diet                  || null,
            image_findings:         r.imageFindings         || null,
            summary:                r.summary               || null,
            current_diet_assessment: r.currentDietAssessment || null,
            // JSON array fields
            steps:                  Array.isArray(r.steps)    ? r.steps    : null,
            natural_remedies:       Array.isArray(r.natural)  ? r.natural  : null,
            red_flags:              Array.isArray(r.redFlags) ? r.redFlags : null,
            vet_now:                r.vetNow || false,
            is_paid_scan:           isPaidScan,
            // Full report blob — always store, even if empty object
            report_json:            Object.keys(r).length > 0 ? r : null,
        };

        // Log what we're about to save (keys with values)
        const filledKeys = Object.entries(scanPayload)
            .filter(([, v]) => v != null && v !== false)
            .map(([k]) => k);
        console.log(`[db-report] v2 saving scan #${newCount} for ${phone} — fields: ${filledKeys.join(', ')}`);

        // Remove nulls before insert
        const cleanPayload = Object.fromEntries(
            Object.entries(scanPayload).filter(([, v]) => v != null)
        );

        const { error: scanErr } = await supabase.from('vetrx_scans').insert(cleanPayload);
        if (scanErr) {
            console.error('[db-report] Scan insert error:', scanErr.message, scanErr.details);
        } else {
            console.log(`[db-report] v2 scan saved OK — #${newCount} for ${phone}`);
        }

        return res.status(200).json({ ok: true, scanCount: newCount, paidScans: newPaid });
    } catch (err) {
        console.error('[db-report] fatal:', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
