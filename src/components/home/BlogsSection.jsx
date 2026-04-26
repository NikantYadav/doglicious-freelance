import React from 'react';

const BLOG_CARDS = [
    {
        id: 1, cat: 'nutrition',
        bg: 'linear-gradient(135deg,#f5efe0,#e8dcc8)',
        catLabel: 'Nutrition', tag: 'Fresh Food Science',
        title: 'Why Ghar Ka Khana Is Finally Available for Your Dog — The Science Behind Fresh Food',
        mins: 9,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3.27 6.96A10 10 0 1 0 17 20.07"/><path d="M11.29 7.03A6 6 0 0 0 7.03 11.3"/><circle cx="12" cy="12" r="2"/><path d="m2 22 4-4"/></svg>
    },
    {
        id: 2, cat: 'nutrition',
        bg: 'linear-gradient(135deg,#ede6d8,#ddd0b8)',
        catLabel: 'Nutrition', tag: 'Kibble vs Fresh',
        title: 'Kibble vs Fresh Dog Food — The Truth No Brand Will Tell You',
        mins: 9,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
    },
    {
        id: 3, cat: 'health',
        bg: 'linear-gradient(135deg,#eaf5ef,#d4eadc)',
        catLabel: 'Health & Skin', tag: 'Skin & Coat',
        title: "Is Your Dog's Coat Dull and Skin Itchy? Stop Blaming the Weather",
        mins: 8,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    },
    {
        id: 4, cat: 'nutrition',
        bg: 'linear-gradient(135deg,#f0f0f5,#e0e0ee)',
        catLabel: 'Nutrition', tag: 'Transition Guide',
        title: 'How to Switch Your Dog to Fresh Food Without the Drama',
        mins: 7,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
    },
    {
        id: 5, cat: 'nutrition',
        bg: 'linear-gradient(135deg,#f5f0e8,#ece0cc)',
        catLabel: 'Nutrition', tag: 'Indian Dogs',
        title: "What Indian Dogs Actually Need to Eat — And Why We've Been Getting It Wrong",
        mins: 9,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    },
    {
        id: 6, cat: 'ingredients',
        bg: 'linear-gradient(135deg,#fdf0f0,#f5dada)',
        catLabel: 'Ingredients', tag: 'Preservatives',
        title: 'The Preservative Problem in Indian Dog Food — Including the Aflatoxin Truth',
        mins: 8,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l1 9H8L9 3z"/><path d="M6.5 13h11"/><path d="M8 21h8l1-8H7l1 8z"/></svg>
    },
    {
        id: 7, cat: 'lifecycle',
        bg: 'linear-gradient(135deg,#eef5f0,#d8ede0)',
        catLabel: 'Lifecycle', tag: 'Puppy Guide',
        title: "What to Feed Your Puppy in Their First Year — The Guide Most Indian Vets Don't Give You",
        mins: 8,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
    },
    {
        id: 8, cat: 'lifecycle',
        bg: 'linear-gradient(135deg,#f5f0e0,#ebe0c0)',
        catLabel: 'Lifecycle', tag: 'Senior Dogs',
        title: 'Your Senior Dog Is Eating Less — And the Answer Probably Isn\'t Another Vet Visit',
        mins: 8,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    {
        id: 9, cat: 'ingredients',
        bg: 'linear-gradient(135deg,#f0f5ee,#dcecd8)',
        catLabel: 'Ingredients', tag: 'Indian Kitchen Guide',
        title: 'The Indian Kitchen and Your Dog — What\'s Safe, What\'s a Myth, and What Could Kill Them',
        mins: 8,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 .46 1.61A3 3 0 0 0 9 15h6a3 3 0 0 0 2.54-4.39A3 3 0 0 0 18 8a3 3 0 0 0-3-3 3 3 0 0 0-3-3z"/><line x1="12" y1="15" x2="12" y2="22"/></svg>
    },
    {
        id: 10, cat: 'stories',
        bg: 'linear-gradient(135deg,#f5ede8,#edd8d0)',
        catLabel: 'Real Stories', tag: 'Customer Stories',
        title: 'Five Indian Dogs. Five Families. One Thing That Changed Everything.',
        mins: 7,
        svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="var(--brown)" opacity=".15"/><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    },
];

export default function BlogsSection({ blogFilter, setBlogFilter, openBlog }) {
    const filtered = blogFilter === 'all'
        ? BLOG_CARDS
        : BLOG_CARDS.filter(b => b.cat === blogFilter);

    const handleBlogClick = (id) => {
        window.open(`/blog/${id}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <section id="blogs" style={{ background: "var(--cream-2)", paddingBottom: "56px" }}>
            <div className="wrap">
                <div className="sh rv">
                    <span className="lbl">Blog</span>
                    <h2 className="title">Dog nutrition,<br />health &amp; fresh food guides.</h2>
                    <p className="lead mt12">10 science-backed articles by India's first AI dog nutrition company — written for Indian dog parents.</p>
                </div>
                <div className="blog-filter rv" id="blogFilter">
                    {[
                        { key: 'all', label: 'All Articles' },
                        { key: 'nutrition', label: 'Nutrition' },
                        { key: 'health', label: 'Health & Skin' },
                        { key: 'lifecycle', label: 'Lifecycle' },
                        { key: 'ingredients', label: 'Ingredients' },
                        { key: 'stories', label: 'Real Stories' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`bf-btn${blogFilter === key ? ' on' : ''}`}
                            onClick={() => setBlogFilter(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="blog-grid sg" id="blogGrid">
                    {BLOG_CARDS.map(b => (
                        <div
                            key={b.id}
                            className="blog-card"
                            style={{ opacity: blogFilter === 'all' || b.cat === blogFilter ? '1' : '0.2', transform: blogFilter === 'all' || b.cat === blogFilter ? '' : 'scale(.97)', transition: 'opacity .3s, transform .3s' }}
                            onClick={() => handleBlogClick(b.id)}
                        >
                            <div className="bc-vis" style={{ background: b.bg }}>
                                <div className="bc-icon-wrap">{b.svg}</div>
                                <div className="bc-cat">{b.catLabel}</div>
                            </div>
                            <div className="bc-body">
                                <div className="bc-tag">{b.tag}</div>
                                <div className="bc-title">{b.title}</div>
                                <div className="bc-footer">
                                    <span className="bc-mins">{b.mins} min read</span>
                                    <span className="bc-arr">→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
