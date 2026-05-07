// api/payu-success.js
// PayU POSTs to this URL on successful payment.
// We verify the reverse hash, then grant the user NUM_SCAN extra scans via Wylto.

import crypto from 'crypto';

const PAYU_SALT = () => process.env.PAYU_SALT;
const WYLTO_BASE = 'https://server.wylto.com';
const wyltoKey = () => process.env.WYLTO_API_KEY;

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

async function wyltoGet(path) {
    const res = await fetch(`${WYLTO_BASE}${path}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${wyltoKey()}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Wylto GET error: ${res.status} ${err}`);
    }
    return res.json();
}

async function wyltoPut(path, body) {
    const res = await fetch(`${WYLTO_BASE}${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${wyltoKey()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Wylto PUT error: ${res.status} ${err}`);
    }
    return res.json();
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

    // ----- 3. Update Wylto contact -----
    // udf1 = Wylto contactId, udf3 = current paidScans count (stored at payment initiation)
    const contactId = params.udf1;
    const prevPaid = parseInt(params.udf3 || '0', 10);
    const newPaid = prevPaid + numScans;

    if (contactId) {
        try {
            // Touch the contact to confirm it still exists
            const contactInfo = await wyltoGet(`/api/v1/contact/${contactId}`);

            const existingCf = contactInfo.message || {};
            await wyltoPut(`/api/v1/contact/${contactId}`, {
                name: contactInfo.name,
                phoneNumber: contactInfo.phoneNumber,
                message: {
                    ...existingCf,
                    cfPaidScans: newPaid
                }
            });

            console.log(`[payu-success] Payment granted ${numScans} scans to contact ${contactId}. New total: ${newPaid}`);

            return redirectToFrontend(res, 'payment_success', null, {
                paidScans: newPaid,
                txnid: params.txnid,
                contactId,
            }, params.udf2);
        } catch (err) {
            console.error('[payu-success] Wylto contact fetch failed:', err);
            // Still redirect as success — payment was real
            return redirectToFrontend(res, 'payment_success', 'crm_update_failed', {
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
    const params = new URLSearchParams({ payu_status: status, ...data });
    if (error) params.set('error', error);
    res.redirect(302, `${origin}${safePath}?${params.toString()}`);
}
