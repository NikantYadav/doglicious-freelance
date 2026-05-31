import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { slugifyBlogIdentifier } from '../utils/blogSlug';

const API = import.meta.env.VITE_API_URL || '';

const CAT_BG = {
    'Nutrition':   'linear-gradient(145deg,#fff3e0,#ffe0b2)',
    'Dog Care':    'linear-gradient(145deg,#e8f5e9,#c8e6c9)',
    'Gut Health':  'linear-gradient(145deg,#e0f2f1,#b2dfdb)',
    'AI Health':   'linear-gradient(145deg,#e8eaf6,#c5cae9)',
    'Science':     'linear-gradient(145deg,#e8eaf6,#c5cae9)',
    'Breed Guide': 'linear-gradient(145deg,#e0f2f1,#b2dfdb)',
    'Vet Advice':  'linear-gradient(145deg,#fce4ec,#f8bbd0)',
    'Behavior':    'linear-gradient(145deg,#fff8e1,#ffecb3)',
};

const CAT_CLASS = {
    'Nutrition':   'blog-cat-nutrition',
    'Dog Care':    'blog-cat-care',
    'Gut Health':  'blog-cat-gut',
    'AI Health':   'blog-cat-science',
    'Science':     'blog-cat-science',
    'Breed Guide': 'blog-cat-care',
    'Vet Advice':  'blog-cat-care',
    'Behavior':    'blog-cat-nutrition',
};

// Trigger the existing Home.css scroll-reveal animations on newly rendered elements
function useReveal(dep) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        const els = ref.current.querySelectorAll('.rv, .sg');
        if (!els.length) return;

        const obs = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
            }),
            { threshold: 0.06, rootMargin: '0px 0px -20px 0px' }
        );
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [dep]); // re-run when data loads
    return ref;
}

export default function HomeBlogSection() {
    const navigate = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const sectionRef = useReveal(data); // re-attach observer after data arrives

    useEffect(() => {
        fetch(`${API}/api/blog/home`)
            .then(r => r.json())
            .then(d => { if (d.ok) setData(d); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const go = (post) => {
        const slug = post.slug || slugifyBlogIdentifier(post.title);
        if (!slug) return;
        navigate(`/blog/${slug}`);
    };

    return (
        <section id="blog" className="blog-sec" style={{ padding: '96px 0' }} ref={sectionRef}>
            <div className="w">
                {/* Header — always visible, no rv so it shows immediately */}
                <div className="blog-header" style={{ opacity: 1, transform: 'none' }}>
                    <span className="blog-label">✦ Expert Knowledge</span>
                    <h2 className="blog-title">Dog Health &amp; <em>Nutrition</em> Blog</h2>
                    <p className="blog-subtitle">Vet-backed guides to help you raise a healthier, happier dog.</p>
                </div>

                {/* Featured post */}
                {loading ? (
                    <div className="blog-featured" style={{ opacity: 1 }}>
                        <div className="blog-feat-visual" style={{ background: 'linear-gradient(135deg,#3d2a1a,#5a3e25)' }} />
                        <div className="blog-feat-content">
                            <div style={sk.line} />
                            <div style={{ ...sk.line, width: '80%', height: 24, marginBottom: 12 }} />
                            <div style={{ ...sk.line, width: '90%' }} />
                            <div style={{ ...sk.line, width: '65%' }} />
                        </div>
                    </div>
                ) : data?.featured ? (
                    <div
                        className="blog-featured rv in" /* pre-mark as in so it's visible immediately */
                        onClick={() => go(data.featured)}
                    >
                        <div className="blog-feat-visual">{data.featured.emoji || '🐾'}</div>
                        <div className="blog-feat-content">
                            <div className="blog-feat-cat">
                                ⭐ Featured · {data.featured.category}
                                {data.featured.tags?.[0] ? ` · ${data.featured.tags[0]}` : ''}
                            </div>
                            <h3 className="blog-feat-h">{data.featured.title}</h3>
                            <p className="blog-feat-d">{data.featured.excerpt}</p>
                            <span className="blog-feat-link">Read full article →</span>
                            <div className="blog-feat-meta">{data.featured.read_time} read</div>
                        </div>
                    </div>
                ) : null}

                {/* Grid cards */}
                <div className="blog-grid sg in">
                    {loading
                        ? [1,2,3,4,5,6].map(i => (
                            <div key={i} className="blog-card" style={{ opacity: 1 }}>
                                <div className="blog-card-top" style={{ background: '#ede8df' }} />
                                <div className="blog-card-body">
                                    <div style={sk.line} />
                                    <div style={{ ...sk.line, width: '85%', height: 16, marginBottom: 8 }} />
                                    <div style={{ ...sk.line, width: '70%' }} />
                                </div>
                            </div>
                        ))
                        : (data?.grid || []).map(post => (
                            <div key={post.id} className="blog-card rv" onClick={() => go(post)}>
                                <div
                                    className="blog-card-top"
                                    style={{ background: CAT_BG[post.category] || 'linear-gradient(145deg,#f5f0e8,#ece0cc)' }}
                                >
                                    {post.emoji || '🐾'}
                                </div>
                                <div className="blog-card-body">
                                    <div className={`blog-cat ${CAT_CLASS[post.category] || 'blog-cat-nutrition'}`}>
                                        {post.category}
                                    </div>
                                    <h3 className="blog-h">{post.title}</h3>
                                    <p className="blog-d">{post.excerpt}</p>
                                    <span className="blog-link">Read more →</span>
                                    <div className="blog-meta">{post.read_time} read · {post.category}</div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* Wide bottom cards */}
                {!loading && data?.wide?.length > 0 && (
                    <div className="blog-bottom sg in">
                        {data.wide.map(post => (
                            <div key={post.id} className="blog-wide rv" onClick={() => go(post)}>
                                <div className="blog-wide-icon">{post.emoji || '🐾'}</div>
                                <div className="blog-wide-body">
                                    <div className="blog-wide-cat">{post.category}</div>
                                    <h3 className="blog-wide-h">{post.title}</h3>
                                    <p className="blog-wide-d">{post.excerpt}</p>
                                    <span className="blog-wide-link">Read more →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="blog-view-all" style={{ opacity: 1, transform: 'none' }}>
                    <button className="btn-blog-all" onClick={() => navigate('/blogs')}>
                        📚 View all articles →
                    </button>
                </div>
            </div>
        </section>
    );
}

const sk = {
    line: {
        height: 12, borderRadius: 6, marginBottom: 8,
        background: 'linear-gradient(90deg,rgba(255,255,255,.08) 25%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.08) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
    },
};
