import React, { useState } from 'react';
import { useCms } from './CmsContext';

export default function CmsAuth() {
    const { login, register } = useCms();
    const [mode, setMode]       = useState('login'); // 'login' | 'register'
    const [form, setForm]       = useState({ email: '', password: '', name: '' });
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [busy, setBusy]       = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setBusy(true);
        try {
            if (mode === 'login') {
                await login({ email: form.email, password: form.password });
                // CmsContext sets user → parent re-renders to CMS
            } else {
                const data = await register({ email: form.email, password: form.password, name: form.name });
                setSuccess(data.message || 'Account created! Awaiting admin approval.');
                setMode('login');
                setForm(f => ({ ...f, password: '', name: '' }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoRow}>
                    <div style={styles.logoIcon}>🍴</div>
                    <div>
                        <div style={styles.logoName}>Dog<span style={{ color: '#7C5230' }}>licious</span></div>
                        <div style={styles.logoSub}>Blog CMS</div>
                    </div>
                </div>

                <h2 style={styles.heading}>
                    {mode === 'login' ? 'Sign in to CMS' : 'Create an account'}
                </h2>
                <p style={styles.sub}>
                    {mode === 'login'
                        ? 'Enter your credentials to access the blog dashboard.'
                        : 'New accounts require admin approval before access is granted.'}
                </p>

                {error   && <div style={styles.errorBox}>{error}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {mode === 'register' && (
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                style={styles.input}
                                type="text"
                                placeholder="Your name"
                                value={form.name}
                                onChange={set('name')}
                                required
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={set('email')}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder={mode === 'register' ? 'Min 8 characters' : 'Your password'}
                            value={form.password}
                            onChange={set('password')}
                            required
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button style={{ ...styles.btn, opacity: busy ? 0.7 : 1 }} type="submit" disabled={busy}>
                        {busy
                            ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                            : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={styles.switchRow}>
                    {mode === 'login' ? (
                        <>Don't have an account?{' '}
                            <button style={styles.link} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
                                Register
                            </button>
                        </>
                    ) : (
                        <>Already have an account?{' '}
                            <button style={styles.link} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                Sign in
                            </button>
                        </>
                    )}
                </div>

                {mode === 'login' && (
                    <div style={styles.notice}>
                        🔒 Access is restricted to approved accounts only.
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1208 0%, #2d1f0e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
        padding: '24px',
    },
    card: {
        background: '#FEFDF9',
        borderRadius: 22,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
    },
    logoIcon: {
        width: 44,
        height: 44,
        background: '#7C5230',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
    },
    logoName: {
        fontSize: 18,
        fontWeight: 800,
        color: '#1a1208',
        letterSpacing: '-0.02em',
    },
    logoSub: {
        fontSize: 10,
        color: '#a8947e',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
    },
    heading: {
        fontSize: 22,
        fontWeight: 800,
        color: '#1a1208',
        marginBottom: 6,
        letterSpacing: '-0.02em',
    },
    sub: {
        fontSize: 13,
        color: '#6b5a4a',
        marginBottom: 24,
        lineHeight: 1.5,
    },
    errorBox: {
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#b91c1c',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        marginBottom: 16,
        fontWeight: 500,
    },
    successBox: {
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.25)',
        color: '#15803d',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        marginBottom: 16,
        fontWeight: 500,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: 700,
        color: '#6b5a4a',
        letterSpacing: '0.02em',
    },
    input: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14,
        border: '1.5px solid rgba(124,82,48,0.18)',
        borderRadius: 10,
        padding: '11px 14px',
        background: '#f5f0e8',
        color: '#221C15',
        outline: 'none',
        transition: 'border-color 0.15s',
    },
    btn: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14,
        fontWeight: 700,
        background: '#7C5230',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        padding: '13px',
        cursor: 'pointer',
        marginTop: 4,
        transition: 'background 0.18s',
        boxShadow: '0 4px 14px rgba(124,82,48,0.30)',
    },
    switchRow: {
        textAlign: 'center',
        fontSize: 13,
        color: '#6b5a4a',
        marginTop: 20,
    },
    link: {
        background: 'none',
        border: 'none',
        color: '#7C5230',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 13,
        padding: 0,
        textDecoration: 'underline',
    },
    notice: {
        textAlign: 'center',
        fontSize: 11.5,
        color: '#a8947e',
        marginTop: 16,
        padding: '10px',
        background: '#faf5ef',
        borderRadius: 8,
    },
};
