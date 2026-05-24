// server/utils/supabase.js
// Supabase client for backend use — lazy-initialized so dotenv has time to load.

import { createClient } from '@supabase/supabase-js';

let _client = null;

function getClient() {
    if (_client) return _client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment.');
    }

    _client = createClient(url, key, { auth: { persistSession: false } });
    return _client;
}

// Proxy object — any property access triggers lazy init
export const supabase = new Proxy({}, {
    get(_, prop) {
        return getClient()[prop];
    }
});
