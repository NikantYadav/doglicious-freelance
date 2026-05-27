import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

/**
 * Fetch published blog posts from the backend.
 * Falls back to empty array on error so the page still renders.
 */
export function useBlogPosts({ category, search } = {}) {
    const [posts,   setPosts]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (category && category !== 'all') params.set('category', category);
        if (search) params.set('search', search);

        fetch(`${API}/api/blog/posts?${params}`)
            .then(r => r.json())
            .then(data => {
                if (data.ok) setPosts(data.posts || []);
                else setError(data.error || 'Failed to load posts');
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [category, search]);

    return { posts, loading, error };
}

/**
 * Fetch a single published blog post by slug or id.
 */
export function useBlogPost(slugOrId) {
    const [post,    setPost]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        if (!slugOrId) return;
        setLoading(true);
        setPost(null);

        fetch(`${API}/api/blog/posts/${slugOrId}`)
            .then(r => r.json())
            .then(data => {
                if (data.ok) setPost(data.post);
                else setError(data.error || 'Post not found');
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [slugOrId]);

    return { post, loading, error };
}
