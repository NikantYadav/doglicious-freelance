
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

import { normalizePhone } from '../utils/phone.js';
import { supabase } from '../utils/supabase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, firstname, phone, contactId, price, paidScans, dogName, recipe, grams, address, city, pincode } = req.body || {};
    if (!email || !firstname) return res.status(400).json({ error: 'email and firstname required' });

    const key = PAYU_KEY();
    const salt = PAYU_SALT();
    if (!key || !salt) return res.status(500).json({ error: 'PayU credentials not configured' });

    // Use price from request if provided and valid, otherwise fall back to env default.
    // Parse and reformat to always have exactly 2 decimal places (PayU requirement).
    const parsedPrice = parseFloat(price);
    const amount = (!isNaN(parsedPrice) && parsedPrice > 0)
        ? parsedPrice.toFixed(2)
        : (process.env.PAYU_AMOUNT || '99.00');
    const productinfo = process.env.PAYU_PRODUCT || 'VetRx Scan - Additional Scans Pack';
    const txnid = `VRX${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const udf1 = req.body.udf1 || contactId || '';
    const udf2 = (req.body.udf2 || req.body.returnPath || '').replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 200) || '/';
    const udf3 = String(parseInt(req.body.udf3 || paidScans || '0', 10));
    const udf4 = (req.body.udf4 || '').slice(0, 250); // recipe|grams|dogName
    const udf5 = (req.body.udf5 || '').slice(0, 250); // address|city|pincode

    const hash = generateHash({ key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, salt });

    const baseUrl = req.headers.origin || (isProd() ? process.env.PROD_URL : process.env.DEV_URL) || 'http://localhost:5173';
    const surl = `${process.env.SERVER_URL || baseUrl.replace(':5173', ':5000')}/api/payu-success`;
    const furl = `${process.env.SERVER_URL || baseUrl.replace(':5173', ':5000')}/api/payu-failure`;

    const normPhone = normalizePhone(phone);

    if (recipe || grams || req.body.udf4) {
        const { error: insertErr } = await supabase.from('sample_bookings').upsert({
            phone: normPhone,
            dog_name: dogName || null,
            address: address || null,
            city: city || null,
            pincode: pincode || null,
            recipe: recipe || null,
            grams: grams || null,
            price: price || null,
            status: 'PENDING',
            txnid: txnid
        }, { onConflict: 'txnid' });

        if (insertErr) {
            console.error('[payu-initiate] Could not save pending booking:', insertErr);
            return res.status(500).json({ error: 'Failed to initialize booking in database. Please run SQL migration if txnid column is missing.' });
        }
    }

    return res.status(200).json({
        payuUrl: isProd() ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment',
        params: {
            key, txnid, amount, productinfo,
            firstname, email,
            phone: normPhone,
            udf1, udf2, udf3, udf4, udf5,
            surl, furl,
            hash,
        },
    });
}
