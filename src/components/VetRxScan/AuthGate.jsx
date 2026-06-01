import React, { useState, useEffect } from 'react';
import { sendOtp, verifyOtp, saveSession, updateUserName, updateSessionName } from '../../services/auth';
import { normalizePhone } from '../../utils/phone';
import { LOGO_PLACEHOLDER } from './constants';

// ── AuthGate ──────────────────────────────────────────────────────────
// Full-screen overlay shown before the app when user is not authenticated.
// Flow: phone → otp → (name if new user) → done

const AuthGate = ({ onAuthenticated }) => {
    // 'phone' | 'otp' | 'name'
    const [step, setStep] = useState('phone');
    const [phone, setPhone] = useState('');
    const [pendingToken, setPendingToken] = useState(null);
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [pendingUser, setPendingUser] = useState(null); // holds result from verifyOtp while collecting name
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const normalisePhone = (raw) => normalizePhone(raw);

    const isValidPhone = (raw) => {
        const stripped = raw.replace(/[\s\-().+]/g, '');
        return stripped.length >= 7 && /^\d+$/.test(stripped);
    };

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setError('');
        if (!phone || !isValidPhone(phone)) {
            setError('Please enter a valid phone number with country code.');
            return;
        }
        setLoading(true);
        try {
            const data = await sendOtp(normalisePhone(phone));
            setPendingToken(data.token ?? null);
            setStep('otp');
            setResendCooldown(60);
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault();
        setError('');
        if (!otp || otp.trim().length !== 6) {
            setError('Enter the 6-digit code from WhatsApp.');
            return;
        }
        setLoading(true);
        try {
            const normPhone = normalisePhone(phone);
            const result = await verifyOtp(normPhone, otp.trim(), pendingToken);
            if (!result.valid) {
                setError(result.error || 'Invalid or expired code. Try again.');
                return;
            }

            if (result.isNewUser || !result.name) {
                // New user OR existing user without a name — collect it
                setPendingUser(result);
                setStep('name');
            } else {
                // Returning user — go straight in
                const paidScans = result.paidScans ?? 0;
                saveSession({ phone: normPhone, contactId: result.contactId, name: result.name, scanCount: result.scanCount, paidScans });
                onAuthenticated({ phone: normPhone, contactId: result.contactId, name: result.name, scanCount: result.scanCount, paidScans });
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveName = async (e) => {
        e?.preventDefault();
        setError('');
        const trimmed = name.trim();
        if (!trimmed || trimmed.length < 2) {
            setError('Please enter your name (at least 2 characters).');
            return;
        }
        setLoading(true);
        const normPhone = normalisePhone(phone);
        try {
            await updateUserName(normPhone, trimmed);
            updateSessionName(trimmed);

            const paidScans = pendingUser.paidScans ?? 0;
            saveSession({ phone: normPhone, contactId: pendingUser.contactId, name: trimmed, scanCount: pendingUser.scanCount, paidScans });
            onAuthenticated({ phone: normPhone, contactId: pendingUser.contactId, name: trimmed, scanCount: pendingUser.scanCount, paidScans });
        } catch (err) {
            // Non-fatal — still let them in, just without a saved name
            console.warn('[AuthGate] Name save failed (non-fatal):', err.message);
            const paidScans = pendingUser.paidScans ?? 0;
            saveSession({ phone: normPhone, contactId: pendingUser.contactId, name: trimmed, scanCount: pendingUser.scanCount, paidScans });
            onAuthenticated({ phone: normPhone, contactId: pendingUser.contactId, name: trimmed, scanCount: pendingUser.scanCount, paidScans });
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        background: '#FBF6EC', borderRadius: '24px', padding: '28px 24px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(180deg,#3D2B00 0%,#6B4A0E 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '24px',
        }}>
            {/* Logo */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div className="logo-wrap" style={{ marginBottom: '12px', display: 'inline-flex', background: 'rgba(251,246,236,0.15)' }}>
                    <img src={LOGO_PLACEHOLDER} alt="Doglicious" className="logo-img" style={{ width: '56px' }} />
                </div>
                <h1 style={{ color: '#FBF6EC', fontSize: '26px', fontWeight: 900, margin: 0 }}>VetRx Scan</h1>
                <p style={{ color: 'rgba(251,246,236,0.6)', fontSize: '13px', marginTop: '4px' }}>AI Dog Health Diagnosis</p>
            </div>

            {/* ── Step: Phone ── */}
            {step === 'phone' && (
                <div style={cardStyle}>
                    <h2 style={{ color: '#3D2B00', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
                        Welcome 🐾
                    </h2>
                    <p style={{ color: '#9B7E4A', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                        Enter your WhatsApp number to get started. We'll send you a one-time login code.
                    </p>
                    <form onSubmit={handleSendOtp}>
                        <label className="field-label">WhatsApp Number</label>
                        <input
                            className="input mb-16"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={e => { setPhone(e.target.value); setError(''); }}
                            disabled={loading}
                            autoFocus
                        />
                        {error && (
                            <p style={{ color: '#B33A3A', fontSize: '13px', marginBottom: '12px', marginTop: '-8px' }}>
                                ⚠️ {error}
                            </p>
                        )}
                        <button className="btn btn-primary" type="submit" disabled={loading || !phone}>
                            {loading ? 'Sending…' : 'Send WhatsApp Code →'}
                        </button>
                    </form>
                    <p style={{ color: '#C4AA7A', fontSize: '11px', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
                        Free to use once. No password needed. 🔐
                    </p>
                </div>
            )}

            {/* ── Step: OTP ── */}
            {step === 'otp' && (
                <div style={cardStyle}>
                    <button
                        onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                        style={{ background: 'none', border: 'none', color: '#9B7E4A', fontSize: '13px', cursor: 'pointer', marginBottom: '12px', padding: 0, fontFamily: 'inherit' }}
                    >
                        ← Change number
                    </button>
                    <h2 style={{ color: '#3D2B00', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
                        Check WhatsApp 📱
                    </h2>
                    <p style={{ color: '#9B7E4A', fontSize: '14px', marginBottom: '8px', lineHeight: 1.5 }}>
                        We sent a 6-digit code to<br />
                        <strong style={{ color: '#3D2B00' }}>{normalisePhone(phone)}</strong>
                    </p>
                    <p style={{ color: '#9B7E4A', fontSize: '13px', marginBottom: '20px' }}>
                        Check your WhatsApp messages.
                    </p>
                    <form onSubmit={handleVerifyOtp}>
                        <label className="field-label">6-Digit Code</label>
                        <input
                            className="input mb-16"
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="123456"
                            value={otp}
                            onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                            disabled={loading}
                            autoFocus
                            style={{ fontSize: '26px', letterSpacing: '8px', textAlign: 'center', fontWeight: 900 }}
                        />
                        {error && (
                            <p style={{ color: '#B33A3A', fontSize: '13px', marginBottom: '12px', marginTop: '-8px' }}>
                                ⚠️ {error}
                            </p>
                        )}
                        <button className="btn btn-primary" type="submit" disabled={loading || otp.length !== 6}>
                            {loading ? 'Verifying…' : 'Verify & Continue →'}
                        </button>
                    </form>
                    <button
                        onClick={resendCooldown > 0 ? undefined : handleSendOtp}
                        style={{
                            display: 'block', margin: '14px auto 0', background: 'none', border: 'none',
                            color: resendCooldown > 0 ? '#C4AA7A' : '#3D2B00', fontSize: '13px',
                            cursor: resendCooldown > 0 ? 'default' : 'pointer',
                            fontFamily: 'inherit', fontWeight: 600,
                        }}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                </div>
            )}

            {/* ── Step: Name (new users only) ── */}
            {step === 'name' && (
                <div style={cardStyle}>
                    <h2 style={{ color: '#3D2B00', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
                        One last thing 🐶
                    </h2>
                    <p style={{ color: '#9B7E4A', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                        What should we call you? This helps us personalise your experience and scan history.
                    </p>
                    <form onSubmit={handleSaveName}>
                        <label className="field-label">Your Name</label>
                        <input
                            className="input mb-16"
                            type="text"
                            autoComplete="name"
                            placeholder="e.g. Priya"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            disabled={loading}
                            autoFocus
                            maxLength={80}
                        />
                        {error && (
                            <p style={{ color: '#B33A3A', fontSize: '13px', marginBottom: '12px', marginTop: '-8px' }}>
                                ⚠️ {error}
                            </p>
                        )}
                        <button className="btn btn-primary" type="submit" disabled={loading || name.trim().length < 2}>
                            {loading ? 'Saving…' : 'Get Started →'}
                        </button>
                    </form>
                    <p style={{ color: '#C4AA7A', fontSize: '11px', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
                        Your number: <strong>{normalisePhone(phone)}</strong>
                    </p>
                </div>
            )}

            <p style={{ color: 'rgba(251,246,236,0.3)', fontSize: '11px', marginTop: '20px', textAlign: 'center', lineHeight: 1.5 }}>
                By continuing you agree to our terms.<br />First scan is free · ₹99 for subsequent scans.
            </p>
        </div>
    );
};

export default AuthGate;
