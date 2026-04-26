import React from 'react';
import { BLOGS } from '../data/homeData';

export default function BlogsSection({ blogFilter, setBlogFilter, openBlog }) {
    const filters = [
        { id: 'all', label: 'All Articles' },
        { id: 'nutrition', label: 'Nutrition' },
        { id: 'health', label: 'Health & Skin' },
        { id: 'lifecycle', label: 'Lifecycle' },
        { id: 'ingredients', label: 'Ingredients' },
        { id: 'stories', label: 'Real Stories' }
    ];

    const getBlogStyles = (id) => {
        const styles = {
            1: { bg: "linear-gradient(135deg,#f5efe0,#e8dcc8)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3.27 6.96A10 10 0 1 0 17 20.07" /><path d="M11.29 7.03A6 6 0 0 0 7.03 11.3" /><circle cx="12" cy="12" r="2" /><path d="m2 22 4-4" /></svg>, cat: "Nutrition" },
            2: { bg: "linear-gradient(135deg,#ede6d8,#ddd0b8)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" /><path d="M7 21h10" /><line x1="12" y1="3" x2="12" y2="21" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></svg>, cat: "Nutrition" },
            3: { bg: "linear-gradient(135deg,#eaf5ef,#d4eadc)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>, cat: "Health & Skin" },
            4: { bg: "linear-gradient(135deg,#f0f0f5,#e0e0ee)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>, cat: "Nutrition" },
            5: { bg: "linear-gradient(135deg,#f5f0e8,#ece0cc)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>, cat: "Nutrition" },
            6: { bg: "linear-gradient(135deg,#fdf0f0,#f5dada)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l1 9H8L9 3z" /><path d="M6.5 13h11" /><path d="M8 21h8l1-8H7l1 8z" /></svg>, cat: "Ingredients" },
            7: { bg: "linear-gradient(135deg,#eef5f0,#d8ede0)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>, cat: "Lifecycle" },
            8: { bg: "linear-gradient(135deg,#f5f0e0,#ebe0c0)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, cat: "Lifecycle" },
            9: { bg: "linear-gradient(135deg,#f0f5ee,#dcecd8)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 .46 1.61A3 3 0 0 0 9 15h6a3 3 0 0 0 2.54-4.39A3 3 0 0 0 18 8a3 3 0 0 0-3-3 3 3 0 0 0-3-3z" /><line x1="12" y1="15" x2="12" y2="22" /></svg>, cat: "Ingredients" },
            10: { bg: "linear-gradient(135deg,#f5ede8,#edd8d0)", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>, cat: "Real Stories" }
        };
        return styles[id] || styles[1];
    };

    return (
        <section id="blogs" style={{ background: "var(--cream-2)" }}>
            <div className="wrap">
                <div className="sh c rv">
                    <span className="lbl">Blog</span>
                    <h2 className="title">Dog nutrition,<br />health &amp; fresh food guides.</h2>
                    <p className="lead mt12">10 science-backed articles by India's first AI dog nutrition company — written for Indian dog parents.</p>
                </div>
                <div className="blog-filter rv" id="blogFilter">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            className={`bf-btn${blogFilter === f.id ? ' on' : ''}`}
                            onClick={() => setBlogFilter(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="blog-grid sg" id="blogGrid">
                    {Object.entries(BLOGS).filter(([id, b]) => {
                        if (blogFilter === 'all') return true;
                        const style = getBlogStyles(id);
                        return style.cat.toLowerCase().includes(blogFilter.toLowerCase()) || b.tag.toLowerCase().includes(blogFilter.toLowerCase());
                    }).map(([id, b]) => {
                        const style = getBlogStyles(id);
                        return (
                            <div key={id} className="blog-card" onClick={() => openBlog(id)}>
                                <div className="bc-vis" style={{ background: style.bg }}>
                                    <div className="bc-icon-wrap">{style.icon}</div>
                                    <div className="bc-cat">{style.cat}</div>
                                </div>
                                <div className="bc-body">
                                    <div className="bc-tag">{b.tag.split('·')[1]?.trim() || b.tag}</div>
                                    <div className="bc-title">{b.title}</div>
                                    <div className="bc-footer"><span className="bc-mins">{b.mins} min read</span><span className="bc-arr">→</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
