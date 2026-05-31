/**
 * Public Blog API — no auth required
 * GET /api/blog/posts          — list published posts (for Blogs page)
 * GET /api/blog/posts/:slug    — single post by slug (for BlogPost page)
 */

import { supabase } from '../utils/supabase.js';

function slugify(title) {
    return String(title || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

const SELECT_LIST = 'id, emoji, title, slug, excerpt, category, status, views, author, read_time, featured, tags, published_at, created_at';
const SELECT_FULL = '*';

/**
 * GET /api/blog/home
 * Returns: { featured, grid, wide }
 *   featured — the single featured:true post (or most recent published if none)
 *   grid     — next 6 published posts (excluding featured)
 *   wide     — next 2 after that (for the bottom wide cards on homepage)
 */
export async function getHomePosts(req, res) {
    const { data, error } = await supabase
        .from('blog_posts')
        .select(SELECT_LIST)
        .eq('status', 'published')
        .order('featured', { ascending: false })   // featured=true first
        .order('published_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('[cms-public] home error:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    const posts = data || [];
    const featured = posts.find(p => p.featured) || posts[0] || null;
    const rest = posts.filter(p => p.id !== featured?.id);
    const grid = rest.slice(0, 6);
    const wide = rest.slice(6, 8);

    return res.status(200).json({ ok: true, featured, grid, wide });
}

export async function listPublicPosts(req, res) {
    const { category, search, limit = 50 } = req.query;

    let query = supabase
        .from('blog_posts')
        .select(SELECT_LIST)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(parseInt(limit, 10));

    if (category && category !== 'all') {
        query = query.ilike('category', `%${category}%`);
    }

    const { data, error } = await query;
    if (error) {
        console.error('[cms-public] list error:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    let posts = data || [];

    if (search) {
        const q = search.toLowerCase();
        posts = posts.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }

    return res.status(200).json({ ok: true, posts });
}

export async function getPublicPost(req, res) {
    const { slug } = req.params;

    // Support both UUID id and slug
    const isUuid = /^[0-9a-f-]{36}$/.test(slug);
    const query = supabase
        .from('blog_posts')
        .select(SELECT_FULL)
        .eq('status', 'published');

    const { data, error } = await (isUuid
        ? query.eq('id', slug)
        : query.eq('slug', slug)
    ).maybeSingle();

    if (!error && data) {
        Promise.resolve(supabase.rpc('increment_post_views', { post_id: data.id })).catch(() => {});
        return res.status(200).json({ ok: true, post: data });
    }

    const { data: fallbackPosts, error: fallbackError } = await supabase
        .from('blog_posts')
        .select(SELECT_FULL)
        .eq('status', 'published');

    if (fallbackError) {
        console.error('[cms-public] post fallback error:', fallbackError);
        return res.status(404).json({ error: 'Post not found' });
    }

    const normalized = slugify(slug);
    const fallbackPost = (fallbackPosts || []).find(post =>
        post.slug === slug || slugify(post.title) === normalized
    );

    if (!fallbackPost) return res.status(404).json({ error: 'Post not found' });

    // Atomic view increment via DB function — no race condition
    Promise.resolve(supabase.rpc('increment_post_views', { post_id: fallbackPost.id })).catch(() => {});

    return res.status(200).json({ ok: true, post: fallbackPost });
}
