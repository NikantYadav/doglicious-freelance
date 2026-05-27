/**
 * CMS Blog Posts API (all routes require auth)
 * GET    /api/cms/posts          — list all posts
 * POST   /api/cms/posts          — create post
 * GET    /api/cms/posts/:id      — get single post
 * PUT    /api/cms/posts/:id      — update post
 * DELETE /api/cms/posts/:id      — delete post
 * POST   /api/cms/posts/:id/feature — toggle featured
 */

import { supabase } from '../utils/supabase.js';

// ── Slug generator ────────────────────────────────────────────────────

function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

async function uniqueSlug(base, excludeId = null) {
    let slug = base;
    let attempt = 0;
    while (true) {
        const query = supabase.from('blog_posts').select('id').eq('slug', slug);
        if (excludeId) query.neq('id', excludeId);
        const { data } = await query.maybeSingle();
        if (!data) return slug;
        attempt++;
        slug = `${base}-${attempt}`;
    }
}

// ── List posts ────────────────────────────────────────────────────────

async function listPosts(req, res) {
    const { status, search } = req.query;

    let query = supabase
        .from('blog_posts')
        .select('id, emoji, title, slug, excerpt, category, status, views, author, read_time, featured, tags, created_at, updated_at, published_at, scheduled_at')
        .order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
        console.error('[cms-posts] list error:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    let posts = data || [];

    if (search) {
        const q = search.toLowerCase();
        posts = posts.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }

    return res.status(200).json({ ok: true, posts });
}

// ── Get single post ───────────────────────────────────────────────────

async function getPost(req, res) {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error || !data) return res.status(404).json({ error: 'Post not found' });
    return res.status(200).json({ ok: true, post: data });
}

// ── Create post ───────────────────────────────────────────────────────

async function createPost(req, res) {
    const body = req.body || {};
    const { title } = body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'title is required' });
    }

    const baseSlug = slugify(title.trim());
    const slug = await uniqueSlug(baseSlug);

    const now = new Date().toISOString();
    const status = body.status || 'draft';
    const featured = body.featured || false;

    // Enforce single featured post
    if (featured) {
        await supabase
            .from('blog_posts')
            .update({ featured: false, updated_at: now })
            .eq('featured', true);
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .insert({
            emoji:         body.emoji || '🐾',
            title:         title.trim(),
            slug,
            excerpt:       body.excerpt || '',
            content:       body.content || '',
            category:      body.category || 'Nutrition',
            status,
            author:        body.author || req.cmsUser?.name || 'Admin',
            read_time:     body.read_time || '5 min',
            featured,
            tags:          body.tags || [],
            seo_indexed:   body.seo_indexed !== false,
            comments_open: body.comments_open !== false,
            created_by:    req.cmsUser?.id || null,
            published_at:  status === 'published' ? now : null,
            scheduled_at:  body.scheduled_at || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('[cms-posts] create error:', error);
        return res.status(500).json({ error: 'Failed to create post' });
    }

    return res.status(201).json({ ok: true, post: data });
}

// ── Update post ───────────────────────────────────────────────────────

async function updatePost(req, res) {
    const { id } = req.params;
    const body = req.body || {};

    // Check post exists
    const { data: existing } = await supabase
        .from('blog_posts')
        .select('id, status, published_at, slug')
        .eq('id', id)
        .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Post not found' });

    const updates = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) {
        updates.title = body.title.trim();
        const baseSlug = slugify(updates.title);
        updates.slug = await uniqueSlug(baseSlug, id);
    }
    if (body.emoji     !== undefined) updates.emoji     = body.emoji;
    if (body.excerpt   !== undefined) updates.excerpt   = body.excerpt;
    if (body.content   !== undefined) updates.content   = body.content;
    if (body.category  !== undefined) updates.category  = body.category;
    if (body.author    !== undefined) updates.author    = body.author;
    if (body.read_time !== undefined) updates.read_time = body.read_time;
    if (body.featured  !== undefined) {
        updates.featured = body.featured;
        // Enforce single featured post — unfeature all others when featuring this one
        if (body.featured === true) {
            await supabase
                .from('blog_posts')
                .update({ featured: false, updated_at: new Date().toISOString() })
                .eq('featured', true)
                .neq('id', id);
        }
    }
    if (body.tags      !== undefined) updates.tags      = body.tags;
    if (body.seo_indexed   !== undefined) updates.seo_indexed   = body.seo_indexed;
    if (body.comments_open !== undefined) updates.comments_open = body.comments_open;
    if (body.scheduled_at  !== undefined) updates.scheduled_at  = body.scheduled_at;

    if (body.status !== undefined) {
        updates.status = body.status;
        // Set published_at when first publishing
        if (body.status === 'published' && !existing.published_at) {
            updates.published_at = new Date().toISOString();
        }
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        console.error('[cms-posts] update error:', error);
        return res.status(500).json({ error: 'Failed to update post' });
    }

    return res.status(200).json({ ok: true, post: data });
}

// ── Delete post ───────────────────────────────────────────────────────

async function deletePost(req, res) {
    const { id } = req.params;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
        console.error('[cms-posts] delete error:', error);
        return res.status(500).json({ error: 'Failed to delete post' });
    }

    return res.status(200).json({ ok: true });
}

// ── Toggle featured ───────────────────────────────────────────────────

async function toggleFeatured(req, res) {
    const { id } = req.params;

    const { data: existing } = await supabase
        .from('blog_posts')
        .select('id, featured')
        .eq('id', id)
        .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Post not found' });

    const newFeatured = !existing.featured;

    // If featuring this post, unfeature all others first (only one featured at a time)
    if (newFeatured) {
        await supabase
            .from('blog_posts')
            .update({ featured: false, updated_at: new Date().toISOString() })
            .eq('featured', true)
            .neq('id', id);
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .update({ featured: newFeatured, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, featured')
        .single();

    if (error) return res.status(500).json({ error: 'Failed to update post' });
    return res.status(200).json({ ok: true, featured: data.featured });
}

// ── Stats ─────────────────────────────────────────────────────────────

async function getStats(req, res) {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('status, views, read_time');

    if (error) return res.status(500).json({ error: 'Failed to fetch stats' });

    const posts = data || [];
    const total     = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts    = posts.filter(p => p.status === 'draft').length;
    const scheduled = posts.filter(p => p.status === 'scheduled').length;
    const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0);

    // Parse read_time strings like "5 min", "4 min read" → number
    const readMins = posts
        .map(p => parseFloat((p.read_time || '').replace(/[^0-9.]/g, '')))
        .filter(n => !isNaN(n) && n > 0);
    const avgReadTime = readMins.length
        ? (readMins.reduce((a, b) => a + b, 0) / readMins.length).toFixed(1)
        : null;

    return res.status(200).json({ ok: true, stats: { total, published, drafts, scheduled, totalViews, avgReadTime } });
}

export { listPosts, getPost, createPost, updatePost, deletePost, toggleFeatured, getStats };
