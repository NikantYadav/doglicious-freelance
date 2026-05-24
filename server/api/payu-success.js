// api/payu-success.js
// PayU POSTs to this URL on successful payment.
// We verify the reverse hash, then grant the user NUM_SCAN extra scans via Supabase.

import crypto from 'crypto';
import { supabase } from '../utils/supabase.js';

const PAYU_SALT = () => process.env.PAYU_SALT;

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

    // ----- 1. Validate reverse hash -----
    if (!verifyReverseHash(params, salt)) {
        console.error('[payu-success] Hash mismatch! Possible tampering.', {
            txnid: params.txnid,
            status: params.status,
        });
        return redirectToFrontend(res, 'payment_failed', 'Hash mismatch', {}, params.udf2);
    }

    // ----- 2. Check payment status -----
    if (params.status !== 'success') {
        console.warn('[payu-success] Non-success status:', params.status);
        return redirectToFrontend(res, 'payment_failed', params.status, {}, params.udf2);
    }

    // ----- 3. Update user paid_scans in Supabase -----
    // udf1 = phone (used as contactId), udf3 = current paidScans count at payment initiation
    const phone = params.udf1;
    const prevPaid = parseInt(params.udf3 || '0', 10);
    const newPaid = prevPaid + numScans;

    if (phone) {
        try {
            // Upsert user (creates if not exists) and set new paid_scans
            const { error } = await supabase
                .from('vetrx_users')
                .upsert(
                    { phone, paid_scans: newPaid },
                    { onConflict: 'phone' }
                );

            if (error) throw error;

            console.log(`[payu-success] Payment granted ${numScans} scans to ${phone}. New total: ${newPaid}`);

            return redirectToFrontend(res, 'payment_success', null, {
                paidScans: newPaid,
                txnid: params.txnid,
            }, params.udf2);
        } catch (err) {
            console.error('[payu-success] Supabase update failed:', err.message);
            // Still redirect as success — payment was real
            return redirectToFrontend(res, 'payment_success', 'db_update_failed', {
                paidScans: newPaid,
                txnid: params.txnid,
            }, params.udf2);
        }
    }

    return redirectToFrontend(res, 'payment_success', null, { paidScans: newPaid, txnid: params.txnid }, params.udf2);
}

function redirectToFrontend(res, status, error, data = {}, returnPath = '/') {
    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    const origin = base.replace(/\/[^?#]*$/, '');
    const safePath = (returnPath || '/').replace(/[^a-zA-Z0-9/_-]/g, '') || '/';
    const queryParams = new URLSearchParams({ payu_status: status, ...data });
    if (error) queryParams.set('error', error);
    res.redirect(302, `${origin}${safePath}?${queryParams.toString()}`);
}
