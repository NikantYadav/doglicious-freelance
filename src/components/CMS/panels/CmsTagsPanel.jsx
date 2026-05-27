import React, { useState, useEffect, useCallback } from 'react';
import { useCms } from '../CmsContext';

export default function CmsTagsPanel({ showToast }) {
    const { authFetch } = useCms();
    const [tags,    setTags]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await authFetch('/api/cms/tags');
            setTags(d.tags || []);
        } catch (e) { showToast('❌', e.message); }
        finally { setLoading(false); }
    }, [authFetch]);

    useEffect(() => { load(); }, [load]);

    async function handleDelete(tag) {
        if (!window.confirm(`Remove tag "${tag.name}" from all posts?`)) return;
        try {
            await authFetch(`/api/cms/tags/${encodeURIComponent(tag.name)}`, { method: 'DELETE' });
            showToast('🗑️', `Tag "${tag.name}" removed from ${tag.total} post(s)`);
            await load();
        } catch (e) { showToast('❌', e.message); }
    }

    const visible = tags.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.title}>🔖 Tags</div>
                <div style={s.sub}>Tags are automatically derived from your blog posts. Delete a tag to remove it from all posts.</div>
            </div>

            <div style={s.searchRow}>
                <input
                    style={s.search}
                    placeholder="🔍  Filter tags…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span style={s.countLabel}>{visible.length} tag{visible.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? <div style={s.empty}>Loading…</div> : (
                <div style={s.cloud}>
                    {visible.length === 0 && <div style={s.empty}>No tags found.</div>}
                    {visible.map(tag => (
                        <div key={tag.name} style={s.tagChip}>
                            <span style={s.tagName}>{tag.name}</span>
                            <span style={s.tagCount}>{tag.total}</span>
                            <button style={s.tagDel} onClick={() => handleDelete(tag)} title="Remove tag">×</button>
                        </div>
                    ))}
                </div>
            )}

            {!loading && tags.length > 0 && (
                <div style={s.hint}>
                    💡 Tags are added when you create or edit a post. The count shows how many posts use each tag.
                </div>
            )}
        </div>
    );
}

const s = {
    wrap: { fontFamily: "'Poppins', sans-serif" },
    header: { marginBottom: 20 },
    title: { fontSize: 18, fontWeight: 800, color: '#221C15', marginBottom: 4 },
    sub: { fontSize: 13, color: '#a8947e', lineHeight: 1.5 },
    searchRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    search: { flex: 1, fontFamily: "'Poppins', sans-serif", fontSize: 13, border: '1.5px solid rgba(124,82,48,0.18)', borderRadius: 10, padding: '9px 14px', background: '#f5f0e8', color: '#221C15', outline: 'none' },
    countLabel: { fontSize: 12, color: '#a8947e', whiteSpace: 'nowrap' },
    cloud: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    tagChip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0e6da', border: '1px solid rgba(124,82,48,0.18)', borderRadius: 999, padding: '5px 10px 5px 12px' },
    tagName: { fontSize: 12, fontWeight: 600, color: '#5a3b21' },
    tagCount: { fontSize: 10, fontWeight: 700, background: 'rgba(124,82,48,0.15)', color: '#7C5230', padding: '1px 6px', borderRadius: 999 },
    tagDel: { background: 'none', border: 'none', cursor: 'pointer', color: '#a8947e', fontSize: 14, lineHeight: 1, padding: '0 2px', fontWeight: 700 },
    empty: { textAlign: 'center', padding: 32, color: '#a8947e', fontSize: 13 },
    hint: { marginTop: 24, fontSize: 12, color: '#a8947e', background: '#faf5ef', borderRadius: 10, padding: '12px 16px', lineHeight: 1.6 },
};
