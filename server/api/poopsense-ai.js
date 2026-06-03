// server/api/poopsense-ai.js
// PoopSense AI scan handler — enforces quota server-side before calling AI.
// Free scan limit and subscription validity are NEVER trusted from the frontend.

import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../utils/supabase.js';
import { normalizePhone } from '../utils/phone.js';

const getApiKey = () =>
  process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CLUADE_API_KEY;

let _anthropic;
const getAnthropic = () => {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: getApiKey() });
  return _anthropic;
};

const MODEL_CLAUDE = 'claude-sonnet-4-5-20250929';
const MODEL_GEMINI = 'gemini-2.5-flash';
const geminiKey = () => process.env.GEMINI_API_KEY;

// ── Quota config — all values driven by env ───────────────────────────
// PS_TRIAL_SCANS   : total free scans during trial           (default 4)
// PS_TRIAL_DAYS    : window in days for the trial            (default 7)
// PS_DAILY_CAP     : max AI scans per day for paid users     (default 4)
// PS_PERIOD_CAP    : max AI scans per subscription period    (default 120)
// PS_SUB_DAYS      : subscription duration in days           (default 30)
// PS_SUB_PRICE     : subscription price in INR               (default 499)
function cfg() {
  return {
    trialScans : parseInt(process.env.PS_TRIAL_SCANS  || '4',   10),
    trialDays  : parseInt(process.env.PS_TRIAL_DAYS   || '7',   10),
    dailyCap   : parseInt(process.env.PS_DAILY_CAP    || '4',   10),
    periodCap  : parseInt(process.env.PS_PERIOD_CAP   || '120', 10),
    subDays    : parseInt(process.env.PS_SUB_DAYS     || '30',  10),
  };
}

// ── Quota check (server-side, tamper-proof) ───────────────────────────

async function checkAndConsumeQuota(phone) {
  const { trialScans, trialDays, dailyCap, periodCap } = cfg();

  // Fetch user
  const { data: user, error } = await supabase
    .from('ps_users')
    .select('id, scan_count, subscribed, sub_date, sub_expires_at, start_date, daily_scan_count, daily_scan_date')
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch user quota: ' + error.message);

  // New user — create and allow first scan
  if (!user) {
    const { data: newUser, error: insertErr } = await supabase
      .from('ps_users')
      .insert({ phone, scan_count: 0 })
      .select('id')
      .single();
    if (insertErr) throw new Error('Failed to create user: ' + insertErr.message);
    await supabase.from('ps_users').update({ scan_count: 1 }).eq('id', newUser.id);
    return { allowed: true, scanCount: 1, trialScans, trialDays, reason: null };
  }

  const now       = new Date();
  const todayDate = now.toISOString().slice(0, 10); // 'YYYY-MM-DD'

  // ── Active subscription ───────────────────────────────────────────
  const isSubscribed = user.subscribed &&
    user.sub_expires_at &&
    new Date(user.sub_expires_at) > now;

  if (isSubscribed) {
    // Enforce per-day cap
    const lastDate  = user.daily_scan_date ? String(user.daily_scan_date).slice(0, 10) : null;
    const dailyUsed = lastDate === todayDate ? (user.daily_scan_count || 0) : 0;

    if (dailyUsed >= dailyCap) {
      return {
        allowed: false,
        scanCount: user.scan_count,
        reason: 'daily_limit_reached',
        message: `You've used all ${dailyCap} scans for today. Come back tomorrow!`,
        dailyUsed,
        dailyCap,
      };
    }

    // Enforce per-period total cap
    // scan_count is reset to 0 when a new subscription starts (see payu-success)
    const periodUsed = user.scan_count || 0;
    if (periodUsed >= periodCap) {
      return {
        allowed: false,
        scanCount: periodUsed,
        reason: 'period_cap_reached',
        message: `You've used all ${periodCap} scans in this subscription period.`,
        dailyUsed,
        dailyCap,
        periodCap,
      };
    }

    const newTotal = periodUsed + 1;
    const newDaily = dailyUsed + 1;
    await supabase.from('ps_users').update({
      scan_count:       newTotal,
      daily_scan_count: newDaily,
      daily_scan_date:  todayDate,
    }).eq('id', user.id);

    return {
      allowed: true,
      scanCount: newTotal,
      dailyUsed: newDaily,
      dailyCap,
      periodCap,
      reason: null,
    };
  }

  // ── Subscription expired — mark unsubscribed ──────────────────────
  if (user.subscribed && user.sub_expires_at && new Date(user.sub_expires_at) <= now) {
    await supabase.from('ps_users').update({ subscribed: false }).eq('id', user.id);
    return {
      allowed: false,
      scanCount: user.scan_count,
      reason: 'subscription_expired',
      message: 'Your subscription has expired. Please renew to continue scanning.',
      trialScans,
    };
  }

  // ── Free / trial tier ────────────────────────────────────────────
  // Trial: up to PS_TRIAL_SCANS scans within PS_TRIAL_DAYS days of first use.
  // If the trial window has elapsed, it's also expired even if scans remain.
  const usedScans = user.scan_count || 0;
  const startDate = user.start_date ? new Date(user.start_date) : null;
  const trialWindowElapsed = startDate
    ? Math.floor((now.getTime() - startDate.getTime()) / 86400000) >= trialDays
    : false;

  if (trialWindowElapsed) {
    return {
      allowed: false,
      scanCount: usedScans,
      reason: 'trial_expired',
      message: `Your ${trialDays}-day free trial has ended. Subscribe to continue.`,
      trialScans,
      trialDays,
    };
  }

  if (usedScans >= trialScans) {
    return {
      allowed: false,
      scanCount: usedScans,
      reason: 'free_limit_reached',
      message: `You've used all ${trialScans} free trial scans. Subscribe for ₹${process.env.PS_SUB_PRICE || '499'}/month to continue.`,
      trialScans,
      trialDays,
    };
  }

  // Allow free scan
  const newCount = usedScans + 1;
  await supabase.from('ps_users').update({ scan_count: newCount }).eq('id', user.id);
  return { allowed: true, scanCount: newCount, trialScans, trialDays, reason: null };
}

// ── AI prompt ─────────────────────────────────────────────────────────

function buildPrompt(dog, symptoms) {
  const dogInfo = dog
    ? `Dog: ${dog.name || 'Unknown'}, ${dog.breed || 'Unknown breed'}, ${dog.age || '?'}yr, ${dog.wt || '?'}kg. Diet: ${dog.diet || 'Unknown'}.`
    : 'Dog profile not provided.';
  const symInfo = symptoms
    ? `Symptoms: diet=${symptoms.diet}, water=${symptoms.water}, pain=${symptoms.pain}, freq=${symptoms.freq}, other=${symptoms.other || 'none'}.`
    : 'No symptoms reported.';

  return `You are PoopSense AI, an expert canine gastrointestinal health AI. Analyse the stool photo.

${dogInfo}
${symInfo}

Analyse for: colour, consistency (Bristol 1-7), shape, contents (mucus/blood/parasites), risk pattern.

Return ONLY valid JSON:
{
  "score": <0-100>,
  "risk": "<g|w|c>",
  "stoolType": "<brief type>",
  "bristolScore": <1-7>,
  "color": "<colour>",
  "consistency": "<description>",
  "sum": "<clinical summary 1-2 sentences>",
  "simpleEn": "<plain English for owner>",
  "simpleHi": "<same in Hindi>",
  "params": { "color":<0-20>, "consistency":<0-25>, "shape":<0-15>, "contents":<0-20>, "riskPattern":<0-20> },
  "possibleConditions": ["..."],
  "recommendations": ["...","...","..."]
}
Score: 75-100=healthy(g), 50-74=monitor(w), 0-49=urgent(c).`;
}

async function callClaude(imageB64, prompt) {
  const clean = imageB64.includes('base64,') ? imageB64.split('base64,')[1] : imageB64;
  const response = await getAnthropic().messages.create({
    model: MODEL_CLAUDE,
    max_tokens: 2048,
    system: 'You are PoopSense AI. Respond ONLY in valid JSON.',
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: clean } },
      { type: 'text', text: prompt }
    ]}]
  });
  const raw = response.content[0].text;
  return JSON.parse(raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
}

async function callGemini(imageB64, prompt) {
  const clean = imageB64.includes('base64,') ? imageB64.split('base64,')[1] : imageB64;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent?key=${geminiKey()}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inlineData: { mimeType: 'image/jpeg', data: clean } },
        { text: prompt }
      ]}],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini: ${res.status} ${err?.error?.message || ''}`);
  }
  const d = await res.json();
  const raw = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
}

// ── Main handler ──────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageB64, dog, symptoms, phone } = req.body || {};

  if (!imageB64) return res.status(400).json({ error: 'imageB64 is required' });
  if (!phone)    return res.status(400).json({ error: 'phone is required' });

  const normPhone = normalizePhone(phone);

  try {
    // ── 1. Server-side quota check ──────────────────────────────────
    const quota = await checkAndConsumeQuota(normPhone);

    if (!quota.allowed) {
      return res.status(402).json({
        error:      quota.message,
        reason:     quota.reason,
        scanCount:  quota.scanCount,
        trialScans: quota.trialScans,
        trialDays:  quota.trialDays,
        dailyUsed:  quota.dailyUsed,
        dailyCap:   quota.dailyCap,
        periodCap:  quota.periodCap,
      });
    }

    // ── 2. Run AI ───────────────────────────────────────────────────
    const prompt = buildPrompt(dog, symptoms);
    const useGemini = !!process.env.GEMINI_API_KEY;
    const result = useGemini
      ? await callGemini(imageB64, prompt)
      : await callClaude(imageB64, prompt);

    return res.status(200).json({
      ...result,
      scanCount:  quota.scanCount,
      dailyUsed:  quota.dailyUsed,
      dailyCap:   quota.dailyCap,
      periodCap:  quota.periodCap,
    });

  } catch (err) {
    console.error('[poopsense-ai]', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}
