
// api/payu-initiate.js
// Generates the PayU hosted-checkout hash on the server and returns params.
// The frontend uses these to build and auto-submit a form to PayU.
// NEVER expose PAYU_SALT to the frontend.

import crypto from 'crypto';

const PAYU_KEY = () => process.env.PAYU_KEY;
const PAYU_SALT = () => process.env.PAYU_SALT;
const isProd = () => process.env.PAYU_ENV === 'production';

// Hash formula: SHA512( key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt )
function generateHash({ key, txnid, amount, productinfo, firstname, email, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '', salt }) {
    const str = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    return crypto.createHash('sha512').update(str).digest('hex');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, firstname, phone, contactId } = req.body || {};
    if (!email || !firstname) return res.status(400).json({ error: 'email and firstname required' });

    const key = PAYU_KEY();
    const salt = PAYU_SALT();
    if (!key || !salt) return res.status(500).json({ error: 'PayU credentials not configured' });

    const amount = process.env.PAYU_AMOUNT || '99.00';
    const productinfo = process.env.PAYU_PRODUCT || 'VetRx Scan - Additional Scans Pack';
    const txnid = `VRX${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // udf1 stores the Kylas contactId so we can look it up on success callback
    const udf1 = contactId || '';

    const hash = generateHash({ key, txnid, amount, productinfo, firstname, email, udf1, salt });

    const baseUrl = req.headers.origin || (isProd() ? process.env.PROD_URL : process.env.DEV_URL) || 'http://localhost:5173';
    const surl = `${process.env.SERVER_URL || baseUrl.replace(':5173', ':5000')}/api/payu-success`;
    const furl = `${process.env.SERVER_URL || baseUrl.replace(':5173', ':5000')}/api/payu-failure`;

    return res.status(200).json({
        payuUrl: isProd() ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment',
        params: {
            key, txnid, amount, productinfo,
            firstname, email,
            phone: phone || '',
            udf1,
            surl, furl,
            hash,
        },
    });
}
