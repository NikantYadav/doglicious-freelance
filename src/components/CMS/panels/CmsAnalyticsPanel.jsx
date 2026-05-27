import React, { useState, useEffect, useCallback } from 'react';
import { useCms } from '../CmsContext';

function Bar({ value, max, color = '#7C5230' }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div style={{ height: 8, background: 'rgba(124,82,48,0.10)', borderRadius: 999, overflow: 'hidden', flex: 1 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
        </div>
    );
}

function fmtViews(v) {
    if (v == null) return '—';
    return v > 999 ? (v / 1000).toFixed(1) + 'k' : String(v);
}

export default function CmsAnalyticsPanel({ showToast }) {
    const { authFetch } = useCms();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await authFetch('/api/cms/analytics');
            setData(d.analytics);
        } catch (e) { showToast('❌', e.message); }
        finally { setLoading(false); }
    }, [authFetch]);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.title}>📊 Analytics</div>
                <div style={s.sub}>Loading data from database…</div>
            </div>
            <div style={s.kpiGrid}>
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} style={{ ...s.kpiCard, ...s.skeleton }} />
                ))}
            </div>
        </div>
    );

    if (!data) return <div style={s.empty}>No analytics data available.</div>;

    // All KPI values come from the API — nothing hardcoded
    const kpis = [
        { icon: '👁️', label: 'Total Views',     value: fmtViews(data.totalViews)    },
        { icon: '📈', label: 'Avg Views/Post',  value: fmtViews(data.avgViews)      },
        { icon: '⏱',  label: 'Avg Read Time',   value: data.avgReadTime ? `${data.avgReadTime}m` : '—' },
        { icon: '✅', label: 'Published',        value: data.publishedPosts          },
        { icon: '✏️', label: 'Drafts',           value: data.draftPosts              },
        { icon: '📅', label: 'Scheduled',        value: data.scheduledPosts          },
        { icon: '💬', label: 'Total Comments',   value: data.totalComments           },
        { icon: '⏳', label: 'Pending Comments', value: data.pendingComments         },
    ];

    const maxMonthly  = Math.max(...data.monthlyPosts.map(m => m.count), 1);
    const maxCatViews = Math.max(...data.categoryBreakdown.map(c => c.views), 1);

    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.title}>📊 Analytics</div>
                <div style={s.sub}>All data is live from the database. Views are tracked on each public post visit.</div>
            </div>

            {/* KPI grid — all values from API */}
            <div style={s.kpiGrid}>
                {kpis.map(({ icon, label, value }) => (
                    <div key={label} style={s.kpiCard}>
                        <div style={s.kpiIcon}>{icon}</div>
                        <div style={s.kpiValue}>{value ?? 0}</div>
                        <div style={s.kpiLabel}>{label}</div>
                    </div>
                ))}
            </div>

            <div style={s.twoCol}>
                {/* Top posts by views */}
                <div style={s.section}>
                    <div style={s.sectionTitle}>🏆 Top Posts by Views</div>
                    {data.topPosts.length === 0 ? (
                        <div style={s.empty}>No published posts yet.</div>
                    ) : data.topPosts.map((p, i) => (
                        <div key={p.id} style={s.topRow}>
                            <div style={s.rank}>#{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={s.topTitle}>{p.title}</div>
                                <div style={s.topMeta}>{p.category}</div>
                            </div>
                            <div style={s.topViews}>{fmtViews(p.views)}</div>
                        </div>
                    ))}
                </div>

                {/* Monthly posts published */}
                <div style={s.section}>
                    <div style={s.sectionTitle}>📅 Posts Published (Last 6 Months)</div>
                    {data.monthlyPosts.map(m => (
                        <div key={m.label} style={s.monthRow}>
                            <div style={s.monthLabel}>{m.label}</div>
                            <Bar value={m.count} max={maxMonthly} />
                            <div style={s.monthCount}>{m.count}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category breakdown */}
            <div style={s.section}>
                <div style={s.sectionTitle}>🏷️ Views by Category</div>
                {data.categoryBreakdown.length === 0 ? (
                    <div style={s.empty}>No data yet.</div>
                ) : data.categoryBreakdown.map(c => (
                    <div key={c.name} style={s.catRow}>
                        <div style={s.catName}>{c.name}</div>
                        <Bar value={c.views} max={maxCatViews} />
                        <div style={s.catStats}>
                            <span style={s.catViews}>{fmtViews(c.views)}</span>
                            <span style={s.catPosts}>{c.published}/{c.total} posts</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const s = {
    wrap: { fontFamily: "'Poppins', sans-serif" },
    header: { marginBottom: 24 },
    title: { fontSize: 18, fontWeight: 800, color: '#221C15', marginBottom: 4 },
    sub: { fontSize: 13, color: '#a8947e' },
    kpiGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12, marginBottom: 24,
    },
    kpiCard: {
        background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)',
        borderRadius: 16, padding: '16px 18px', textAlign: 'center',
    },
    skeleton: {
        background: 'linear-gradient(90deg, #ede8df 25%, #e4ddd3 50%, #ede8df 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        height: 90, border: 'none',
    },
    kpiIcon:  { fontSize: 20, marginBottom: 6 },
    kpiValue: { fontSize: 24, fontWeight: 800, color: '#221C15', letterSpacing: '-0.03em', marginBottom: 2 },
    kpiLabel: { fontSize: 10, color: '#a8947e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
    twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 },
    section: { background: '#FEFDF9', border: '1px solid rgba(124,82,48,0.12)', borderRadius: 16, padding: 18, marginBottom: 16 },
    sectionTitle: { fontSize: 13, fontWeight: 700, color: '#221C15', marginBottom: 14 },
    topRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(124,82,48,0.07)' },
    rank: { fontSize: 12, fontWeight: 700, color: '#a8947e', width: 24, flexShrink: 0 },
    topTitle: { fontSize: 12, fontWeight: 600, color: '#221C15', lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    topMeta: { fontSize: 10, color: '#a8947e' },
    topViews: { fontSize: 13, fontWeight: 700, color: '#7C5230', flexShrink: 0 },
    monthRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
    monthLabel: { fontSize: 11, color: '#6b5a4a', width: 48, flexShrink: 0 },
    monthCount: { fontSize: 12, fontWeight: 700, color: '#7C5230', width: 20, textAlign: 'right', flexShrink: 0 },
    catRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
    catName: { fontSize: 12, fontWeight: 600, color: '#221C15', width: 90, flexShrink: 0 },
    catStats: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 1 },
    catViews: { fontSize: 11, fontWeight: 700, color: '#7C5230' },
    catPosts: { fontSize: 10, color: '#a8947e' },
    empty: { textAlign: 'center', padding: 32, color: '#a8947e', fontSize: 13 },
};
