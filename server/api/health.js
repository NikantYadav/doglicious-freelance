import nodemailer from 'nodemailer';
import Anthropic from '@anthropic-ai/sdk';

const getClaudeKey = () =>
    process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CLUADE_API_KEY;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const status = {
        timestamp: new Date().toISOString(),
        services: {}
    };

    // ── 1. Kylas CRM ──────────────────────────────────────────────────
    try {
        if (!process.env.KYLAS_API_KEY) {
            status.services.kylas = { status: 'error', details: 'KYLAS_API_KEY not set' };
        } else {
            const kyRes = await fetch('https://api.kylas.io/v1/leads?size=1', {
                headers: { 'api-key': process.env.KYLAS_API_KEY }
            });
            status.services.kylas = kyRes.ok
                ? { status: 'ok', details: 'Connected and authenticated' }
                : { status: 'error', details: `HTTP ${kyRes.status}` };
        }
    } catch (e) {
        status.services.kylas = { status: 'error', details: e.message };
    }

    // ── 2. AI Provider ────────────────────────────────────────────────
    const useGemini = !!process.env.GEMINI_API_KEY;

    if (useGemini) {
        try {
            const gemRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
            );
            status.services.ai = gemRes.ok
                ? { status: 'ok', provider: 'gemini', details: 'API key valid' }
                : { status: 'error', provider: 'gemini', details: `HTTP ${gemRes.status}` };
        } catch (e) {
            status.services.ai = { status: 'error', provider: 'gemini', details: e.message };
        }
    } else {
        const claudeKey = getClaudeKey();
        if (!claudeKey) {
            status.services.ai = { status: 'error', provider: 'claude', details: 'No API key set (ANTHROPIC_API_KEY / CLAUDE_API_KEY / CLUADE_API_KEY)' };
        } else {
            try {
                const client = new Anthropic({ apiKey: claudeKey });
                // Lightweight call — list models instead of generating tokens
                await client.models.list();
                status.services.ai = { status: 'ok', provider: 'claude', details: 'API key valid' };
            } catch (e) {
                status.services.ai = { status: 'error', provider: 'claude', details: e.message };
            }
        }
    }

    // ── 3. Gmail SMTP ─────────────────────────────────────────────────
    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            status.services.gmail = { status: 'error', details: 'GMAIL_USER or GMAIL_APP_PASSWORD not set' };
        } else {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD
                }
            });
            await transporter.verify();
            status.services.gmail = { status: 'ok', details: `SMTP verified (${process.env.GMAIL_USER})` };
        }
    } catch (e) {
        status.services.gmail = { status: 'error', details: e.message };
    }

    // ── 4. PayU ───────────────────────────────────────────────────────
    status.services.payu = (process.env.PAYU_KEY && process.env.PAYU_SALT)
        ? { status: 'ok', env: process.env.PAYU_ENV || 'test', details: 'Credentials present' }
        : { status: 'error', details: 'PAYU_KEY or PAYU_SALT not set' };

    // ── 5. OTP Secret ─────────────────────────────────────────────────
    const hasCustomSecret = process.env.OTP_SECRET && process.env.OTP_SECRET !== 'vetrx-otp-secret-change-in-prod';
    status.services.otp = hasCustomSecret
        ? { status: 'ok', details: 'Custom OTP_SECRET set' }
        : { status: 'warn', details: 'Using default OTP_SECRET — change this in production' };

    // ── Overall status ────────────────────────────────────────────────
    const statuses = Object.values(status.services).map(s => s.status);
    const hasError = statuses.includes('error');
    const hasWarn  = statuses.includes('warn');

    status.overall = hasError ? 'degraded' : hasWarn ? 'warn' : 'ok';

    return res.status(hasError ? 207 : 200).json(status);
}
