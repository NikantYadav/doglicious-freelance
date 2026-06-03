// server/api/poopsense-sync.js
// Syncs PoopSense state (dogs, scan entries, subscription) to/from Supabase.
// Single endpoint handles: load, save-scan, save-dogs, save-sub

import { supabase } from '../utils/supabase.js';
import { normalizePhone } from '../utils/phone.js';

// ── Helpers ───────────────────────────────────────────────────────────

function trunc(str, len = 500) {
  return str ? String(str).substring(0, len) : null;
}

// Upsert user row, return user id + subscription info
async function upsertUser(phone) {
  // Try to find existing user first
  const { data: existing } = await supabase
    .from('ps_users')
    .select('id, phone, subscribed, sub_date, sub_expires_at, start_date, scan_count, daily_scan_count, daily_scan_date, vet_name, vet_num, pdf_lang')
    .eq('phone', phone)
    .maybeSingle();

  if (existing) return existing;

  // Insert new user
  const { data, error } = await supabase
    .from('ps_users')
    .insert({ phone })
    .select('id, phone, subscribed, sub_date, sub_expires_at, start_date, scan_count, daily_scan_count, daily_scan_date, vet_name, vet_num, pdf_lang')
    .single();

  if (error) throw error;
  return data;
}

// ── Action: load — fetch all user data ───────────────────────────────

async function handleLoad(phone) {
  const user = await upsertUser(phone);

  // Load dogs
  const { data: dogs } = await supabase
    .from('ps_dogs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // Load scan history (last 200 entries across all dogs)
  const { data: scans } = await supabase
    .from('ps_scans')
    .select('*')
    .eq('user_id', user.id)
    .order('ts', { ascending: false })
    .limit(200);

  // Build hist map: { dogId: [entries] }
  const hist = {};
  for (const scan of scans || []) {
    const dogId = scan.dog_id;
    if (!hist[dogId]) hist[dogId] = [];
    hist[dogId].push(dbScanToEntry(scan));
  }

  return {
    user,
    dogs: (dogs || []).map(dbDogToDog),
    hist,
  };
}

// ── Action: save-scan ─────────────────────────────────────────────────

async function handleSaveScan(phone, entry, dogId) {
  const user = await upsertUser(phone);

  const payload = {
    user_id: user.id,
    dog_id: dogId,
    entry_id: entry.id,
    date: entry.date,
    time: entry.time,
    ts: entry.ts,
    score: entry.score,
    risk: entry.risk,
    stool_type: trunc(entry.stoolType, 100),
    bristol_score: entry.bristolScore,
    color: trunc(entry.color, 100),
    consistency: trunc(entry.consistency, 100),
    sum: trunc(entry.sum),
    simple_en: trunc(entry.simpleEn),
    simple_hi: trunc(entry.simpleHi),
    params: entry.params || null,
    possible_conditions: entry.possibleConditions || [],
    recommendations: entry.recommendations || [],
    symptoms: entry.symptoms || null,
    img_b64: entry.imgB64 ? entry.imgB64.substring(0, 50000) : null,
  };

  const { data: existing } = await supabase
    .from('ps_scans')
    .select('id')
    .eq('entry_id', entry.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('ps_scans').update(payload).eq('entry_id', entry.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('ps_scans').insert(payload);
    if (error) throw error;
  }

  return { ok: true };
}

// ── Action: save-dogs ─────────────────────────────────────────────────

async function handleSaveDogs(phone, dogs) {
  const user = await upsertUser(phone);

  for (const dog of dogs) {
    const payload = {
      user_id: user.id,
      dog_id: dog.id,
      av: dog.av,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      dob: dog.dob || null,
      wt: dog.wt,
      diet: dog.diet || null,
      grams: dog.grams || null,
      freq: dog.freq || null,
      act: dog.act || null,
      parent_name: dog.parentName || null,
      parent_mobile: dog.parentMobile || null,
    };

    // Check if dog already exists
    const { data: existing } = await supabase
      .from('ps_dogs')
      .select('id')
      .eq('dog_id', dog.id)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('ps_dogs')
        .update(payload)
        .eq('dog_id', dog.id);
      if (error) console.error('[poopsense-sync] dog update error:', error.message, error.details);
    } else {
      // Insert
      const { error } = await supabase
        .from('ps_dogs')
        .insert(payload);
      if (error) console.error('[poopsense-sync] dog insert error:', error.message, error.details);
    }
  }

  // Delete dogs removed from the list
  const dogIds = dogs.map(d => d.id);
  if (dogIds.length > 0) {
    const { error } = await supabase
      .from('ps_dogs')
      .delete()
      .eq('user_id', user.id)
      .not('dog_id', 'in', `(${dogIds.join(',')})`);
    if (error) console.error('[poopsense-sync] dog delete error:', error.message);
  } else {
    await supabase.from('ps_dogs').delete().eq('user_id', user.id);
  }

  return { ok: true };
}

// ── Action: save-settings ─────────────────────────────────────────────

async function handleSaveSettings(phone, settings) {
  const { error } = await supabase
    .from('ps_users')
    .update({
      vet_name: settings.vetName || null,
      vet_num: settings.vetNum || null,
      pdf_lang: settings.pdfLang || 'en',
      subscribed: settings.subscribed || false,
      sub_date: settings.subDate || null,
      start_date: settings.startDate || null,
    })
    .eq('phone', phone);
  if (error) throw error;
  return { ok: true };
}

// ── DB → App type converters ──────────────────────────────────────────

function dbDogToDog(row) {
  return {
    id: row.dog_id,
    av: row.av || '🐶',
    name: row.name,
    breed: row.breed,
    age: row.age,
    dob: row.dob,
    wt: row.wt,
    diet: row.diet,
    grams: row.grams,
    freq: row.freq,
    act: row.act,
    parentName: row.parent_name || '',
    parentMobile: row.parent_mobile || '',
  };
}

function dbScanToEntry(row) {
  return {
    id: row.entry_id,
    date: row.date,
    time: row.time,
    ts: row.ts,
    score: row.score,
    risk: row.risk,
    stoolType: row.stool_type,
    bristolScore: row.bristol_score,
    color: row.color,
    consistency: row.consistency,
    sum: row.sum,
    simpleEn: row.simple_en,
    simpleHi: row.simple_hi,
    params: row.params,
    possibleConditions: row.possible_conditions || [],
    recommendations: row.recommendations || [],
    symptoms: row.symptoms,
    imgB64: row.img_b64,
    dogId: row.dog_id,
  };
}

// ── Main handler ──────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, phone, ...payload } = req.body || {};

  if (!phone) return res.status(400).json({ error: 'phone required' });
  if (!action) return res.status(400).json({ error: 'action required' });

  const normPhone = normalizePhone(phone);

  try {
    switch (action) {
      case 'load':
        return res.status(200).json(await handleLoad(normPhone));

      case 'save-scan':
        return res.status(200).json(await handleSaveScan(normPhone, payload.entry, payload.dogId));

      case 'save-dogs':
        return res.status(200).json(await handleSaveDogs(normPhone, payload.dogs));

      case 'save-settings':
        return res.status(200).json(await handleSaveSettings(normPhone, payload.settings));

      case 'get-quota': {
        const user = await upsertUser(normPhone);
        // All quota config from env — same defaults as poopsense-ai.js
        const trialScans = parseInt(process.env.PS_TRIAL_SCANS || '4',   10);
        const trialDays  = parseInt(process.env.PS_TRIAL_DAYS  || '7',   10);
        const dailyCap   = parseInt(process.env.PS_DAILY_CAP   || '4',   10);
        const periodCap  = parseInt(process.env.PS_PERIOD_CAP  || '120', 10);
        const subDays    = parseInt(process.env.PS_SUB_DAYS    || '30',  10);
        const subPrice   = parseFloat(process.env.PS_SUB_PRICE || '499');

        const now = new Date();
        const todayDate = now.toISOString().slice(0, 10);

        const isSubscribed = user.subscribed &&
          user.sub_expires_at &&
          new Date(user.sub_expires_at) > now;

        const subExpired = user.subscribed &&
          user.sub_expires_at &&
          new Date(user.sub_expires_at) <= now;

        // Daily scans count (reset if it's a different day)
        const lastDate   = user.daily_scan_date ? String(user.daily_scan_date).slice(0, 10) : null;
        const dailyUsed  = lastDate === todayDate ? (user.daily_scan_count || 0) : 0;

        // Trial window check
        const startDate = user.start_date ? new Date(user.start_date) : null;
        const trialDaysUsed = startDate
          ? Math.floor((now.getTime() - startDate.getTime()) / 86400000)
          : 0;
        const trialWindowElapsed = startDate ? trialDaysUsed >= trialDays : false;
        const trialScansUsed = user.scan_count || 0;
        const trialScansLeft = Math.max(0, trialScans - trialScansUsed);

        let canScan = false;
        if (isSubscribed) {
          canScan = dailyUsed < dailyCap && (user.scan_count || 0) < periodCap;
        } else if (!trialWindowElapsed) {
          canScan = trialScansUsed < trialScans;
        }

        return res.status(200).json({
          // Subscription
          subscribed:          isSubscribed,
          subExpired:          !!subExpired,
          subExpiresAt:        user.sub_expires_at || null,
          subDays,
          subPrice,
          // Scans
          scanCount:           user.scan_count || 0,
          dailyUsed,
          dailyCap,
          periodCap,
          // Trial
          trialScans,
          trialDays,
          trialScansLeft,
          trialDaysUsed,
          trialWindowElapsed,
          // Gate
          canScan,
        });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('[poopsense-sync]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
