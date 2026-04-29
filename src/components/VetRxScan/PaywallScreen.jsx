import React, { useState } from 'react';
import { LOGO_PLACEHOLDER } from './constants';
import { clearSession } from '../../services/auth';

const API = import.meta.env.VITE_API_URL ?? '';

// ── PaywallScreen ──────────────────────────────────────────────────────
// Shown when the user has used their free scan quota and must pay.
// Calls /api/payu-initiate to get hash, then auto-submits to PayU hosted checkout.

const PaywallScreen = ({ email, contactId, phone, firstname, onLogout, numScans, payuMessage }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayNow = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/api/payu-initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstname: firstname || email.split('@')[0],
                    phone: phone || '',
                    contactId: contactId || '',
                    returnPath: window.location.pathname,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Could not initiate payment');
            }

            const { payuUrl, params } = await res.json();

            // Build and auto-submit a hidden form to PayU hosted checkout
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuUrl;
            form.style.display = 'none';

            Object.entries(params).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value ?? '';
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearSession();
        if (onLogout) onLogout();
    };

    const waUrl = `https://wa.me/919889887980?text=${encodeURIComponent(
        `Hi Doglicious! 🐾\nI'd like to continue using VetRx Scan. Please help me with the payment.\n\nMy email: ${email}`
    )}`;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'linear-gradient(180deg,#3D2B00 0%,#6B4A0E 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '24px',
            overflowY: 'auto',
        }}>
            {/* Logo */}
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                <div className="logo-wrap" style={{ marginBottom: '10px', display: 'inline-flex', background: 'rgba(251,246,236,0.15)' }}>
                    <img src={LOGO_PLACEHOLDER} alt="Doglicious" className="logo-img" style={{ width: '52px' }} />
                </div>
                <h1 style={{ color: '#FBF6EC', fontSize: '22px', fontWeight: 900, margin: 0 }}>VetRx Scan</h1>
            </div>

            {/* Card */}
            <div style={{
                background: '#FBF6EC', borderRadius: '24px', padding: '28px 24px',
                width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}>
                {/* PayU Return Message */}
                {payuMessage && (
                    <div style={{
                        borderRadius: '12px', padding: '10px 14px', marginBottom: '16px',
                        fontSize: '13px', textAlign: 'center', fontWeight: 600,
                        background: payuMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                        color: payuMessage.type === 'success' ? '#065f46' : '#991b1b',
                    }}>
                        {payuMessage.text}
                    </div>
                )}

                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
                    <h2 style={{ color: '#3D2B00', fontSize: '22px', fontWeight: 900, margin: '0 0 8px' }}>
                        Free Scan Used
                    </h2>
                    <p style={{ color: '#9B7E4A', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                        You've used your free VetRx Scan. Upgrade to get <strong>{numScans || 5} more scans</strong> with AI-powered dog health diagnoses.
                    </p>
                </div>

                {/* Pricing Box */}
                <div style={{
                    background: 'linear-gradient(135deg,#3D2B00 0%,#6B4A0E 100%)',
                    borderRadius: '20px', padding: '20px', marginBottom: '20px', textAlign: 'center',
                }}>
                    <div style={{ color: 'rgba(251,246,236,0.4)', fontSize: '16px', textDecoration: 'line-through', marginBottom: '4px' }}>₹499</div>
                    <div style={{ color: '#FFD700', fontSize: '42px', fontWeight: 900, lineHeight: 1, marginBottom: '4px' }}>₹99</div>
                    <div style={{ color: 'rgba(251,246,236,0.7)', fontSize: '13px' }}>one-time · {numScans || 5} scans unlocked</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {['AI photo analysis', 'Diet plan', 'Follow-up check-in'].map((f, i) => (
                            <span key={i} style={{
                                background: 'rgba(251,246,236,0.15)', color: '#FBF6EC', fontSize: '11px',
                                padding: '4px 10px', borderRadius: '99px',
                            }}>
                                ✓ {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#fee2e2', color: '#991b1b', borderRadius: '12px',
                        padding: '10px 14px', marginBottom: '12px', fontSize: '13px', textAlign: 'center',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* PayU Button */}
                <button
                    id="payu-pay-btn"
                    className="btn btn-primary"
                    onClick={handlePayNow}
                    disabled={loading}
                    style={{ marginBottom: '12px', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? '⏳ Redirecting to payment…' : '🔐 Pay ₹99 via PayU'}
                </button>

                {/* WhatsApp fallback */}
                <a href={waUrl} target="_blank" rel="noreferrer" className="btn-whatsapp" style={{ marginBottom: '16px', borderRadius: '14px' }}>
                    🟢 Message us on WhatsApp
                </a>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'block', margin: '0 auto', background: 'none', border: 'none',
                        color: '#9B7E4A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    Sign out ({email})
                </button>
            </div>

            <p style={{ color: 'rgba(251,246,236,0.3)', fontSize: '11px', marginTop: '20px', textAlign: 'center' }}>
                Secure payment powered by PayU · 100% money-back guarantee
            </p>
        </div>
    );
};

export default PaywallScreen;
