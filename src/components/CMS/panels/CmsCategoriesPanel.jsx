import React, { useState, useEffect, useCallback } from 'react';
import { useCms } from '../CmsContext';

const PRESET_COLORS = [
    { color: '#5a3b21', bg: 'rgba(124,82,48,0.12)' },
    { color: '#0f766e', bg: 'rgba(20,184,166,0.12)' },
    { color: '#4338ca', bg: 'rgba(99,102,241,0.12)' },
    { color: '#be185d', bg: 'rgba(236,72,153,0.12)' },
    { color: '#b45309', bg: 'rgba(245,158,11,0.12)' },
    { color: '#15803d', bg: 'rgba(34,197,94,0.12)'  },
    { color: '#b91c1c', bg: 'rgba(239,68,68,0.12)'  },
    { color: '#7e22ce', bg: 'rgba(168,85,247,0.12)' },
];

const EMPTY = { name: '', description: '', emoji: '📝', color: '#5a3b21', bg_color: 'rgba(124,82,48,0.12)' };

export default function CmsCategoriesPanel({ showToast }) {
    const { authFetch } = useCms();
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [form,       setForm]       = useState(EMPTY);
    const [editingId,  setEditingId]  = useState(null);
    const [saving,     setSaving]     = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await authFetch('/api/cms/categories');
            setCategories(d.categories || []);
        } catch (e) { showToast('❌', e.message); }
        finally { setLoading(false); }
    }, [authFetch]);

    useEffect(() => { load(); }, [load]);

    function startEdit(cat) {
        setEditingId(cat.id);
        setForm({ name: cat.name, description: cat.description || '', emoji: cat.emoji, color: cat.color, bg_color: cat.bg_color });
    }
    function cancelEdit() { setEditingId(null); setForm(EMPTY); }

    async function handleSave() {
        if (!form.name.trim()) return showToast('⚠️', 'Name is required');
        setSaving(true);
        try {
            if (editingId) {
                await authFetch(`/api/cms/categories/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
                showToast('✅', 'Category updated');
            } else {
                await authFetch('/api/cms/categories', { method: 'POST', body: JSON.stringify(form) });
                showToast('✅', 'Category created');
            }
            cancelEdit();
            await load();
        } catch (e) { showToast('❌', e.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(cat) {
        if (!window.confirm(`Delete category "${cat.name}"? Posts in this category will not be deleted.`)) return;
        try {
            await authFetch(`/api/cms/categories/${cat.id}`, { method: 'DELETE' });
            showToast('🗑️', 'Category deleted');
            await load();
        } catch (e) { showToast('❌', e.message); }
    }

    const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.title}>🏷️ Categories</div>
                <div style={s.sub}>Manage blog post categories. Categories are used to organise and filter posts.</div>
            </div>

            {/* Form */}
            <div style={s.formCard}>
                <div style={s.formTitle}>{editingId ? 'Edit Category' : 'New Category'}</div>
                <div style={s.formGrid}>
                    <div>
                        <label style={s.label}>Name</label>
                        <input style={s.input} placeholder="e.g. Nutrition" value={form.name} onChange={set('name')} />
                    </div>
                    <div>
                        <label style={s.label}>Emoji</label>
                        <input style={{ ...s.input, fontSize: 22, textAlign: 'center' }} maxLength={4} placeholder="🥩" value={form.emoji} onChange={set('emoji')} />
                    </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Description</label>
                    <input style={s.input} placeholder="Short description…" value={form.description} onChange={set('description')} />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={s.label}>Colour</label>
                    <div style={s.colorRow}>
                        {PRESET_COLORS.map(({ color, bg }) => (
                            <div
                                key={color}
                                style={{ ...s.colorSwatch, background: bg, border: form.color === color ? `2px solid ${color}` : '2px solid transparent' }}
                                onClick={() => setForm(f => ({ ...f, color, bg_color: bg }))}
                            >
                                <span style={{ color, fontWeight: 700, fontSize: 11 }}>Aa</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={s.formActions}>
                    <button style={{ ...s.btn, ...s.btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : editingId ? 'Update' : 'Create Category'}
                    </button>
                    {editingId && <button style={{ ...s.btn, ...s.btnGhost }} onClick={cancelEdit}>Cancel</button>}
                </div>
            </div>

            {/* List */}
            {loading ? <div style={s.empty}>Loading…</div> : (
                <div style={s.list}>
                    {categories.length === 0 && <div style={s.empty}>No categories yet.</div>}
                    {categories.map(cat => (
                        <div key={cat.id} style={s.row}>
                            <div style={{ ...s.catBadge, background: cat.bg_color, color: cat.color }}>
                                {cat.emoji} {cat.name}
                            </div>
                            <div style={s.rowMeta}>
                                <span style={s.metaText}>{cat.description || '—'}</span>
                                <span style={s.countPill}>{cat.post_count} posts · {cat.published_post_count} published</span>
                            </div>
                            <div style={s.rowActions}>
                                <button style={{ ...s.btn, ...s.btnSm }} onClick={() => startEdit(cat)}>Edit</button>
                                <button style={{ ...s.btn, ...s.btnSm, ...s.btnDanger }} onClick={() => handleDelete(cat)}>Delete</button>
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
    header: { marginBottom: 24 },
    title: { fontSize: 18, fontWeight: 800, color: '#221C15', marginBottom: 4 },
    sub: { fontSize: 13, color: '#a8947e' },
    formCard: { background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)', borderRadius: 18, padding: 20, marginBottom: 24 },
    formTitle: { fontSize: 13, fontWeight: 700, color: '#6b5a4a', marginBottom: 16 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12, marginBottom: 14 },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5a4a', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' },
    input: { width: '100%', fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, border: '1.5px solid rgba(124,82,48,0.18)', borderRadius: 10, padding: '9px 12px', background: '#f5f0e8', color: '#221C15', outline: 'none', boxSizing: 'border-box' },
    colorRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    colorSwatch: { width: 44, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    formActions: { display: 'flex', gap: 8 },
    list: { display: 'flex', flexDirection: 'column', gap: 10 },
    row: { background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    catBadge: { fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, flexShrink: 0 },
    rowMeta: { flex: 1, minWidth: 0 },
    metaText: { fontSize: 12, color: '#6b5a4a', display: 'block', marginBottom: 2 },
    countPill: { fontSize: 11, color: '#a8947e' },
    rowActions: { display: 'flex', gap: 6, flexShrink: 0 },
    empty: { textAlign: 'center', padding: 32, color: '#a8947e', fontSize: 13 },
    btn: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' },
    btnPrimary: { background: '#7C5230', color: '#fff', padding: '9px 18px', fontSize: 13 },
    btnGhost: { background: 'none', border: '1.5px solid rgba(124,82,48,0.25)', color: '#6b5a4a', padding: '9px 16px', fontSize: 13 },
    btnSm: { background: 'none', border: '1px solid rgba(124,82,48,0.18)', color: '#6b5a4a', padding: '5px 12px', fontSize: 11 },
    btnDanger: { borderColor: 'rgba(239,68,68,0.3)', color: '#b91c1c' },
};
