import crypto from 'crypto';
import { supabase } from '../utils/supabase.js';
import { normalizePhone } from '../utils/phone.js';

const PAYU_SALT = () => process.env.PAYU_SALT;

const WYLTO_BASE = 'https://server.wylto.com';
const wyltoKey = () => process.env.WYLTO_API_KEY;

/**
 * Sends a WhatsApp order confirmation message via Wylto
 * using the pre-approved 'confirmation' template.
 */
async function sendConfirmationWhatsApp({ phone, txnid }) {
    const key = wyltoKey();
    if (!key) {
        console.warn('[payu-success] WYLTO_API_KEY not set — skipping confirmation WhatsApp');
        return;
    }

    const body = {
        to: phone,
        message: {
            type: 'template',
            template: {
                templateName: 'confirmation',
                language: 'en_US',
                category: 'UTILITY',
            },
        },
    };

    try {
        const res = await fetch(`${WYLTO_BASE}/api/v1/wa/send?sync=true`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok || data.status === 'failed') {
            console.error('[payu-success] Wylto confirmation failed:', data.error || JSON.stringify(data));
        } else {
            console.log(`[payu-success] Confirmation WhatsApp sent to ${phone} (txnid: ${txnid})`);
        }
    } catch (err) {
        // Non-fatal — don't block the payment success flow
        console.error('[payu-success] Wylto confirmation error (non-fatal):', err.message);
    }
}

// Reverse hash: SHA512( salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key )
function verifyReverseHash(params, salt) {
    const { status, udf5 = '', udf4 = '', udf3 = '', udf2 = '', udf1 = '',
        email, firstname, productinfo, amount, txnid, key, hash,
        additional_charges } = params;

    const core = `${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const str1 = `${salt}|${core}`;
    const str2 = `${additional_charges}|${salt}|${core}`;

    const hash1 = crypto.createHash('sha512').update(str1).digest('hex');
    if (hash1 === hash) return true;

    if (additional_charges) {
        const hash2 = crypto.createHash('sha512').update(str2).digest('hex');
        if (hash2 === hash) return true;
    }

    return false;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const params = req.body || {};
    const salt = PAYU_SALT();
    const numScans = parseInt(process.env.NUM_SCAN || '5', 10);

    // 1. Validate reverse hash
    if (!verifyReverseHash(params, salt)) {
        console.error('[payu-success] Hash mismatch! Possible tampering.', {
            txnid: params.txnid,
            status: params.status,
        });
        return redirectToFrontend(res, 'payment_failed', 'Hash mismatch', {}, params.udf2);
    }

    // 2. Check payment status
    if (params.status !== 'success') {
        console.warn('[payu-success] Non-success status:', params.status);
        return redirectToFrontend(res, 'payment_failed', params.status, {}, params.udf2);
    }

    // 3. Parse order data from udf fields
    // udf1 = phone, udf3 = price, udf4 = recipe|grams|dogName, udf5 = address|city|pincode
    const phone = params.udf1 ? normalizePhone(params.udf1) : '';
    const price = params.udf3 || '';
    const udf4Parts = (params.udf4 || '').split('|');
    const udf5Parts = (params.udf5 || '').split('|');
    const recipe = udf4Parts[0] || null;
    const grams = udf4Parts[1] || null;
    const dogName = udf4Parts[2] || null;
    const address = udf5Parts[0] || null;
    const city = udf5Parts[1] || null;
    const pincode = udf5Parts[2] || null;

    // 4. Update booking in sample_bookings
    if (phone && (recipe || grams || params.udf4)) {
        try {
            const { error: bookingErr } = await supabase
                .from('sample_bookings')
                .update({ status: 'COMPLETED' })
                .eq('txnid', params.txnid);

            if (bookingErr) {
                console.error('[payu-success] sample_bookings update error:', bookingErr.message);
            } else {
                console.log(`[payu-success] Booking marked COMPLETED for txnid ${params.txnid} (${phone})`);
                // Send WhatsApp order confirmation (non-blocking)
                sendConfirmationWhatsApp({ phone, txnid: params.txnid });
            }
        } catch (err) {
            console.error('[payu-success] Booking update failed (non-fatal):', err.message);
        }
    }

    // 5. Update VetRx paid_scans if applicable (udf3 was previously paidScans for VetRx)
    // Only do this if udf4 is empty (VetRx flow, not sample booking)
    const isVetRxFlow = !params.udf4;
    if (isVetRxFlow && phone) {
        const prevPaid = parseInt(params.udf3 || '0', 10);
        const newPaid = prevPaid + numScans;
        try {
            const { error } = await supabase
                .from('vetrx_users')
                .upsert({ phone, paid_scans: newPaid }, { onConflict: 'phone' });
            if (error) throw error;
            console.log(`[payu-success] VetRx: granted ${numScans} scans to ${phone}. New total: ${newPaid}`);
            return redirectToFrontend(res, 'payment_success', null, { paidScans: newPaid, txnid: params.txnid }, params.udf2);
        } catch (err) {
            console.error('[payu-success] VetRx Supabase update failed:', err.message);
            return redirectToFrontend(res, 'payment_success', 'db_update_failed', { paidScans: newPaid, txnid: params.txnid }, params.udf2);
        }
    }

    return redirectToFrontend(res, 'payment_success', null, { txnid: params.txnid }, params.udf2);
}

function redirectToFrontend(res, status, error, data = {}, returnPath = '/') {
    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    const { origin } = new URL(base);
    const safePath = (returnPath || '/').replace(/[^a-zA-Z0-9/_-]/g, '') || '/';
    const queryParams = new URLSearchParams({ payu_status: status, ...data });
    if (error) queryParams.set('error', error);
    res.redirect(302, `${origin}${safePath}?${queryParams.toString()}`);
}
