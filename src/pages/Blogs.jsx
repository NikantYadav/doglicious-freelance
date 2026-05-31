import { useState } from 'react';
import '../styles/Home.css';
import '../styles/Blogs.css';
import SiteHeader from '../components/shared/SiteHeader';
import SiteFooter from '../components/shared/SiteFooter';
import { useSEO } from '../hooks/useSEO';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { slugifyBlogIdentifier } from '../utils/blogSlug';

// Map CMS categories → filter keys used in the UI
const CATEGORY_MAP = {
    all:         null,
    nutrition:   'Nutrition',
    health:      'Dog Care',
    lifecycle:   'lifecycle',   // matches tags/category containing "lifecycle"
    ingredients: 'ingredients',
    stories:     'stories',
};

// Gradient backgrounds per category
const CAT_BG = {
    'Nutrition':   'linear-gradient(135deg,#f5efe0,#e8dcc8)',
    'Dog Care':    'linear-gradient(135deg,#eaf5ef,#d4eadc)',
    'Gut Health':  'linear-gradient(135deg,#eaf5ef,#d4eadc)',
    'AI Health':   'linear-gradient(135deg,#f0f0f5,#e0e0ee)',
    'Science':     'linear-gradient(135deg,#f0f0f5,#e0e0ee)',
    'Breed Guide': 'linear-gradient(135deg,#eef5f0,#d8ede0)',
    'Vet Advice':  'linear-gradient(135deg,#fdf0f0,#f5dada)',
    'Behavior':    'linear-gradient(135deg,#f5ede8,#edd8d0)',
};

const FILTER_TABS = [
    { key: 'all',         label: 'All Articles' },
    { key: 'nutrition',   label: 'Nutrition' },
    { key: 'health',      label: 'Health & Care' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'stories',     label: 'Real Stories' },
];

function matchesFilter(post, filterKey) {
    if (filterKey === 'all') return true;
    const cat   = (post.category || '').toLowerCase();
    const tags  = (post.tags || []).map(t => t.toLowerCase());
    const title = (post.title || '').toLowerCase();
    const all   = [cat, ...tags, title].join(' ');
    return all.includes(filterKey);
}

export default function Blogs() {
    useSEO({
        title: 'Doglicious Blog | Fresh Food Science & Health Guides',
        description: 'Read science-backed articles on dog nutrition, Kibble vs Fresh food facts, and common skin/coat health issues.',
        path: '/blogs'
    });

    const [blogFilter, setBlogFilter] = useState('all');
    const { posts, loading, error } = useBlogPosts();

    const visible = posts
        .filter(p => matchesFilter(p, blogFilter))
        .sort((a, b) => {
            // Featured posts always first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return 0;
        });

    const handleBlogClick = (post) => {
        const slug = post.slug || slugifyBlogIdentifier(post.title);
        if (!slug) return;
        window.open(`/blog/${slug}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <SiteHeader />

            {/* HERO */}
            <div className="blogs-hero">
                <div className="w">
                    <span className="blogs-hero-label">✦ Expert Knowledge</span>
                    <h1 className="blogs-hero-title">Dog Health &amp; Nutrition Blog</h1>
                    <p className="blogs-hero-sub">Science-backed guides by India's first AI dog nutrition company — written for Indian dog parents.</p>
                </div>
            </div>

            {/* FILTER + GRID */}
            <div className="blogs-section">
                <div className="w">
                    <div className="blog-filter">
                        {FILTER_TABS.map(({ key, label }) => (
                            <button
                                key={key}
                                className={`bf-btn${blogFilter === key ? ' on' : ''}`}
                                onClick={() => setBlogFilter(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div className="blogs-loading">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="bc bc-skeleton">
                                    <div className="bc-vis bc-skel-vis" />
                                    <div className="bc-body">
                                        <div className="bc-skel-line bc-skel-short" />
                                        <div className="bc-skel-line" />
                                        <div className="bc-skel-line bc-skel-med" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="blogs-error">
                            Could not load articles. Please try again later.
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="blogs-grid">
                            {visible.length === 0 ? (
                                <div className="blogs-empty">No articles found in this category.</div>
                            ) : visible.map(post => (
                                <div
                                    key={post.id}
                                    className="bc"
                                    onClick={() => handleBlogClick(post)}
                                >
                                    <div
                                        className="bc-vis"
                                        style={{ background: CAT_BG[post.category] || 'linear-gradient(135deg,#f5f0e8,#ece0cc)' }}
                                    >
                                        <div className="bc-icon-wrap">
                                            <span style={{ fontSize: 32 }}>{post.emoji || '🐾'}</span>
                                        </div>
                                        <span className="bc-cat-pill">{post.category}</span>
                                        {post.featured && (
                                            <span className="bc-cat-pill" style={{ left: 'auto', right: 14, background: 'rgba(124,82,48,0.85)', color: '#fff' }}>
                                                ⭐ Featured
                                            </span>
                                        )}
                                    </div>
                                    <div className="bc-body">
                                        <div className="bc-tag">{(post.tags || [])[0] || post.category}</div>
                                        <div className="bc-title">{post.title}</div>
                                        <div className="bc-footer">
                                            <span className="bc-mins">{post.read_time} read</span>
                                            <span className="bc-arr">→</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SiteFooter />
        </>
    );
}
