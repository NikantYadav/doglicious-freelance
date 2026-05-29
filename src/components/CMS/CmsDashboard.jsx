import React, { useState, useEffect, useCallback } from 'react';
import { useCms } from './CmsContext';
import CmsSidebar from './CmsSidebar';
import CmsPostEditor from './CmsPostEditor';
import CmsPostsTable from './CmsPostsTable';
import CmsCategoriesPanel from './panels/CmsCategoriesPanel';
import CmsTagsPanel       from './panels/CmsTagsPanel';
import CmsCommentsPanel   from './panels/CmsCommentsPanel';
import CmsAnalyticsPanel  from './panels/CmsAnalyticsPanel';

// ── Toast ─────────────────────────────────────────────────────────────
function Toast({ msg, icon, visible }) {
    return (
        <div style={{
            position: 'fixed', bottom: 20, left: '50%',
            transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 12px)',
            background: '#1a1208', color: '#fff',
            fontSize: 13, fontWeight: 600,
            padding: '13px 20px', borderRadius: 14,
            boxShadow: '0 20px 60px rgba(34,28,21,0.30)',
            display: 'flex', alignItems: 'center', gap: 10,
            opacity: visible ? 1 : 0,
            transition: 'all 0.3s',
            pointerEvents: 'none',
            zIndex: 2000,
            fontFamily: "'Poppins', sans-serif",
            whiteSpace: 'nowrap',
        }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span>{msg}</span>
        </div>
    );
}

// ── Posts panel (All Posts / Drafts / Scheduled) ──────────────────────
function PostsPanel({ authFetch, navKey, showToast }) {
    const [posts,        setPosts]        = useState([]);
    const [stats,        setStats]        = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [statusFilter, setStatusFilter] = useState(
        navKey === 'drafts' ? 'draft' : navKey === 'scheduled' ? 'scheduled' : 'all'
    );
    const [search,      setSearch]      = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const [saving,      setSaving]      = useState(false);

    useEffect(() => {
        setStatusFilter(navKey === 'drafts' ? 'draft' : navKey === 'scheduled' ? 'scheduled' : 'all');
    }, [navKey]);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const [postsData, statsData] = await Promise.all([
                authFetch('/api/cms/posts'),
                authFetch('/api/cms/stats'),
            ]);
            setPosts(postsData.posts || []);
            setStats(statsData.stats || null);
        } catch (err) { showToast('❌', err.message); }
        finally { setLoading(false); }
    }, [authFetch]);

    useEffect(() => { loadPosts(); }, [loadPosts]);

    const filtered = posts.filter(p => {
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q || (
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q))
        );
        return matchStatus && matchSearch;
    });

    async function handleSave(formData) {
        setSaving(true);
        try {
            if (editingPost?.id) {
                await authFetch(`/api/cms/posts/${editingPost.id}`, { method: 'PUT', body: JSON.stringify(formData) });
                showToast(formData.status === 'draft' ? '✏️' : '🚀',
                    formData.status === 'draft' ? 'Saved as Draft' : 'Post Updated');
            } else {
                await authFetch('/api/cms/posts', { method: 'POST', body: JSON.stringify(formData) });
                showToast(formData.status === 'draft' ? '✏️' : '🚀',
                    formData.status === 'draft' ? 'Saved as Draft' : 'Post Published 🚀');
            }
            setEditingPost(null);
            await loadPosts();
        } catch (err) { showToast('❌', err.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(post) {
        if (!window.confirm(`Delete "${post.title}"?`)) return;
        try {
            await authFetch(`/api/cms/posts/${post.id}`, { method: 'DELETE' });
            showToast('🗑️', 'Post deleted');
            await loadPosts();
        } catch (err) { showToast('❌', err.message); }
    }

    async function handleToggleFeatured(post) {
        try {
            const data = await authFetch(`/api/cms/posts/${post.id}/feature`, { method: 'POST' });
            showToast('⭐', data.featured ? 'Post featured!' : 'Feature removed');
            await loadPosts();
        } catch (err) { showToast('❌', err.message); }
    }

    function exportCSV() {
        const rows = [['ID','Title','Category','Status','Views','Date','Author']];
        posts.forEach(p => rows.push([
            p.id, `"${p.title}"`, p.category, p.status,
            p.views, p.created_at?.slice(0,10), p.author,
        ]));
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        a.download = 'doglicious-blog-posts.csv';
        a.click();
        showToast('📊', 'CSV exported!');
    }

    // Build stat cards entirely from API response — nothing hardcoded
    const statCards = stats ? [
        { label: '📄 Total Posts',   value: stats.total },
        { label: '👁️ Total Views',   value: stats.totalViews > 999 ? (stats.totalViews / 1000).toFixed(1) + 'k' : stats.totalViews },
        { label: '✅ Published',     value: stats.published },
        { label: '✏️ Drafts',        value: stats.drafts },
        { label: '📅 Scheduled',     value: stats.scheduled },
        { label: '⏱ Avg Read Time',  value: stats.avgReadTime ? `${stats.avgReadTime}m` : '—' },
    ] : [];

    const panelTitle = navKey === 'drafts' ? 'Drafts' : navKey === 'scheduled' ? 'Scheduled' : 'All Posts';

    return (
        <>
            {/* Stats — all from API */}
            {loading ? (
                <div className="cms-stats-grid" style={s.statsGrid}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} style={{ ...s.statCard, ...s.statSkeleton }} />
                    ))}
                </div>
            ) : (
                <div className="cms-stats-grid" style={{ ...s.statsGrid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {statCards.map(({ label, value }) => (
                        <div key={label} style={s.statCard}>
                            <div style={s.statLabel}>{label}</div>
                            <div style={s.statValue}>{value ?? 0}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Topbar actions */}
            <div style={s.postsTopbar}>
                <div style={s.postsTitle}>{panelTitle}</div>
                <div style={s.postsActions}>
                    <div style={s.searchBar}>
                        🔍
                        <input
                            style={s.searchInput}
                            placeholder="Search posts…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button style={s.btnGhost} onClick={exportCSV} title="Export CSV">
                        <span>⬇</span><span className="cms-btn-label"> Export</span>
                    </button>
                    <button style={s.btnPrimary} onClick={() => setEditingPost({})}>
                        <span>✚</span><span className="cms-btn-label"> New Post</span>
                    </button>
                </div>
            </div>

            {/* Editor */}
            {editingPost !== null && (
                <CmsPostEditor
                    post={editingPost?.id ? editingPost : null}
                    onSave={handleSave}
                    onClose={() => setEditingPost(null)}
                    saving={saving}
                />
            )}

            {/* New post prompt */}
            {editingPost === null && (
                <div style={s.newPostPrompt} onClick={() => setEditingPost({})}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>✍️</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Create a New Blog Post</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Tap to open the editor</div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#a8947e', fontFamily: "'Poppins', sans-serif" }}>
                    Loading posts…
                </div>
            ) : (
                <CmsPostsTable
                    posts={filtered}
                    onEdit={setEditingPost}
                    onDelete={handleDelete}
                    onToggleFeatured={handleToggleFeatured}
                    statusFilter={statusFilter}
                    onStatusFilter={setStatusFilter}
                />
            )}
        </>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function CmsDashboard() {
    const { authFetch } = useCms();
    const [activeNav,   setActiveNav]   = useState('posts');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast,       setToast]       = useState({ visible: false, msg: '', icon: '✅' });
    const [counts,      setCounts]      = useState({});

    function showToast(icon, msg) {
        setToast({ visible: true, icon, msg });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }

    // Load sidebar counts from API — no hardcoded values
    const loadCounts = useCallback(async () => {
        try {
            const [statsData, tagsData, catsData, commentsData] = await Promise.all([
                authFetch('/api/cms/stats'),
                authFetch('/api/cms/tags'),
                authFetch('/api/cms/categories'),
                authFetch('/api/cms/comments?status=pending'),
            ]);
            const st = statsData.stats || {};
            setCounts({
                posts:      st.total      ?? 0,
                drafts:     st.drafts     ?? 0,
                scheduled:  st.scheduled  || undefined,
                tags:       tagsData.tags?.length       || undefined,
                categories: catsData.categories?.length || undefined,
                comments:   commentsData.comments?.length || undefined,
            });
        } catch { /* non-fatal */ }
    }, [authFetch]);

    useEffect(() => { loadCounts(); }, [loadCounts]);

    const PAGE_TITLES = {
        posts:      'All Posts',
        drafts:     'Drafts',
        scheduled:  'Scheduled',
        categories: 'Categories',
        tags:       'Tags',
        analytics:  'Analytics',
        comments:   'Comments',
    };

    function renderPanel() {
        switch (activeNav) {
            case 'posts':
            case 'drafts':
            case 'scheduled':
                return <PostsPanel authFetch={authFetch} navKey={activeNav} showToast={showToast} />;
            case 'categories':
                return <CmsCategoriesPanel showToast={showToast} />;
            case 'tags':
                return <CmsTagsPanel showToast={showToast} />;
            case 'analytics':
                return <CmsAnalyticsPanel showToast={showToast} />;
            case 'comments':
                return <CmsCommentsPanel showToast={showToast} />;
            default:
                return <PostsPanel authFetch={authFetch} navKey="posts" showToast={showToast} />;
        }
    }

    return (
        <div style={s.shell}>
            {sidebarOpen && (
                <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            <div className={`cms-sidebar-wrap${sidebarOpen ? ' open' : ''}`}>
                <CmsSidebar
                    active={activeNav}
                    onNav={key => { setActiveNav(key); setSidebarOpen(false); }}
                    counts={counts}
                />
            </div>

            <div className="cms-main" style={s.main}>
                <div className="cms-topbar" style={s.topbar}>
                    <div style={s.topbarLeft}>
                        <button
                            className="cms-hamburger"
                            style={s.hamburger}
                            onClick={() => setSidebarOpen(o => !o)}
                            aria-label="Toggle menu"
                        >
                            ☰
                        </button>
                        <div>
                            <div style={s.pageTitle}>{PAGE_TITLES[activeNav] || 'CMS'}</div>
                            <div style={s.breadcrumb}>Doglicious Blog CMS</div>
                        </div>
                    </div>
                </div>

                <div className="cms-content" style={s.content}>
                    {renderPanel()}
                </div>
            </div>

            <Toast {...toast} />
        </div>
    );
}

const s = {
    shell: {
        display: 'flex', minHeight: '100vh',
        fontFamily: "'Poppins', sans-serif",
        background: '#f5f0e8', position: 'relative',
    },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99 },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' },
    topbar: {
        background: '#FEFDF9', borderBottom: '1px solid rgba(124,82,48,0.12)',
        padding: '0 20px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, gap: 8,
    },
    topbarLeft: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
    hamburger: {
        background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
        color: '#6b5a4a', padding: '4px 6px', borderRadius: 8, flexShrink: 0,
    },
    pageTitle: { fontSize: 16, fontWeight: 800, color: '#221C15', letterSpacing: '-0.02em', whiteSpace: 'nowrap' },
    breadcrumb: { fontSize: 11, color: '#a8947e', whiteSpace: 'nowrap' },
    content: { flex: 1, padding: '20px 16px', overflowY: 'auto' },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 },
    statCard: { background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)', borderRadius: 16, padding: '16px 18px' },
    statSkeleton: {
        background: 'linear-gradient(90deg, #ede8df 25%, #e4ddd3 50%, #ede8df 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        height: 80, border: 'none',
    },
    statLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a8947e', marginBottom: 6 },
    statValue: { fontSize: 24, fontWeight: 800, color: '#221C15', letterSpacing: '-0.03em' },

    postsTopbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 16, flexWrap: 'wrap',
    },
    postsTitle: { fontSize: 15, fontWeight: 700, color: '#221C15' },
    postsActions: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    searchBar: {
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#f5f0e8', border: '1.5px solid rgba(124,82,48,0.18)',
        borderRadius: 12, padding: '7px 12px', fontSize: 13, color: '#6b5a4a',
        minWidth: 0, maxWidth: 200,
    },
    searchInput: {
        border: 'none', background: 'none', outline: 'none',
        fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#221C15',
        width: '100%', minWidth: 0,
    },
    btnPrimary: {
        fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600,
        padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: '#7C5230', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap', flexShrink: 0,
    },
    btnGhost: {
        fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600,
        padding: '8px 12px', borderRadius: 12,
        border: '1.5px solid rgba(124,82,48,0.25)', cursor: 'pointer',
        background: 'none', color: '#6b5a4a',
        display: 'flex', alignItems: 'center', flexShrink: 0,
    },
    newPostPrompt: {
        textAlign: 'center', padding: '24px 16px',
        border: '2px dashed rgba(124,82,48,0.25)', borderRadius: 18,
        color: '#a8947e', cursor: 'pointer', marginBottom: 20,
        fontFamily: "'Poppins', sans-serif",
    },
};
