import React, { useState, useEffect, useCallback } from 'react';
import { useCms } from '../CmsContext';
import { slugifyBlogIdentifier } from '../../../utils/blogSlug';

const STATUS_STYLES = {
    pending:  { bg: 'rgba(234,179,8,0.10)',  color: '#a16207' },
    approved: { bg: 'rgba(34,197,94,0.10)',  color: '#16a34a' },
    spam:     { bg: 'rgba(239,68,68,0.10)',  color: '#b91c1c' },
};

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CmsCommentsPanel({ showToast }) {
    const { authFetch } = useCms();
    const [comments,    setComments]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await authFetch(`/api/cms/comments?status=${statusFilter}`);
            setComments(d.comments || []);
        } catch (e) { showToast('❌', e.message); }
        finally { setLoading(false); }
    }, [authFetch, statusFilter]);

    useEffect(() => { load(); }, [load]);

    async function setStatus(comment, status) {
        try {
            await authFetch(`/api/cms/comments/${comment.id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            showToast('✅', `Comment marked as ${status}`);
            await load();
        } catch (e) { showToast('❌', e.message); }
    }

    async function handleDelete(comment) {
        if (!window.confirm('Delete this comment permanently?')) return;
        try {
            await authFetch(`/api/cms/comments/${comment.id}`, { method: 'DELETE' });
            showToast('🗑️', 'Comment deleted');
            await load();
        } catch (e) { showToast('❌', e.message); }
    }

    const counts = { all: comments.length };

    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.title}>💬 Comments</div>
                <div style={s.sub}>Review and moderate reader comments on your blog posts.</div>
            </div>

            {/* Filter tabs */}
            <div style={s.tabRow}>
                {['all', 'pending', 'approved', 'spam'].map(st => (
                    <button
                        key={st}
                        style={{ ...s.tab, ...(statusFilter === st ? s.tabActive : {}) }}
                        onClick={() => setStatusFilter(st)}
                    >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div style={s.empty}>Loading…</div> : comments.length === 0 ? (
                <div style={s.emptyState}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>No comments yet</div>
                    <div style={{ fontSize: 12, color: '#a8947e' }}>Comments submitted on your blog posts will appear here.</div>
                </div>
            ) : (
                <div style={s.list}>
                    {comments.map(c => (
                        <div key={c.id} style={s.card}>
                            <div style={s.cardTop}>
                                <div style={s.authorRow}>
                                    <div style={s.avatar}>{(c.author || 'A')[0].toUpperCase()}</div>
                                    <div>
                                        <div style={s.authorName}>{c.author}</div>
                                        {c.email && <div style={s.authorEmail}>{c.email}</div>}
                                    </div>
                                </div>
                                <span style={{ ...s.statusPill, ...STATUS_STYLES[c.status] }}>
                                    {c.status}
                                </span>
                            </div>
                            <div style={s.body}>{c.body}</div>
                            {c.blog_posts && (
                                <div style={s.postRef}>
                                    On: <a href={`/blog/${c.blog_posts.slug || slugifyBlogIdentifier(c.blog_posts.title)}`} target="_blank" rel="noreferrer" style={s.postLink}>{c.blog_posts.title}</a>
                                </div>
                            )}
                            <div style={s.cardMeta}>{fmtDate(c.created_at)}</div>
                            <div style={s.actions}>
                                {c.status !== 'approved' && (
                                    <button style={{ ...s.btn, ...s.btnApprove }} onClick={() => setStatus(c, 'approved')}>✓ Approve</button>
                                )}
                                {c.status !== 'spam' && (
                                    <button style={{ ...s.btn, ...s.btnSpam }} onClick={() => setStatus(c, 'spam')}>⚑ Spam</button>
                                )}
                                {c.status !== 'pending' && (
                                    <button style={{ ...s.btn, ...s.btnPending }} onClick={() => setStatus(c, 'pending')}>↩ Pending</button>
                                )}
                                <button style={{ ...s.btn, ...s.btnDelete }} onClick={() => handleDelete(c)}>🗑 Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const s = {
    wrap: { fontFamily: "'Poppins', sans-serif" },
    header: { marginBottom: 20 },
    title: { fontSize: 18, fontWeight: 800, color: '#221C15', marginBottom: 4 },
    sub: { fontSize: 13, color: '#a8947e' },
    tabRow: { display: 'flex', gap: 4, background: '#f5f0e8', border: '1px solid rgba(124,82,48,0.12)', borderRadius: 12, padding: 3, marginBottom: 20, width: 'fit-content' },
    tab: { fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', color: '#a8947e', background: 'none' },
    tabActive: { background: '#FEFDF9', color: '#7C5230', boxShadow: '0 2px 8px rgba(34,28,21,0.06)' },
    list: { display: 'flex', flexDirection: 'column', gap: 12 },
    card: { background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)', borderRadius: 16, padding: 16 },
    cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 },
    authorRow: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: { width: 32, height: 32, borderRadius: '50%', background: '#7C5230', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
    authorName: { fontSize: 13, fontWeight: 700, color: '#221C15' },
    authorEmail: { fontSize: 11, color: '#a8947e' },
    statusPill: { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 },
    body: { fontSize: 13, color: '#221C15', lineHeight: 1.6, marginBottom: 8, padding: '10px 12px', background: '#f5f0e8', borderRadius: 10 },
    postRef: { fontSize: 11, color: '#a8947e', marginBottom: 6 },
    postLink: { color: '#7C5230', fontWeight: 600, textDecoration: 'none' },
    cardMeta: { fontSize: 11, color: '#a8947e', marginBottom: 10 },
    actions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    btn: { fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 8, border: '1px solid', cursor: 'pointer', background: 'none' },
    btnApprove: { borderColor: 'rgba(34,197,94,0.3)', color: '#16a34a' },
    btnSpam:    { borderColor: 'rgba(239,68,68,0.3)', color: '#b91c1c' },
    btnPending: { borderColor: 'rgba(234,179,8,0.3)', color: '#a16207' },
    btnDelete:  { borderColor: 'rgba(124,82,48,0.2)', color: '#6b5a4a' },
    empty: { textAlign: 'center', padding: 32, color: '#a8947e', fontSize: 13 },
    emptyState: { textAlign: 'center', padding: '48px 24px', color: '#6b5a4a', fontSize: 14 },
};
