import React from 'react';

// Category styles — derived dynamically from the post's category string.
// Falls back to a neutral style for any category not in the map (e.g. custom ones added via CMS).
function getCatStyle(category) {
    const map = {
        'Nutrition':   { background: 'rgba(124,82,48,.12)',  color: '#5a3b21' },
        'Gut Health':  { background: 'rgba(20,184,166,.12)', color: '#0f766e' },
        'AI Health':   { background: 'rgba(99,102,241,.12)', color: '#4338ca' },
        'Dog Care':    { background: 'rgba(236,72,153,.12)', color: '#be185d' },
        'Science':     { background: 'rgba(245,158,11,.12)', color: '#b45309' },
        'Breed Guide': { background: 'rgba(34,197,94,.12)',  color: '#15803d' },
        'Vet Advice':  { background: 'rgba(239,68,68,.12)',  color: '#b91c1c' },
        'Behavior':    { background: 'rgba(168,85,247,.12)', color: '#7e22ce' },
    };
    return map[category] || { background: 'rgba(124,82,48,.08)', color: '#6b5a4a' };
}

// Thumb background — derived from category, fallback for unknowns
function getThumbBg(category) {
    const map = {
        'Nutrition':   '#f0e6da',
        'Gut Health':  '#d1fae5',
        'AI Health':   '#e0e7ff',
        'Dog Care':    '#fce7f3',
        'Science':     '#d1fae5',
        'Breed Guide': '#dcfce7',
        'Vet Advice':  '#fee2e2',
        'Behavior':    '#ede9fe',
    };
    return map[category] || '#f5f0e8';
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtViews(v) {
    if (v == null || v === 0) return '0';
    return v > 999 ? (v / 1000).toFixed(1) + 'k' : String(v);
}

const STATUS_STYLE = {
    published: { bg: 'rgba(34,197,94,.10)',  color: '#16a34a', dot: '#22c55e' },
    draft:     { bg: 'rgba(234,179,8,.10)',  color: '#a16207', dot: '#eab308' },
    scheduled: { bg: 'rgba(99,102,241,.10)', color: '#4338ca', dot: '#6366f1' },
};

function PostRow({ p, maxViews, onEdit, onDelete, onToggleFeatured }) {
    const ss       = STATUS_STYLE[p.status] || { bg: '#eee', color: '#666', dot: '#999' };
    const vp       = Math.round((p.views || 0) / maxViews * 100);
    const catStyle = getCatStyle(p.category);
    const thumbBg  = getThumbBg(p.category);

    return (
        <tr style={s.tr} onClick={() => onEdit(p)}>
            <td style={s.td}>
                <div style={s.postInfo}>
                    <div style={{ ...s.thumb, background: thumbBg }}>{p.emoji || '🐾'}</div>
                    <div style={{ minWidth: 0 }}>
                        <div style={s.postTitle}>
                            {p.featured && <span style={s.featuredStar}>⭐ </span>}
                            {p.title}
                        </div>
                        <div style={s.postMeta}>{p.author} · {p.read_time} read</div>
                    </div>
                </div>
            </td>
            <td style={s.td}>
                <span style={{ ...s.catBadge, ...catStyle }}>{p.category}</span>
            </td>
            <td style={s.td}>
                <span style={{ ...s.statusPill, background: ss.bg, color: ss.color }}>
                    <span style={{ ...s.statusDot, background: ss.dot }} />
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
            </td>
            <td style={s.td}>
                <div style={s.viewsWrap}>
                    <div style={s.viewsBar}>
                        <div style={{ ...s.viewsFill, width: `${vp}%` }} />
                    </div>
                    <div style={s.viewsNum}>{fmtViews(p.views)}</div>
                </div>
            </td>
            <td style={s.td}>
                <div style={s.postMeta}>{fmtDate(p.published_at || p.created_at)}</div>
            </td>
            <td style={s.td} onClick={e => e.stopPropagation()}>
                <div style={s.actionRow}>
                    <button style={s.actionBtn} onClick={() => onEdit(p)}>Edit</button>
                    <button
                        style={{
                            ...s.actionBtn,
                            ...(p.featured ? s.actionFeatured : s.actionFeatureBtn),
                        }}
                        onClick={() => onToggleFeatured(p)}
                        title={p.featured ? 'Remove from featured (homepage)' : 'Set as featured post on homepage'}
                    >
                        {p.featured ? '⭐ Featured' : 'Feature'}
                    </button>
                    <button
                        style={{ ...s.actionBtn, ...s.actionDel }}
                        onClick={() => onDelete(p)}
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}

function MobileCard({ p, onEdit, onDelete, onToggleFeatured }) {
    const ss       = STATUS_STYLE[p.status] || { bg: '#eee', color: '#666', dot: '#999' };
    const catStyle = getCatStyle(p.category);
    const thumbBg  = getThumbBg(p.category);

    return (
        <div style={s.mobileCard} onClick={() => onEdit(p)}>
            <div style={s.mobileCardTop}>
                <div style={{ ...s.thumb, background: thumbBg, width: 44, height: 36, fontSize: 18 }}>
                    {p.emoji || '🐾'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...s.postTitle, fontSize: 13 }}>
                        {p.featured && <span style={s.featuredStar}>⭐ </span>}
                        {p.title}
                    </div>
                    <div style={s.postMeta}>{p.author} · {p.read_time} read</div>
                </div>
            </div>
            <div style={s.mobileCardMeta}>
                <span style={{ ...s.catBadge, ...catStyle }}>{p.category}</span>
                <span style={{ ...s.statusPill, background: ss.bg, color: ss.color }}>
                    <span style={{ ...s.statusDot, background: ss.dot }} />
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
                <span style={s.postMeta}>{fmtDate(p.published_at || p.created_at)}</span>
            </div>
            <div style={{ ...s.actionRow, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                <button style={s.actionBtn} onClick={() => onEdit(p)}>Edit</button>
                <button
                    style={{ ...s.actionBtn, ...(p.featured ? s.actionFeatured : s.actionFeatureBtn) }}
                    onClick={() => onToggleFeatured(p)}
                >
                    {p.featured ? '⭐ Featured' : 'Feature'}
                </button>
                <button style={{ ...s.actionBtn, ...s.actionDel }} onClick={() => onDelete(p)}>Delete</button>
            </div>
        </div>
    );
}

export default function CmsPostsTable({ posts, onEdit, onDelete, onToggleFeatured, statusFilter, onStatusFilter }) {
    const maxViews = Math.max(...posts.map(p => p.views || 0), 1);

    return (
        <div style={s.wrap}>
            {/* Header row */}
            <div style={s.secHeader}>
                <div style={s.secTitle}>
                    {statusFilter === 'all' ? 'All Posts' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    {' '}
                    <span style={{ color: '#a8947e', fontWeight: 400 }}>
                        ({posts.length} post{posts.length !== 1 ? 's' : ''})
                    </span>
                </div>
                <div style={s.tabGroup}>
                    {['all', 'published', 'draft', 'scheduled'].map(st => (
                        <button
                            key={st}
                            style={{ ...s.tab, ...(statusFilter === st ? s.tabActive : {}) }}
                            onClick={() => onStatusFilter(st)}
                        >
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop table */}
            <div className="cms-table-desktop cms-table-scroll" style={s.tableWrap}>
                <table style={s.table}>
                    <thead>
                        <tr>
                            {['Post', 'Category', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                                <th key={h} style={s.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#a8947e', fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
                                    No posts found.
                                </td>
                            </tr>
                        ) : posts.map(p => (
                            <PostRow
                                key={p.id}
                                p={p}
                                maxViews={maxViews}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleFeatured={onToggleFeatured}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="cms-post-cards">
                {posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#a8947e', fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
                        No posts found.
                    </div>
                ) : posts.map(p => (
                    <MobileCard
                        key={p.id}
                        p={p}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleFeatured={onToggleFeatured}
                    />
                ))}
            </div>
        </div>
    );
}

const s = {
    wrap: { marginBottom: 28 },
    secHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, fontFamily: "'Poppins', sans-serif", flexWrap: 'wrap', gap: 10,
    },
    secTitle: { fontSize: 15, fontWeight: 700, color: '#221C15', letterSpacing: '-0.01em' },
    tabGroup: {
        display: 'flex', gap: 4,
        background: '#f5f0e8', border: '1px solid rgba(124,82,48,0.12)',
        borderRadius: 14, padding: 3,
    },
    tab: {
        fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600,
        padding: '6px 14px', borderRadius: 10, border: 'none',
        cursor: 'pointer', color: '#a8947e', background: 'none',
    },
    tabActive: { background: '#FEFDF9', color: '#7C5230', boxShadow: '0 2px 10px rgba(34,28,21,0.06)' },
    tableWrap: {
        background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)',
        borderRadius: 22, overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        padding: '12px 20px', textAlign: 'left', fontSize: 10.5, fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a8947e',
        background: '#f5f0e8', borderBottom: '1px solid rgba(124,82,48,0.12)',
        fontFamily: "'Poppins', sans-serif",
    },
    tr: { borderBottom: '1px solid rgba(124,82,48,0.08)', cursor: 'pointer', transition: 'background 0.12s' },
    td: { padding: '14px 20px', verticalAlign: 'middle', fontFamily: "'Poppins', sans-serif" },
    postInfo: { display: 'flex', alignItems: 'center', gap: 12 },
    thumb: {
        width: 52, height: 40, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
    },
    featuredStar: { color: '#f59e0b' },
    postTitle: { fontSize: 13.5, fontWeight: 700, color: '#221C15', lineHeight: 1.3, marginBottom: 3 },
    postMeta:  { fontSize: 11, color: '#a8947e' },
    catBadge: {
        display: 'inline-block', fontSize: 10, fontWeight: 700,
        padding: '3px 10px', borderRadius: 999,
        letterSpacing: '0.04em', textTransform: 'uppercase',
    },
    statusPill: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 999,
    },
    statusDot: { width: 5, height: 5, borderRadius: '50%', flexShrink: 0 },
    viewsWrap: { display: 'flex', alignItems: 'center', gap: 8 },
    viewsBar:  { height: 5, background: 'rgba(124,82,48,0.12)', borderRadius: 999, flex: 1, maxWidth: 80, overflow: 'hidden' },
    viewsFill: { height: '100%', borderRadius: 999, background: '#7C5230', opacity: 0.6 },
    viewsNum:  { fontSize: 12, fontWeight: 600, color: '#6b5a4a', minWidth: 36 },
    actionRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    actionBtn: {
        fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 600,
        padding: '5px 11px', borderRadius: 8,
        border: '1px solid rgba(124,82,48,0.18)',
        background: 'none', cursor: 'pointer', color: '#6b5a4a',
        whiteSpace: 'nowrap',
    },
    // Featured state — gold tint
    actionFeatured: {
        background: 'rgba(245,158,11,0.10)',
        borderColor: 'rgba(245,158,11,0.40)',
        color: '#b45309',
        fontWeight: 700,
    },
    // Not featured — subtle prompt
    actionFeatureBtn: {
        borderColor: 'rgba(124,82,48,0.18)',
        color: '#a8947e',
    },
    actionDel: {
        borderColor: 'rgba(239,68,68,0.25)',
        color: '#b91c1c',
    },
    mobileCard: {
        background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)',
        borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
    },
    mobileCardTop: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    mobileCardMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
};
