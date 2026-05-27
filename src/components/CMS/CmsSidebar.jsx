import React from 'react';
import { useCms } from './CmsContext';

const NAV = [
    { section: 'Content', items: [
        { key: 'posts',     icon: '📝', label: 'All Posts',  countKey: 'posts'     },
        { key: 'drafts',    icon: '✏️',  label: 'Drafts',     countKey: 'drafts'    },
        { key: 'scheduled', icon: '📅', label: 'Scheduled',  countKey: 'scheduled' },
    ]},
    { section: 'Manage', items: [
        { key: 'categories', icon: '🏷️', label: 'Categories', countKey: 'categories' },
        { key: 'tags',       icon: '🔖', label: 'Tags',        countKey: 'tags'       },
    ]},
    { section: 'Insights', items: [
        { key: 'analytics', icon: '📊', label: 'Analytics'                           },
        { key: 'comments',  icon: '💬', label: 'Comments',   countKey: 'comments'   },
    ]},
];

export default function CmsSidebar({ active, onNav, counts = {} }) {
    const { user, logout } = useCms();

    return (
        <aside style={styles.sidebar}>
            {/* Logo */}
            <div style={styles.logoWrap}>
                <div style={styles.logoRow}>
                    <div style={styles.logoIcon}>🍴</div>
                    <div style={styles.logoName}>
                        Dog<span style={{ color: '#7C5230', opacity: 0.9 }}>licious</span>
                    </div>
                </div>
                <div style={styles.logoSub}>Blog CMS</div>
            </div>

            {/* Nav */}
            {NAV.map(group => (
                <div key={group.section}>
                    <div style={styles.sectionLabel}>{group.section}</div>
                    {group.items.map(item => {
                        const count = item.countKey != null ? counts[item.countKey] : undefined;
                        const isActive = active === item.key;
                        return (
                            <div
                                key={item.key}
                                style={{ ...styles.navItem, ...(isActive ? styles.navActive : {}) }}
                                onClick={() => onNav(item.key)}
                            >
                                <span style={styles.navIcon}>{item.icon}</span>
                                {item.label}
                                {count != null && count > 0 && (
                                    <span style={{ ...styles.badge, ...(isActive ? styles.badgeActive : {}) }}>
                                        {count}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Footer */}
            <div style={styles.footer}>
                <div style={styles.userChip}>
                    <div style={styles.avatar}>{(user?.name || 'A')[0].toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.userName}>{user?.name || 'Admin'}</div>
                        <div style={styles.userRole}>{user?.role || 'editor'} · Doglicious.in</div>
                    </div>
                    <button style={styles.logoutBtn} onClick={logout} title="Sign out">⏻</button>
                </div>
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: 260,
        flexShrink: 0,
        background: '#1a1208',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        fontFamily: "'Poppins', sans-serif",
    },
    logoWrap: {
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
    logoIcon: {
        width: 36, height: 36, background: '#7C5230', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
    },
    logoName: { fontSize: 16, fontWeight: 800, color: '#FEFDF9', letterSpacing: '-0.02em' },
    logoSub: {
        fontSize: 10, color: 'rgba(255,255,255,0.30)',
        letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 46,
    },
    sectionLabel: {
        padding: '20px 14px 8px', fontSize: 9.5, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
    },
    navItem: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 14,
        fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.55)',
        cursor: 'pointer', margin: '2px 8px', transition: 'all 0.15s',
    },
    navActive: { background: '#7C5230', color: '#fff', fontWeight: 600 },
    navIcon: { fontSize: 15, width: 20, textAlign: 'center' },
    badge: {
        marginLeft: 'auto', background: '#7C5230', color: '#fff',
        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
    },
    badgeActive: { background: 'rgba(255,255,255,0.25)' },
    footer: {
        marginTop: 'auto', padding: '16px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    userChip: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.05)',
    },
    avatar: {
        width: 32, height: 32, borderRadius: '50%', background: '#7C5230',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
    },
    userName: {
        fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.80)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    userRole: { fontSize: 10, color: 'rgba(255,255,255,0.30)' },
    logoutBtn: {
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
        cursor: 'pointer', fontSize: 16, padding: '4px', borderRadius: 6,
        transition: 'color 0.15s', flexShrink: 0,
    },
};
