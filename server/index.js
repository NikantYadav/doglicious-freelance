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
import vetrxProfile from './api/vetrx-profile.js';
import cmsAuthHandler from './api/cms-auth.js';
import { requireAuth } from './api/cms-auth.js';
import { listPosts, getPost, createPost, updatePost, deletePost, toggleFeatured, getStats } from './api/cms-posts.js';
import { listPublicPosts, getPublicPost, getHomePosts } from './api/cms-public.js';
import {
    listCategories, createCategory, updateCategory, deleteCategory,
    listTags, deleteTag,
    listComments, updateComment, deleteComment,
    getAnalytics,
} from './api/cms-manage.js';

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
app.post('/api/ai', wrap(aiHandler));
app.post('/api/ai-tip', wrap(aiTipHandler));
app.get('/api/health', wrap(healthHandler));
app.post('/api/payu-initiate', wrap(payuInitiate));
app.post('/api/payu-success', wrap(payuSuccess));
app.post('/api/payu-failure', wrap(payuFailure));
app.get('/api/config', wrap(configHandler));
app.get('/api/vetrx/profile', wrap(vetrxProfile));
app.post('/api/vetrx/profile', wrap(vetrxProfile));
app.post('/api/poopsense/ai', wrap(poopsenseAi));
app.post('/api/poopsense/sync', wrap(poopsenseSync));
app.post('/api/poopsense/payu-initiate', wrap(psPayuInitiate));
app.post('/api/poopsense/payu-success', wrap(psPayuSuccess));
app.post('/api/poopsense/payu-failure', wrap(psPayuFailure));

// ── Public Blog routes (no auth) ─────────────────────────────────────
app.get('/api/blog/home',        wrap(getHomePosts));
app.get('/api/blog/posts',       wrap(listPublicPosts));
app.get('/api/blog/posts/:slug', wrap(getPublicPost));

// ── CMS Auth routes ──────────────────────────────────────────────────
app.post('/api/cms/register', (req, res) => { req.params = { action: 'register' }; return wrap(cmsAuthHandler)(req, res); });
app.post('/api/cms/login',    (req, res) => { req.params = { action: 'login' };    return wrap(cmsAuthHandler)(req, res); });
app.post('/api/cms/logout',   (req, res) => { req.params = { action: 'logout' };   return wrap(cmsAuthHandler)(req, res); });
app.get('/api/cms/me',        (req, res) => { req.params = { action: 'me' };       return wrap(cmsAuthHandler)(req, res); });

// ── CMS Posts routes (all protected) ────────────────────────────────
const cmsAuth = async (req, res, next) => {
    try { await requireAuth(req, res, next); }
    catch (err) { if (!res.headersSent) res.status(500).json({ error: err.message }); }
};

app.get('/api/cms/stats',              cmsAuth, wrap(getStats));
app.get('/api/cms/posts',              cmsAuth, wrap(listPosts));
app.post('/api/cms/posts',             cmsAuth, wrap(createPost));
app.get('/api/cms/posts/:id',          cmsAuth, wrap(getPost));
app.put('/api/cms/posts/:id',          cmsAuth, wrap(updatePost));
app.delete('/api/cms/posts/:id',       cmsAuth, wrap(deletePost));
app.post('/api/cms/posts/:id/feature', cmsAuth, wrap(toggleFeatured));

// ── CMS Manage routes ────────────────────────────────────────────────
app.get('/api/cms/categories',         cmsAuth, wrap(listCategories));
app.post('/api/cms/categories',        cmsAuth, wrap(createCategory));
app.put('/api/cms/categories/:id',     cmsAuth, wrap(updateCategory));
app.delete('/api/cms/categories/:id',  cmsAuth, wrap(deleteCategory));

app.get('/api/cms/tags',               cmsAuth, wrap(listTags));
app.delete('/api/cms/tags/:name',      cmsAuth, wrap(deleteTag));

app.get('/api/cms/comments',           cmsAuth, wrap(listComments));
app.put('/api/cms/comments/:id',       cmsAuth, wrap(updateComment));
app.delete('/api/cms/comments/:id',    cmsAuth, wrap(deleteComment));

app.get('/api/cms/analytics',          cmsAuth, wrap(getAnalytics));

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
