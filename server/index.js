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
import dbLead from './api/db-lead.js';
import dbReport from './api/db-report.js';
import dbSample from './api/db-sample.js';
import aiHandler from './api/ai.js';
import aiTipHandler from './api/ai-tip.js';
import healthHandler from './api/health.js';
import payuInitiate from './api/payu-initiate.js';
import payuSuccess from './api/payu-success.js';
import payuFailure from './api/payu-failure.js';
import configHandler from './api/config.js';
import poopsenseAi from './api/poopsense-ai.js';
import poopsenseSync from './api/poopsense-sync.js';
import { initiateHandler as psPayuInitiate, successHandler as psPayuSuccess, failureHandler as psPayuFailure } from './api/poopsense-payu.js';

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
app.post('/api/db-lead', wrap(dbLead));
app.post('/api/db-report', wrap(dbReport));
app.post('/api/db-sample', wrap(dbSample));
app.post('/api/ai', wrap(aiHandler));
app.post('/api/ai-tip', wrap(aiTipHandler));
app.get('/api/health', wrap(healthHandler));
app.post('/api/payu-initiate', wrap(payuInitiate));
app.post('/api/payu-success', wrap(payuSuccess));
app.post('/api/payu-failure', wrap(payuFailure));
app.get('/api/config', wrap(configHandler));
app.post('/api/poopsense/ai', wrap(poopsenseAi));
app.post('/api/poopsense/sync', wrap(poopsenseSync));
app.post('/api/poopsense/payu-initiate', wrap(psPayuInitiate));
app.post('/api/poopsense/payu-success', wrap(psPayuSuccess));
app.post('/api/poopsense/payu-failure', wrap(psPayuFailure));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📂 Env Path: ${path.join(__dirname, '.env.backend')}`);
    console.log(`🗄️  Supabase URL: ${process.env.SUPABASE_URL ? 'YES' : 'NO'}`);
    console.log(`🔑 Supabase Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'YES' : 'NO'}`);
    console.log(`🤖 Gemini Key loaded: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
    console.log(`🧠 Claude Key loaded: ${(process.env.CLUADE_API_KEY || process.env.CLAUDE_API_KEY) ? 'YES' : 'NO'}`);
    console.log(`======================================\n`);
});
