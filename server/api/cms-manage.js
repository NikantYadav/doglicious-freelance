/**
 * CMS Management API (all routes require auth)
 *
 * Categories
 *   GET    /api/cms/categories
 *   POST   /api/cms/categories
 *   PUT    /api/cms/categories/:id
 *   DELETE /api/cms/categories/:id
 *
 * Tags
 *   GET    /api/cms/tags
 *   DELETE /api/cms/tags/:id
 *
 * Comments
 *   GET    /api/cms/comments          ?status=pending|approved|spam
 *   PUT    /api/cms/comments/:id      { status }
 *   DELETE /api/cms/comments/:id
 *
 * Settings
 *   GET    /api/cms/settings
 *   PUT    /api/cms/settings          { key, value } or { settings: [{key,value}] }
 *
 * Analytics
 *   GET    /api/cms/analytics         — top posts, views over time, category breakdown
 */

import { supabase } from '../utils/supabase.js';

// ─────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
    const { data, error } = await supabase
        .from('cms_categories')
        .select('*')
        .order('name');
    if (error) return res.status(500).json({ error: 'Failed to fetch categories' });

    // Attach live post counts
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('category, status');

    const counts = {};
    (posts || []).forEach(p => {
        if (!counts[p.category]) counts[p.category] = { total: 0, published: 0 };
        counts[p.category].total++;
        if (p.status === 'published') counts[p.category].published++;
    });

    const categories = (data || []).map(c => ({
        ...c,
        post_count:           counts[c.name]?.total     || 0,
        published_post_count: counts[c.name]?.published || 0,
    }));

    return res.status(200).json({ ok: true, categories });
}

export async function createCategory(req, res) {
    const { name, description, color, bg_color, emoji } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { data, error } = await supabase
        .from('cms_categories')
        .insert({ name: name.trim(), slug, description, color, bg_color, emoji })
        .select('*')
        .single();

    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Category already exists' });
        return res.status(500).json({ error: 'Failed to create category' });
    }
    return res.status(201).json({ ok: true, category: data });
}

export async function updateCategory(req, res) {
    const { id } = req.params;
    const { name, description, color, bg_color, emoji } = req.body || {};

    const updates = {};
    if (name        !== undefined) { updates.name = name.trim(); updates.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    if (description !== undefined) updates.description = description;
    if (color       !== undefined) updates.color       = color;
    if (bg_color    !== undefined) updates.bg_color    = bg_color;
    if (emoji       !== undefined) updates.emoji       = emoji;

    const { data, error } = await supabase
        .from('cms_categories')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

    if (error) return res.status(500).json({ error: 'Failed to update category' });
    return res.status(200).json({ ok: true, category: data });
}

export async function deleteCategory(req, res) {
    const { id } = req.params;
    const { error } = await supabase.from('cms_categories').delete().eq('id', id);
    if (error) return res.status(500).json({ error: 'Failed to delete category' });
    return res.status(200).json({ ok: true });
}

// ─────────────────────────────────────────────────────────────────────
// TAGS  (derived from blog_posts.tags array, plus manual cms_tags)
// ─────────────────────────────────────────────────────────────────────

export async function listTags(req, res) {
    // Pull all tags from blog_posts and aggregate counts
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('tags, status');

    if (error) return res.status(500).json({ error: 'Failed to fetch tags' });

    const tagMap = {};
    (posts || []).forEach(p => {
        (p.tags || []).forEach(t => {
            if (!tagMap[t]) tagMap[t] = { name: t, total: 0, published: 0 };
            tagMap[t].total++;
            if (p.status === 'published') tagMap[t].published++;
        });
    });

    const tags = Object.values(tagMap).sort((a, b) => b.total - a.total);
    return res.status(200).json({ ok: true, tags });
}

export async function deleteTag(req, res) {
    // Remove this tag from all posts that have it
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);

    // Get all posts with this tag
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, tags')
        .contains('tags', [decodedName]);

    if (posts?.length) {
        for (const post of posts) {
            const newTags = (post.tags || []).filter(t => t !== decodedName);
            await supabase.from('blog_posts').update({ tags: newTags }).eq('id', post.id);
        }
    }

    return res.status(200).json({ ok: true, removed_from: posts?.length || 0 });
}

// ─────────────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────────────

export async function listComments(req, res) {
    const { status } = req.query;

    let query = supabase
        .from('cms_comments')
        .select('*, blog_posts(title, slug)')
        .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'Failed to fetch comments' });

    return res.status(200).json({ ok: true, comments: data || [] });
}

export async function updateComment(req, res) {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!['pending', 'approved', 'spam'].includes(status)) {
        return res.status(400).json({ error: 'status must be pending, approved, or spam' });
    }

    const { data, error } = await supabase
        .from('cms_comments')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();

    if (error) return res.status(500).json({ error: 'Failed to update comment' });
    return res.status(200).json({ ok: true, comment: data });
}

export async function deleteComment(req, res) {
    const { id } = req.params;
    const { error } = await supabase.from('cms_comments').delete().eq('id', id);
    if (error) return res.status(500).json({ error: 'Failed to delete comment' });
    return res.status(200).json({ ok: true });
}

// ─────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────

export async function getAnalytics(req, res) {
    // Fetch posts and comments in parallel
    const [postsResult, commentsResult] = await Promise.all([
        supabase
            .from('blog_posts')
            .select('id, title, slug, category, status, views, read_time, published_at, created_at, featured')
            .order('views', { ascending: false }),
        supabase
            .from('cms_comments')
            .select('id, status, created_at'),
    ]);

    if (postsResult.error) return res.status(500).json({ error: 'Failed to fetch analytics' });

    const all       = postsResult.data || [];
    const comments  = commentsResult.data || [];
    const published = all.filter(p => p.status === 'published');

    // Top 10 posts by views
    const topPosts = published.slice(0, 10).map(p => ({
        id: p.id, title: p.title, slug: p.slug,
        views: p.views || 0, category: p.category,
        published_at: p.published_at,
    }));

    // Category breakdown — derived entirely from DB
    const catMap = {};
    all.forEach(p => {
        if (!catMap[p.category]) catMap[p.category] = { total: 0, published: 0, views: 0 };
        catMap[p.category].total++;
        if (p.status === 'published') catMap[p.category].published++;
        catMap[p.category].views += p.views || 0;
    });
    const categoryBreakdown = Object.entries(catMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.views - a.views);

    // Monthly post counts (last 6 months) — from DB dates
    const now = new Date();
    const monthlyPosts = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        const count = all.filter(p => {
            const pd = new Date(p.created_at);
            return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
        }).length;
        monthlyPosts.push({ label, count });
    }

    // Aggregate stats — all from DB
    const totalViews = published.reduce((s, p) => s + (p.views || 0), 0);
    const avgViews   = published.length ? Math.round(totalViews / published.length) : 0;

    // Avg read time — parsed from read_time strings in DB
    const readMins = all
        .map(p => parseFloat((p.read_time || '').replace(/[^0-9.]/g, '')))
        .filter(n => !isNaN(n) && n > 0);
    const avgReadTime = readMins.length
        ? (readMins.reduce((a, b) => a + b, 0) / readMins.length).toFixed(1)
        : null;

    // Comment counts from DB
    const totalComments   = comments.length;
    const pendingComments = comments.filter(c => c.status === 'pending').length;

    return res.status(200).json({
        ok: true,
        analytics: {
            totalViews,
            avgViews,
            avgReadTime,
            totalPosts:      all.length,
            publishedPosts:  published.length,
            draftPosts:      all.filter(p => p.status === 'draft').length,
            scheduledPosts:  all.filter(p => p.status === 'scheduled').length,
            totalComments,
            pendingComments,
            topPosts,
            categoryBreakdown,
            monthlyPosts,
        },
    });
}
