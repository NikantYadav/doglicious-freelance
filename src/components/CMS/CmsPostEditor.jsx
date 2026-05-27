import React, { useState, useEffect, useRef } from 'react';
import { useCms } from './CmsContext';

// Fallback categories if API is unavailable
const FALLBACK_CATEGORIES = ['Nutrition','Gut Health','AI Health','Dog Care','Science','Breed Guide','Vet Advice','Behavior'];

function slugify(t) {
    return t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80);
}

export default function CmsPostEditor({ post, onSave, onClose, saving }) {
    const { authFetch } = useCms();
    const isNew = !post?.id;

    // Fetch categories from API
    const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
    useEffect(() => {
        authFetch('/api/cms/categories')
            .then(d => { if (d.categories?.length) setCategories(d.categories.map(c => c.name)); })
            .catch(() => {}); // silently fall back
    }, [authFetch]);

    const [form, setForm] = useState({
        emoji:         post?.emoji        || '🐾',
        title:         post?.title        || '',
        excerpt:       post?.excerpt      || '',
        content:       post?.content      || '',
        category:      post?.category     || '',
        status:        post?.status       || 'published',
        author:        post?.author       || '',
        read_time:     post?.read_time    || '5 min',
        featured:      post?.featured     || false,
        seo_indexed:   post?.seo_indexed  !== false,
        comments_open: post?.comments_open !== false,
        tags:          post?.tags         || [],
        scheduled_at:  post?.scheduled_at || '',
    });

    // Pre-fill author with logged-in user name for new posts
    const { user } = useCms();
    React.useEffect(() => {
        if (isNew && !form.author && user?.name) {
            setForm(f => ({ ...f, author: user.name }));
        }
    }, [user, isNew]);

    const [tagInput, setTagInput] = useState('');
    const contentRef = useRef(null);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const toggle = (k) => () => setForm(f => ({ ...f, [k]: !f[k] }));

    // SEO preview
    const slug = slugify(form.title || 'new-post');
    const seoUrl   = `doglicious.in/blog/${slug}`;
    const seoTitle = (form.title || 'New Post') + ' — Doglicious Blog';
    const seoDesc  = form.excerpt || 'Your excerpt will appear here as the meta description.';

    function addTag(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const val = tagInput.trim().toLowerCase();
        if (val && !form.tags.includes(val)) {
            setForm(f => ({ ...f, tags: [...f.tags, val] }));
        }
        setTagInput('');
    }
    function removeTag(i) {
        setForm(f => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }));
    }

    function insertFmt(before, after) {
        const ta = contentRef.current;
        if (!ta) return;
        const s = ta.selectionStart, e = ta.selectionEnd;
        const sel = ta.value.substring(s, e);
        const newVal = ta.value.substring(0, s) + before + sel + after + ta.value.substring(e);
        setForm(f => ({ ...f, content: newVal }));
        setTimeout(() => {
            ta.focus();
            ta.selectionStart = s + before.length;
            ta.selectionEnd   = s + before.length + sel.length;
        }, 0);
    }

    function handleSave(forcedStatus) {
        const payload = { ...form };
        if (forcedStatus) payload.status = forcedStatus;
        onSave(payload);
    }

    return (
        <div style={styles.panel}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerTitle}>
                    {isNew ? '✚ New Post' : '✏️ Edit Post'}
                </div>
                <button style={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <div className="cms-editor-body" style={styles.body}>
                {/* ── Main editor ── */}
                <div style={styles.main}>
                    <label style={styles.label}>Post Title</label>
                    <input
                        style={{ ...styles.input, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}
                        placeholder="e.g. Why Fresh Food Beats Kibble Every Time"
                        value={form.title}
                        onChange={set('title')}
                    />

                    <label style={styles.label}>Excerpt / Summary</label>
                    <textarea
                        style={{ ...styles.input, minHeight: 80, resize: 'vertical', fontSize: 13, fontWeight: 400, lineHeight: 1.7, marginBottom: 16 }}
                        placeholder="A short compelling description shown on the blog listing (150–160 chars)…"
                        value={form.excerpt}
                        onChange={set('excerpt')}
                    />

                    <label style={styles.label}>Article Content</label>
                    <div style={styles.toolbar}>
                        {[['**','**','B',true],['*','*','I',true],['## ','','H2'],['### ','','H3'],['- ','','List'],['[Link](',')',<span>🔗</span>],['> ','','Quote'],['`','`','Code']].map(([b,a,lbl,bold],i) => (
                            <button key={i} style={{ ...styles.toolBtn, fontWeight: bold ? 700 : 500 }} onClick={() => insertFmt(b,a)}>
                                {lbl}
                            </button>
                        ))}
                    </div>
                    <textarea
                        ref={contentRef}
                        style={{ ...styles.input, minHeight: 260, resize: 'vertical', fontSize: 14, lineHeight: 1.75, fontWeight: 400 }}
                        placeholder="Write your full article here. Use Markdown — ## Heading, **bold**, - bullet lists…"
                        value={form.content}
                        onChange={set('content')}
                    />
                </div>

                {/* ── Sidebar ── */}
                <div className="cms-editor-sidebar" style={styles.sidebar}>
                    <label style={styles.label}>Category</label>
                    <select style={{ ...styles.input, marginBottom: 16, cursor: 'pointer' }} value={form.category} onChange={set('category')}>
                        <option value="">— Select Category —</option>
                        {categories.map(c => <option key={c}>{c}</option>)}
                    </select>

                    <label style={styles.label}>Status</label>
                    <select style={{ ...styles.input, marginBottom: 16, cursor: 'pointer' }} value={form.status} onChange={set('status')}>
                        <option value="published">✅ Published</option>
                        <option value="draft">✏️ Draft</option>
                        <option value="scheduled">📅 Scheduled</option>
                    </select>

                    {form.status === 'scheduled' && (
                        <>
                            <label style={styles.label}>Scheduled Date</label>
                            <input
                                style={{ ...styles.input, marginBottom: 16 }}
                                type="datetime-local"
                                value={form.scheduled_at ? form.scheduled_at.slice(0,16) : ''}
                                onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                            />
                        </>
                    )}

                    <label style={styles.label}>Tags (press Enter to add)</label>
                    <div style={styles.tagWrap}>
                        {form.tags.map((t, i) => (
                            <span key={i} style={styles.tag}>
                                {t}
                                <span style={styles.tagRemove} onClick={() => removeTag(i)}>×</span>
                            </span>
                        ))}
                        <input
                            style={styles.tagInput}
                            placeholder="Add tag…"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                        />
                    </div>

                    <label style={styles.label}>Emoji / Cover Icon</label>
                    <input
                        style={{ ...styles.input, fontSize: 28, textAlign: 'center', letterSpacing: 4, marginBottom: 16 }}
                        placeholder="🥩 🦴 💩 🔬 ❤️"
                        maxLength={4}
                        value={form.emoji}
                        onChange={set('emoji')}
                    />

                    <label style={styles.label}>Author</label>
                    <input style={{ ...styles.input, marginBottom: 16 }} placeholder="e.g. Dr. Priya Sharma, BVSc" value={form.author} onChange={set('author')} />

                    <label style={styles.label}>Read Time</label>
                    <input style={{ ...styles.input, marginBottom: 16 }} placeholder="e.g. 4 min" value={form.read_time} onChange={set('read_time')} />

                    {/* Toggles */}
                    {[
                        {
                            key: 'featured',
                            label: 'Featured Post',
                            sub: form.featured
                                ? '⭐ Shown prominently on homepage — only one post can be featured'
                                : 'Set as the featured post on the homepage (replaces current)',
                        },
                        { key: 'seo_indexed',   label: 'SEO Indexed',   sub: 'Allow search engines to index this post' },
                        { key: 'comments_open', label: 'Comments Open', sub: 'Allow readers to submit comments' },
                    ].map(({ key, label, sub }) => (
                        <div key={key} style={styles.toggleRow}>
                            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                                <div style={{
                                    ...styles.toggleLabel,
                                    color: key === 'featured' && form.featured ? '#b45309' : '#221C15',
                                }}>
                                    {key === 'featured' && form.featured ? '⭐ ' : ''}{label}
                                </div>
                                <div style={styles.toggleSub}>{sub}</div>
                            </div>
                            <div
                                style={{
                                    ...styles.toggle,
                                    background: form[key]
                                        ? (key === 'featured' ? '#f59e0b' : '#7C5230')
                                        : 'rgba(124,82,48,0.20)',
                                }}
                                onClick={toggle(key)}
                            >
                                <div style={{ ...styles.toggleKnob, transform: form[key] ? 'translateX(17px)' : 'none' }} />
                            </div>
                        </div>
                    ))}

                    {/* SEO Preview */}
                    <label style={{ ...styles.label, marginTop: 16 }}>SEO Preview</label>
                    <div style={styles.seoPreview}>
                        <div style={styles.seoUrl}>{seoUrl}</div>
                        <div style={styles.seoTitle}>{seoTitle}</div>
                        <div style={styles.seoDesc}>{seoDesc}</div>
                    </div>

                    {/* Publish buttons */}
                    <div style={styles.pubRow}>
                        <button
                            style={{ ...styles.pubBtn, opacity: saving ? 0.7 : 1 }}
                            onClick={() => handleSave('published')}
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : '🚀 Publish'}
                        </button>
                        <button
                            style={{ ...styles.draftBtn, opacity: saving ? 0.7 : 1 }}
                            onClick={() => handleSave('draft')}
                            disabled={saving}
                        >
                            Save Draft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    panel: {
        background: '#FEFDF9',
        border: '1px solid rgba(124,82,48,0.12)',
        borderRadius: 22,
        marginBottom: 28,
        overflow: 'hidden',
        fontFamily: "'Poppins', sans-serif",
    },
    header: {
        padding: '18px 24px',
        borderBottom: '1px solid rgba(124,82,48,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#1a1208',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: '#FEFDF9',
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.10)',
        border: 'none',
        color: 'rgba(255,255,255,0.60)',
        fontSize: 16,
        width: 30,
        height: 30,
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
    },
    main: {
        padding: 24,
        borderRight: '1px solid rgba(124,82,48,0.12)',
    },
    sidebar: {
        padding: 24,
    },
    label: {
        display: 'block',
        fontSize: 11.5,
        fontWeight: 700,
        color: '#6b5a4a',
        marginBottom: 6,
        letterSpacing: '0.02em',
    },
    input: {
        width: '100%',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        border: '1.5px solid rgba(124,82,48,0.18)',
        borderRadius: 14,
        padding: '11px 14px',
        background: '#f5f0e8',
        color: '#221C15',
        outline: 'none',
        boxSizing: 'border-box',
    },
    toolbar: {
        display: 'flex',
        gap: 6,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    toolBtn: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: 12,
        padding: '6px 11px',
        borderRadius: 8,
        border: '1px solid rgba(124,82,48,0.18)',
        background: '#f5f0e8',
        color: '#6b5a4a',
        cursor: 'pointer',
    },
    tagWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        padding: '10px 12px',
        border: '1.5px solid rgba(124,82,48,0.18)',
        borderRadius: 14,
        background: '#f5f0e8',
        marginBottom: 16,
        minHeight: 44,
        alignItems: 'center',
    },
    tag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: '#f0e6da',
        color: '#5a3b21',
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
    },
    tagRemove: {
        cursor: 'pointer',
        opacity: 0.6,
        fontSize: 13,
        lineHeight: 1,
    },
    tagInput: {
        border: 'none',
        background: 'none',
        outline: 'none',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 12,
        minWidth: 80,
        color: '#221C15',
    },
    toggleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid rgba(124,82,48,0.10)',
    },
    toggleLabel: {
        fontSize: 12.5,
        fontWeight: 600,
        color: '#221C15',
    },
    toggleSub: {
        fontSize: 11,
        color: '#a8947e',
        marginTop: 1,
    },
    toggle: {
        width: 38,
        height: 21,
        borderRadius: 999,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.18s',
        flexShrink: 0,
    },
    toggleKnob: {
        position: 'absolute',
        top: 3,
        left: 3,
        width: 15,
        height: 15,
        background: '#fff',
        borderRadius: '50%',
        transition: 'transform 0.18s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    seoPreview: {
        background: '#f5f0e8',
        border: '1px solid rgba(124,82,48,0.12)',
        borderRadius: 14,
        padding: 14,
        marginTop: 0,
        marginBottom: 16,
    },
    seoUrl:   { fontSize: 11, color: '#22c55e', marginBottom: 3 },
    seoTitle: { fontSize: 14, fontWeight: 700, color: '#1a0dab', marginBottom: 3 },
    seoDesc:  { fontSize: 12, color: '#6b5a4a', lineHeight: 1.5 },
    pubRow: {
        display: 'flex',
        gap: 8,
        marginTop: 20,
    },
    pubBtn: {
        flex: 1,
        background: '#7C5230',
        color: '#fff',
        border: 'none',
        borderRadius: 14,
        padding: '11px 22px',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
    },
    draftBtn: {
        background: 'none',
        border: '1.5px solid rgba(124,82,48,0.25)',
        color: '#6b5a4a',
        borderRadius: 14,
        padding: '11px 18px',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
    },
};
