import nodemailer from 'nodemailer';
import { createHmac } from 'crypto';

const SECRET = process.env.OTP_SECRET || 'vetrx-otp-secret-change-in-prod';

// ── Token helpers ────────────────────────────────────────────────────

export function signOtpToken(email, otp) {
    const payload = Buffer.from(JSON.stringify({
        email,
        otp,
        exp: Date.now() + 10 * 60 * 1000,   // 10 min
    })).toString('base64url');

    const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
}

// ── Email ────────────────────────────────────────────────────────────

async function sendOtpEmail(to, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Doglicious VetRx" <${process.env.GMAIL_USER}>`,
        to,
        subject: `Your VetRx Scan login code: ${otp}`,
        html: `
      <div style="font-family:Georgia,serif;max-width:480px;margin:auto;background:#FBF6EC;padding:32px 24px;border-radius:20px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#3D2B00;font-size:24px;margin:0;">🐾 VetRx Scan</h1>
          <p style="color:#9B7E4A;font-size:13px;margin:4px 0 0;">AI Dog Health Diagnosis</p>
        </div>
        <p style="color:#3D2B00;font-size:15px;margin-bottom:16px;">Your one-time login code is:</p>
        <div style="background:#3D2B00;border-radius:16px;padding:20px;text-align:center;margin-bottom:20px;">
          <span style="color:#FBF6EC;font-size:40px;font-weight:900;letter-spacing:12px;">${otp}</span>
        </div>
        <p style="color:#9B7E4A;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #E0D5C0;margin:20px 0;"/>
        <p style="color:#C4AA7A;font-size:11px;text-align:center;">Doglicious · AI-powered dog nutrition &amp; health</p>
      </div>
    `,
    });
}

// ── Handler ──────────────────────────────────────────────────────────

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    try {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const token = signOtpToken(email, otp);

        await sendOtpEmail(email, otp);

        // Return signed token to client — no HubSpot write needed here
        return res.status(200).json({ ok: true, token });
    } catch (err) {
        console.error('[send-otp]', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
