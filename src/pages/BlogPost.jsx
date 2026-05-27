import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import SiteHeader from '../components/shared/SiteHeader';
import SiteFooter from '../components/shared/SiteFooter';
import { useBlogPost } from '../hooks/useBlogPosts';
import '../styles/Home.css';
import '../styles/BlogPost.css';

export default function BlogPost() {
    const { id } = useParams();   // can be a slug or legacy numeric id
    const navigate = useNavigate();

    // Resolve legacy numeric ids to their known slugs
    const LEGACY_SLUG_MAP = {
        '1':  'why-ghar-ka-khana-is-finally-available-for-your-dog',
        '2':  'kibble-vs-fresh-dog-food-the-truth',
        '3':  'dog-coat-dull-skin-itchy-stop-blaming-weather',
        '4':  'how-to-switch-dog-to-fresh-food',
        '5':  'what-indian-dogs-actually-need-to-eat',
        '6':  'preservative-problem-indian-dog-food-aflatoxin',
        '7':  'what-to-feed-puppy-first-year-india',
        '8':  'senior-dog-eating-less-answer',
        '9':  'indian-kitchen-dog-safe-foods-myths',
        '10': 'five-indian-dogs-five-families-one-thing',
    };

    const slug = LEGACY_SLUG_MAP[id] || id;
    const { post, loading, error } = useBlogPost(slug);

    useSEO({
        title: post ? `${post.title} | Doglicious` : 'Article | Doglicious',
        description: post ? post.excerpt : '',
        canonical: `https://doglicious.in/blog/${id}`,
    });

    React.useEffect(() => { window.scrollTo(0, 0); }, [id]);

    if (loading) {
        return (
            <>
                <SiteHeader />
                <div className="bp-loading">
                    <div className="bp-mx">
                        <div className="bp-skel-tag" />
                        <div className="bp-skel-title" />
                        <div className="bp-skel-title bp-skel-title-short" />
                        <div className="bp-skel-body" />
                    </div>
                </div>
                <SiteFooter />
            </>
        );
    }

    if (error || !post) {
        return (
            <>
                <SiteHeader />
                <div className="bp-not-found">
                    <h2>Article not found</h2>
                    <button onClick={() => navigate('/blogs')}>← Back to blog</button>
                </div>
                <SiteFooter />
            </>
        );
    }

    return (
        <>
            <SiteHeader />

            {/* Breadcrumb */}
            <div className="bp-breadcrumb">
                <div className="bp-mx">
                    <a href="/">Home</a><span>›</span>
                    <a href="/blogs">Blog</a><span>›</span>
                    <span>{post.category}</span>
                </div>
            </div>

            {/* Article */}
            <article className="bp-article">
                <div className="bp-mx">
                    <div className="bp-meta-top">
                        <span className="bp-tag">{post.category}{post.tags?.length ? ` · ${post.tags[0]}` : ''}</span>
                        <span className="bp-mins">{post.read_time} read</span>
                    </div>
                    <h1 className="bp-title">{post.title}</h1>
                    {post.excerpt && <div className="bp-kw">{post.excerpt}</div>}
                    <div className="bp-body" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                </div>
            </article>

            {/* CTA */}
            <div className="bp-cta-wrap">
                <div className="bp-mx">
                    <div className="bp-cta">
                        <h3>Ready to feed your dog better?</h3>
                        <p>Try Doglicious fresh food — vet-approved, human-grade, delivered to your door.</p>
                        <a href="/#booking" className="bp-cta-btn">Book ₹99 Sample →</a>
                    </div>
                </div>
            </div>

            {/* Back link */}
            <div className="bp-back-wrap">
                <div className="bp-mx">
                    <button className="bp-back-btn" onClick={() => navigate('/blogs')}>
                        ← Back to all articles
                    </button>
                </div>
            </div>

            <SiteFooter />
        </>
    );
}
