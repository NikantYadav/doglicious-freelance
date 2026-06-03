import React, { useState, useRef } from 'react';
import { psSendOtp, psVerifyOtp } from './psService';
import { savePsSession } from './psSession';
import { WhatsAppIcon } from './Icons';

// Normalise to +91XXXXXXXXXX
function normalise(phone) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return `+91${d}`;
  if (d.length === 12 && d.startsWith('91')) return `+${d}`;
  return `+91${d.slice(-10)}`;
}

export default function PsAuthGate({ onAuthenticated }) {
  const [step, setStep] = useState(1); // 1 = phone, 2 = otp
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpErr, setOtpErr] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleSend = async () => {
    if (!/^\d{10}$/.test(phone)) { setPhoneErr('Enter a valid 10-digit mobile number'); return; }
    setPhoneErr('');
    setLoading(true);
    try {
      const { token: t } = await psSendOtp(normalise(phone));
      setToken(t);
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e) {
      setPhoneErr(e.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpErr('Enter the 6-digit code'); return; }
    setOtpErr('');
    setLoading(true);
    try {
      const result = await psVerifyOtp(normalise(phone), code, token);
      if (!result.valid) { setOtpErr(result.error || 'Incorrect code. Try again.'); return; }
      savePsSession(normalise(phone));
      onAuthenticated(normalise(phone));
    } catch (e) {
      setOtpErr(e.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => { setOtp(['','','','','','']); setOtpErr(''); setStep(1); };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#EDE0CC',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💩</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#2D1F0A', letterSpacing: -0.5 }}>PoopSense AI</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6B3D', marginTop: 2 }}>Track · Detect · Protect</div>
        </div>

        <div style={{ background: '#FFF', borderRadius: 18, padding: '22px 20px', boxShadow: '0 4px 24px rgba(74,50,24,.12)' }}>

          {step === 1 && (
            <>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#2D1F0A', marginBottom: 4 }}>Sign in with WhatsApp</div>
              <div style={{ fontSize: 11, color: '#8B6B3D', marginBottom: 18, lineHeight: 1.6 }}>
                We'll send a one-time code to your WhatsApp number.
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#F5EDE0', border: '1.5px solid rgba(58,39,0,.18)', borderRadius: 10, padding: '11px 12px', fontSize: 13, fontWeight: 700, color: '#3A2700', flexShrink: 0 }}>
                  +91
                </div>
                <input
                  type="tel" inputMode="numeric" maxLength={10}
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  style={{ flex: 1, padding: '11px 12px', border: `1.5px solid ${phoneErr ? '#AD2218' : 'rgba(58,39,0,.18)'}`, borderRadius: 10, fontSize: 14, color: '#1A1000', outline: 'none', fontFamily: 'Poppins, sans-serif' }}
                />
              </div>

              {phoneErr && <div style={{ fontSize: 11, color: '#AD2218', marginBottom: 10 }}>{phoneErr}</div>}

              <button
                onClick={handleSend}
                disabled={loading}
                style={{ width: '100%', padding: 13, background: '#25D366', color: '#FFF', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Poppins, sans-serif' }}
              >
                <WhatsAppIcon size={16} />
                {loading ? 'Sending…' : 'Send OTP via WhatsApp'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 10, color: '#9C7D52', marginTop: 12 }}>
                🔒 One-time setup · No spam, ever
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#2D1F0A', marginBottom: 4 }}>Enter OTP</div>
              <div style={{ fontSize: 11, color: '#8B6B3D', marginBottom: 18, lineHeight: 1.6 }}>
                Sent to +91 {phone} via WhatsApp
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 14 }}>
                {otp.map((val, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    maxLength={1} inputMode="numeric" pattern="[0-9]"
                    value={val}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKey(idx, e)}
                    style={{
                      width: 42, height: 50, textAlign: 'center', fontSize: 20, fontWeight: 700,
                      border: `2px solid ${otpErr ? '#AD2218' : 'rgba(58,39,0,.18)'}`,
                      borderRadius: 10, fontFamily: 'Poppins, sans-serif', color: '#3A2700', outline: 'none',
                    }}
                  />
                ))}
              </div>

              {otpErr && <div style={{ fontSize: 11, color: '#AD2218', textAlign: 'center', marginBottom: 10 }}>{otpErr}</div>}

              <button
                onClick={handleVerify}
                disabled={loading}
                style={{ width: '100%', padding: 13, background: '#3A2700', color: '#FFF', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: 'Poppins, sans-serif', marginBottom: 10 }}
              >
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>

              <button
                onClick={handleResend}
                style={{ width: '100%', padding: 8, background: 'transparent', border: 'none', color: '#9C7D52', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Resend OTP · Change number
              </button>
            </>
          )}

        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#8B6B3D', marginTop: 16 }}>
          Free trial included · then ₹499/month · Cancel anytime
        </p>
      </div>
    </div>
  );
}
