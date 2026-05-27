/**
 * CMS Authentication API
 * POST /api/cms/register  — create account (starts as 'pending')
 * POST /api/cms/login     — login, returns session token
 * POST /api/cms/logout    — invalidate session
 * GET  /api/cms/me        — verify token, return user info
 */

import { createHash, randomBytes } from 'crypto';
import { supabase } from '../utils/supabase.js';

// ── Helpers ───────────────────────────────────────────────────────────

function hashPassword(password) {
    // SHA-256 with a fixed app salt — good enough for an internal CMS
    const salt = process.env.CMS_PASSWORD_SALT || 'doglicious-cms-salt-2025';
    return createHash('sha256').update(salt + password).digest('hex');
}

function generateToken() {
    return randomBytes(48).toString('hex');
}

const SESSION_TTL_HOURS = 72; // 3 days

// ── Register ──────────────────────────────────────────────────────────

async function register(req, res) {
    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'email, password and name are required' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const emailLower = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
        .from('cms_users')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();

    if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const { data: user, error } = await supabase
        .from('cms_users')
        .insert({
            email: emailLower,
            password_hash: hashPassword(password),
            name: name.trim(),
            approval: 'pending',
        })
        .select('id, email, name, role, approval, created_at')
        .single();

    if (error) {
        console.error('[cms-auth] register error:', error);
        return res.status(500).json({ error: 'Failed to create account' });
    }

    return res.status(201).json({
        ok: true,
        message: 'Account created. Please wait for admin approval before logging in.',
        user: { id: user.id, email: user.email, name: user.name, approval: user.approval },
    });
}

// ── Login ─────────────────────────────────────────────────────────────

async function login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    const emailLower = email.trim().toLowerCase();

    const { data: user, error } = await supabase
        .from('cms_users')
        .select('id, email, name, role, approval, password_hash')
        .eq('email', emailLower)
        .maybeSingle();

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.approval === 'pending') {
        return res.status(403).json({
            error: 'Your account is pending approval. Please wait for an admin to approve your account.',
            approval: 'pending',
        });
    }

    if (user.approval === 'rejected') {
        return res.status(403).json({
            error: 'Your account has been rejected. Please contact the administrator.',
            approval: 'rejected',
        });
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabase
        .from('cms_sessions')
        .insert({ user_id: user.id, token, expires_at: expiresAt });

    if (sessionError) {
        console.error('[cms-auth] session create error:', sessionError);
        return res.status(500).json({ error: 'Failed to create session' });
    }

    // Update last_login
    await supabase.from('cms_users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    return res.status(200).json({
        ok: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, approval: user.approval },
    });
}

// ── Logout ────────────────────────────────────────────────────────────

async function logout(req, res) {
    const token = extractToken(req);
    if (token) {
        await supabase.from('cms_sessions').delete().eq('token', token);
    }
    return res.status(200).json({ ok: true });
}

// ── Me (verify session) ───────────────────────────────────────────────

async function me(req, res) {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const user = await getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });

    return res.status(200).json({ ok: true, user });
}

// ── Shared helpers ────────────────────────────────────────────────────

export function extractToken(req) {
    const auth = req.headers['authorization'] || '';
    if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
    return null;
}

export async function getUserFromToken(token) {
    if (!token) return null;

    const { data: session } = await supabase
        .from('cms_sessions')
        .select('user_id, expires_at')
        .eq('token', token)
        .maybeSingle();

    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) {
        // Clean up expired session
        await supabase.from('cms_sessions').delete().eq('token', token);
        return null;
    }

    const { data: user } = await supabase
        .from('cms_users')
        .select('id, email, name, role, approval')
        .eq('id', session.user_id)
        .maybeSingle();

    if (!user || user.approval !== 'approved') return null;
    return user;
}

// ── requireAuth middleware ────────────────────────────────────────────

export async function requireAuth(req, res, next) {
    const token = extractToken(req);
    const user = await getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    req.cmsUser = user;
    next();
}

// ── Route dispatcher ──────────────────────────────────────────────────

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.params?.action || req.path.split('/').pop();

    if (action === 'register' && req.method === 'POST') return register(req, res);
    if (action === 'login'    && req.method === 'POST') return login(req, res);
    if (action === 'logout'   && req.method === 'POST') return logout(req, res);
    if (action === 'me'       && req.method === 'GET')  return me(req, res);

    return res.status(404).json({ error: 'Not found' });
}
