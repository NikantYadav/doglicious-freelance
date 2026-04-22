import React, { useState, useEffect } from 'react';
import { sendOtp, verifyOtp, saveSession } from '../../services/auth';
import { LOGO_PLACEHOLDER } from './constants';

// ── AuthGate ──────────────────────────────────────────────────────────
// Full-screen overlay shown before the app when user is not authenticated.

const AuthGate = ({ onAuthenticated }) => {
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [pendingToken, setPendingToken] = useState(null); // signed OTP token from server
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setError('');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            const data = await sendOtp(email);
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
            setError('Enter the 6-digit code from your email.');
            return;
        }
        setLoading(true);
        try {
            const result = await verifyOtp(email, otp.trim(), pendingToken);
            if (!result.valid) {
                setError(result.error || 'Invalid or expired code. Try again.');
                return;
            }
            saveSession({ email, contactId: result.contactId, scanCount: result.scanCount });
            onAuthenticated({ email, contactId: result.contactId, scanCount: result.scanCount });
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
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

            {/* Card */}
            <div style={{
                background: '#FBF6EC', borderRadius: '24px', padding: '28px 24px',
                width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}>
                {step === 'email' ? (
                    <>
                        <h2 style={{ color: '#3D2B00', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
                            Welcome 🐾
                        </h2>
                        <p style={{ color: '#9B7E4A', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                            Enter your email to get started. We'll send you a one-time login code.
                        </p>
                        <form onSubmit={handleSendOtp}>
                            <label className="field-label">Email Address</label>
                            <input
                                className="input mb-16"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                disabled={loading}
                                autoFocus
                            />
                            {error && (
                                <p style={{ color: '#B33A3A', fontSize: '13px', marginBottom: '12px', marginTop: '-8px' }}>
                                    ⚠️ {error}
                                </p>
                            )}
                            <button className="btn btn-primary" type="submit" disabled={loading || !email}>
                                {loading ? 'Sending…' : 'Send Login Code →'}
                            </button>
                        </form>
                        <p style={{ color: '#C4AA7A', fontSize: '11px', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
                            Free to use once. No password needed. 🔐
                        </p>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                            style={{ background: 'none', border: 'none', color: '#9B7E4A', fontSize: '13px', cursor: 'pointer', marginBottom: '12px', padding: 0, fontFamily: 'inherit' }}
                        >
                            ← Change email
                        </button>
                        <h2 style={{ color: '#3D2B00', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
                            Check your inbox ✉️
                        </h2>
                        <p style={{ color: '#9B7E4A', fontSize: '14px', marginBottom: '8px', lineHeight: 1.5 }}>
                            We sent a 6-digit code to<br />
                            <strong style={{ color: '#3D2B00' }}>{email}</strong>
                        </p>
                        <p style={{ color: '#9B7E4A', fontSize: '13px', marginBottom: '20px' }}>
                            Check your spam folder if you don't see it.
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
                    </>
                )}
            </div>

            <p style={{ color: 'rgba(251,246,236,0.3)', fontSize: '11px', marginTop: '20px', textAlign: 'center', lineHeight: 1.5 }}>
                By continuing you agree to our terms.<br />First scan is free · ₹99 for subsequent scans.
            </p>
        </div>
    );
};

export default AuthGate;
