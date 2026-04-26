import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    const status = {
        timestamp: new Date().toISOString(),
        services: {
            kylas: { status: 'checking', details: '' },
            gemini: { status: 'checking', details: '' },
            gmail: { status: 'checking', details: '' }
        }
    };

    // 1. Check Kylas
    try {
        const kyRes = await fetch('https://api.kylas.io/v1/leads?size=1', {
            headers: { 'api-key': process.env.KYLAS_API_KEY }
        });
        if (kyRes.ok) {
            status.services.kylas = { status: 'ok', details: 'Connected and authenticated' };
        } else {
            status.services.kylas = { status: 'error', details: `Status ${kyRes.status}` };
        }
    } catch (e) {
        status.services.kylas = { status: 'error', details: e.message };
    }

    // 2. Check Gemini
    try {
        if (!process.env.GEMINI_API_KEY) {
            status.services.gemini = { status: 'error', details: 'API Key missing' };
        } else {
            // Light ping to model list
            const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            if (gemRes.ok) {
                status.services.gemini = { status: 'ok', details: 'API Key valid' };
            } else {
                status.services.gemini = { status: 'error', details: `Status ${gemRes.status}` };
            }
        }
    } catch (e) {
        status.services.gemini = { status: 'error', details: e.message };
    }

    // 3. Check Gmail (SMTP)
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
        await transporter.verify();
        status.services.gmail = { status: 'ok', details: 'SMTP connection verified' };
    } catch (e) {
        status.services.gmail = { status: 'error', details: e.message };
    }

    const overallOk = Object.values(status.services).every(s => s.status === 'ok');
    res.status(overallOk ? 200 : 207).json(status);
}
