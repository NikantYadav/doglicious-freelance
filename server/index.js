import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.backend') });

import express from 'express';
import cors from 'cors';

// Import our API handler files
import sendOtp from './api/send-otp.js';
import verifyOtp from './api/verify-otp.js';
import wyltoContact from './api/wylto-contact.js';
import wyltoLead from './api/wylto-lead.js';
import wyltoReport from './api/wylto-report.js';
import wyltoSample from './api/wylto-sample.js';
import aiHandler from './api/ai.js';
import aiTipHandler from './api/ai-tip.js';
import healthHandler from './api/health.js';
import payuInitiate from './api/payu-initiate.js';
import payuSuccess from './api/payu-success.js';
import payuFailure from './api/payu-failure.js';
import configHandler from './api/config.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Express wrapper for (req, res) handler functions
const wrap = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error(`[Express] Error in ${req.path}:`, err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
};

app.post('/api/send-otp', wrap(sendOtp));
app.post('/api/verify-otp', wrap(verifyOtp));
app.post('/api/wylto-contact', wrap(wyltoContact));
app.post('/api/wylto-lead', wrap(wyltoLead));
app.post('/api/wylto-report', wrap(wyltoReport));
app.post('/api/wylto-sample', wrap(wyltoSample));
app.post('/api/ai', wrap(aiHandler));
app.post('/api/ai-tip', wrap(aiTipHandler));
app.get('/api/health', wrap(healthHandler));
app.post('/api/payu-initiate', wrap(payuInitiate));
app.post('/api/payu-success', wrap(payuSuccess));
app.post('/api/payu-failure', wrap(payuFailure));
app.get('/api/config', wrap(configHandler));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📂 Env Path: ${path.join(__dirname, '.env.backend')}`);
    console.log(`🔑 Wylto Key loaded: ${process.env.WYLTO_API_KEY ? 'YES' : 'NO'}`);
    console.log(`🤖 Gemini Key loaded: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
    console.log(`🧠 Claude Key loaded: ${(process.env.CLUADE_API_KEY || process.env.CLAUDE_API_KEY) ? 'YES' : 'NO'}`);
    console.log(`======================================\n`);
});
