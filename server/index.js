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
import hsContact from './api/hs-contact.js';
import hsReport from './api/hs-report.js';
import aiHandler from './api/ai.js';
import healthHandler from './api/health.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Express wrapper for Vercel-style (req, res) handler functions
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
app.post('/api/hs-contact', wrap(hsContact));
app.post('/api/hs-report', wrap(hsReport));
app.post('/api/ai', wrap(aiHandler));
app.get('/api/health', wrap(healthHandler));

// Export for Vercel
export default app;

const PORT = process.env.PORT || 5000;
// Only listen locally, Vercel handles the serverless execution
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n======================================`);
        console.log(`🚀 API Server running on port ${PORT}`);
        console.log(`📂 Env Path: ${path.join(__dirname, '.env.backend')}`);
        console.log(`🔑 HubSpot Key loaded: ${process.env.HUBSPOT_API_KEY ? 'YES' : 'NO'}`);
        console.log(`🤖 Gemini Key loaded: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
        console.log(`======================================\n`);
    });
}
