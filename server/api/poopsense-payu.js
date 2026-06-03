// server/api/poopsense-payu.js
// PayU payment initiation + success/failure for PoopSense subscriptions.
// On success: sets subscribed=true, sub_expires_at = now + 30 days in ps_users.

import crypto from 'crypto';
import { supabase } from '../utils/supabase.js';
import { normalizePhone } from '../utils/phone.js';

const PAYU_KEY  = () => process.env.PAYU_KEY;
const PAYU_SALT = () => process.env.PAYU_SALT;
const isProd    = () => process.env.PAYU_ENV === 'production';

function generateHash({ key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, salt }) {
  const str = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}||||||||${salt}`;
  return crypto.createHash('sha512').update(str).digest('hex');
}

function verifyReverseHash(params, salt) {
  const { status, udf5='', udf4='', udf3='', udf2='', udf1='',
    email, firstname, productinfo, amount, txnid, key, hash, additional_charges } = params;
  const core = `${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const h1 = crypto.createHash('sha512').update(`${salt}|${core}`).digest('hex');
  if (h1 === hash) return true;
  if (additional_charges) {
    const h2 = crypto.createHash('sha512').update(`${additional_charges}|${salt}|${core}`).digest('hex');
    if (h2 === hash) return true;
  }
  return false;
}

// ── Initiate ──────────────────────────────────────────────────────────

export async function initiateHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, firstname, email } = req.body || {};
  if (!phone || !firstname || !email) {
    return res.status(400).json({ error: 'phone, firstname and email are required' });
  }

  const key  = PAYU_KEY();
  const salt = PAYU_SALT();
  if (!key || !salt) return res.status(500).json({ error: 'PayU not configured' });

  const normPhone = normalizePhone(phone);
  const subPrice    = parseFloat(process.env.PS_SUB_PRICE || '499');
  const amount      = subPrice.toFixed(2);
  const productinfo = process.env.PS_SUB_PRODUCT || 'PoopSense AI - Monthly Subscription';
  const txnid     = `PS${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // udf1 = phone (to identify user on callback)
  // udf2 = return path
  // udf3 = product type marker
  const udf1 = normPhone;
  const udf2 = '/poopsense';
  const udf3 = 'ps_subscription';

  const hash = generateHash({ key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, salt });

  const serverUrl   = process.env.SERVER_URL || 'http://localhost:5000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return res.status(200).json({
    payuUrl: isProd() ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment',
    params: {
      key, txnid, amount, productinfo,
      firstname, email,
      phone: normPhone,
      udf1, udf2, udf3,
      surl: `${serverUrl}/api/poopsense/payu-success`,
      furl: `${serverUrl}/api/poopsense/payu-failure`,
      hash,
    },
  });
}

// ── Success ───────────────────────────────────────────────────────────

export async function successHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const params = req.body || {};
  const salt   = PAYU_SALT();

  // 1. Verify hash
  if (!verifyReverseHash(params, salt)) {
    console.error('[ps-payu-success] Hash mismatch!', params.txnid);
    return redirectFrontend(res, 'payment_failed', 'hash_mismatch');
  }

  // 2. Check status
  if (params.status !== 'success') {
    console.warn('[ps-payu-success] Non-success:', params.status);
    return redirectFrontend(res, 'payment_failed', params.status);
  }

  // 3. Grant subscription — PS_SUB_DAYS from now (default 30)
  const phone = params.udf1;
  if (!phone) return redirectFrontend(res, 'payment_failed', 'no_phone');

  const subDays = parseInt(process.env.PS_SUB_DAYS || '30', 10);
  const subExpiresAt = new Date(Date.now() + subDays * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Find or create user; reset scan_count to 0 for the new subscription period
    const { data: existing } = await supabase
      .from('ps_users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('ps_users')
        .update({
          subscribed:       true,
          sub_date:         new Date().toISOString(),
          sub_expires_at:   subExpiresAt,
          scan_count:       0,    // reset for new period
          daily_scan_count: 0,
          daily_scan_date:  null,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('ps_users')
        .insert({
          phone,
          subscribed:     true,
          sub_date:       new Date().toISOString(),
          sub_expires_at: subExpiresAt,
          scan_count:     0,
        });
    }

    console.log(`[ps-payu-success] Subscription granted to ${phone} until ${subExpiresAt}`);
    return redirectFrontend(res, 'payment_success', null, { sub_expires_at: subExpiresAt });

  } catch (err) {
    console.error('[ps-payu-success] DB error:', err.message);
    // Payment was real — still redirect as success, user can contact support
    return redirectFrontend(res, 'payment_success', 'db_error', { sub_expires_at: subExpiresAt });
  }
}

// ── Failure ───────────────────────────────────────────────────────────

export async function failureHandler(req, res) {
  const params = req.body || {};
  console.warn('[ps-payu-failure] Payment failed:', params.txnid, params.status);
  return redirectFrontend(res, 'payment_failed', params.status || 'cancelled');
}

// ── Helper ────────────────────────────────────────────────────────────

function redirectFrontend(res, status, error, data = {}) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173/vetrxscan';
  const { origin } = new URL(frontendUrl); // strips path, keeps protocol+host+port
  const qp = new URLSearchParams({ payu_status: status, ...data });
  if (error) qp.set('error', error);
  res.redirect(302, `${origin}/poopsense?${qp.toString()}`);
}
