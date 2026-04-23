
// api/payu-success.js
// PayU POSTs to this URL on successful payment.
// We verify the reverse hash, then grant the user NUM_SCAN extra scans.

import crypto from 'crypto';

const PAYU_SALT = () => process.env.PAYU_SALT;
const HS_BASE = 'https://api.hubapi.com';
const hsKey = () => process.env.HUBSPOT_API_KEY;

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

async function hsPatch(path, body) {
    const res = await fetch(`${HS_BASE}${path}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${hsKey()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}

async function hsGet(path) {
    const res = await fetch(`${HS_BASE}${path}`, {
        headers: { Authorization: `Bearer ${hsKey()}`, 'Content-Type': 'application/json' },
    });
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
        return redirectToFrontend(res, 'payment_failed', 'Hash mismatch');
    }

    // ----- 2. Check payment status -----
    if (params.status !== 'success') {
        console.warn('[payu-success] Non-success status:', params.status);
        return redirectToFrontend(res, 'payment_failed', params.status);
    }

    // ----- 3. Update HubSpot contact -----
    const contactId = params.udf1; // We stored it in udf1 during initiation
    if (contactId) {
        try {
            // Get current paid_scans value
            const current = await hsGet(`/crm/v3/objects/contacts/${contactId}?properties=paid_scans,scan_count`);
            const prevPaid = parseInt(current.properties?.paid_scans || '0', 10);
            const newPaid = prevPaid + numScans;

            await hsPatch(`/crm/v3/objects/contacts/${contactId}`, {
                properties: {
                    paid_scans: String(newPaid),
                    payu_txnid: params.txnid,
                    payu_status: 'success',
                },
            });
            console.log(`[payu-success] Granted ${numScans} scans to contact ${contactId}. Total paid: ${newPaid}`);

            return redirectToFrontend(res, 'payment_success', null, {
                paidScans: newPaid,
                txnid: params.txnid,
                contactId,
            });
        } catch (err) {
            console.error('[payu-success] HubSpot update failed:', err);
            // Still redirect as success — payment was real, just CRM update failed
            return redirectToFrontend(res, 'payment_success', 'crm_update_failed', { txnid: params.txnid });
        }
    }

    return redirectToFrontend(res, 'payment_success', null, { txnid: params.txnid });
}

function redirectToFrontend(res, status, error, data = {}) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const params = new URLSearchParams({ payu_status: status, ...data });
    if (error) params.set('error', error);
    res.redirect(302, `${frontendUrl}?${params.toString()}`);
}
