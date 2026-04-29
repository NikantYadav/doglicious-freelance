// api/payu-success.js
// PayU POSTs to this URL on successful payment.
// We verify the reverse hash, then grant the user NUM_SCAN extra scans.

import crypto from 'crypto';

const PAYU_SALT = () => process.env.PAYU_SALT;
const KYLAS_BASE = 'https://api.kylas.io';
const kylasKey = () => process.env.KYLAS_API_KEY;

// Reverse hash: SHA512( salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key )
// Also handles: SHA512( additional_charges|salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key )
function verifyReverseHash(params, salt) {
    const { status, udf5 = '', udf4 = '', udf3 = '', udf2 = '', udf1 = '',
        email, firstname, productinfo, amount, txnid, key, hash,
        additional_charges } = params;

    const core = `${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    // Try both formulas — with and without additional_charges
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

async function kylasGet(path) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'GET',
        headers: { 'api-key': kylasKey(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas GET error: ${res.status} ${err}`);
    }
    return res.json();
}

async function kylasPut(path, body) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'PUT',
        headers: { 'api-key': kylasKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas PUT error: ${res.status} ${err}`);
    }
    return res.json();
}

export default async function handler(req, res) {
    // PayU sends a POST (form data) to surl
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const params = req.body || {};
    const salt = PAYU_SALT();
    const numScans = parseInt(process.env.NUM_SCAN || '5', 10);

    // ----- 1. Validate reverse hash -----
    if (!verifyReverseHash(params, salt)) {
        console.error('[payu-success] Hash mismatch! Possible tampering.', {
            txnid: params.txnid,
            status: params.status,
            email: params.email,
            key: params.key,
        });
        return redirectToFrontend(res, 'payment_failed', 'Hash mismatch', {}, params.udf2);
    }

    // ----- 2. Check payment status -----
    if (params.status !== 'success') {
        console.warn('[payu-success] Non-success status:', params.status);
        return redirectToFrontend(res, 'payment_failed', params.status, {}, params.udf2);
    }

    // ----- 3. Update Kylas lead -----
    const contactId = params.udf1; // We stored it in udf1 during initiation
    if (contactId) {
        try {
            const lead = await kylasGet(`/v1/leads/${contactId}`);
            const cf = lead.customFieldValues || {};

            const prevPaid = parseInt(cf.cfPaidScans || cf.paid_scans || '0', 10);
            const newPaid = prevPaid + numScans;

            if (!lead.customFieldValues) lead.customFieldValues = {};

            Object.assign(lead.customFieldValues, {
                cfPaidScans: newPaid,
                cfPayuTxnid: params.txnid,
                cfPayuStatus: 'success',
            });

            delete lead.createdAt;
            delete lead.updatedAt;
            delete lead.createdBy;
            delete lead.updatedBy;
            delete lead.recordActions;
            delete lead.metaData;
            delete lead.latestActivityCreatedAt;
            delete lead.createdViaId;
            delete lead.createdViaName;
            delete lead.createdViaType;
            delete lead.updatedViaId;
            delete lead.updatedViaName;
            delete lead.updatedViaType;

            await kylasPut(`/v1/leads/${contactId}`, lead);
            console.log(`[payu-success] Granted ${numScans} scans to lead ${contactId}. Total paid: ${newPaid}`);

            return redirectToFrontend(res, 'payment_success', null, {
                paidScans: newPaid,
                txnid: params.txnid,
                contactId,
            }, params.udf2);
        } catch (err) {
            console.error('[payu-success] Kylas update failed:', err);
            // Still redirect as success — payment was real, just CRM update failed
            return redirectToFrontend(res, 'payment_success', 'crm_update_failed', { txnid: params.txnid }, params.udf2);
        }
    }

    return redirectToFrontend(res, 'payment_success', null, { txnid: params.txnid }, params.udf2);
}

function redirectToFrontend(res, status, error, data = {}, returnPath = '/') {
    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Strip any existing path from FRONTEND_URL (it may be set to a specific page),
    // then append the returnPath that was stored in udf2 at payment initiation.
    const origin = base.replace(/\/[^?#]*$/, ''); // keep only origin
    const safePath = (returnPath || '/').replace(/[^a-zA-Z0-9/_-]/g, '') || '/';
    const params = new URLSearchParams({ payu_status: status, ...data });
    if (error) params.set('error', error);
    res.redirect(302, `${origin}${safePath}?${params.toString()}`);
}
