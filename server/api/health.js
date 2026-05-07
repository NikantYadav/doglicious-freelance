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

    // ── 1. Wylto CRM / WhatsApp ───────────────────────────────────────
    try {
        if (!process.env.WYLTO_API_KEY) {
            status.services.wylto = { status: 'error', details: 'WYLTO_API_KEY not set' };
        } else {
            const wyltoRes = await fetch('https://server.wylto.com/api/v1/wa/phone-number', {
                headers: { 'Authorization': `Bearer ${process.env.WYLTO_API_KEY}` }
            });
            status.services.wylto = wyltoRes.ok
                ? { status: 'ok', details: 'Connected and authenticated' }
                : { status: 'error', details: `HTTP ${wyltoRes.status}` };
        }
    } catch (e) {
        status.services.wylto = { status: 'error', details: e.message };
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
                await client.models.list();
                status.services.ai = { status: 'ok', provider: 'claude', details: 'API key valid' };
            } catch (e) {
                status.services.ai = { status: 'error', provider: 'claude', details: e.message };
            }
        }
    }

    // ── 3. PayU ───────────────────────────────────────────────────────
    status.services.payu = (process.env.PAYU_KEY && process.env.PAYU_SALT)
        ? { status: 'ok', env: process.env.PAYU_ENV || 'test', details: 'Credentials present' }
        : { status: 'error', details: 'PAYU_KEY or PAYU_SALT not set' };

    // ── 4. OTP Secret ─────────────────────────────────────────────────
    const hasCustomSecret = process.env.OTP_SECRET && process.env.OTP_SECRET !== 'vetrx-otp-secret-change-in-prod';
    status.services.otp = hasCustomSecret
        ? { status: 'ok', details: 'Custom OTP_SECRET set' }
        : { status: 'warn', details: 'Using default OTP_SECRET — change this in production' };

    // ── 5. WhatsApp OTP Template ──────────────────────────────────────
    status.services.otpTemplate = process.env.WYLTO_OTP_TEMPLATE
        ? { status: 'ok', details: `Template: ${process.env.WYLTO_OTP_TEMPLATE}` }
        : { status: 'warn', details: 'WYLTO_OTP_TEMPLATE not set — will use default "vetrx"' };

    // ── Overall status ────────────────────────────────────────────────
    const statuses = Object.values(status.services).map(s => s.status);
    const hasError = statuses.includes('error');
    const hasWarn = statuses.includes('warn');

    status.overall = hasError ? 'degraded' : hasWarn ? 'warn' : 'ok';

    return res.status(hasError ? 207 : 200).json(status);
}
