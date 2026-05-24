import React, { useState, useRef } from 'react';
import { WhatsAppIcon } from '../shared/Icons';

interface Props {
  open: boolean;
  onVerified: (phone: string) => void;
  onSkip: () => void;
}

const WA_OTP_DEMO = '00000'; // Demo: any 5-digit code accepted

const WaAuthModal: React.FC<Props> = ({ open, onVerified, onSkip }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [otpErr, setOtpErr] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!open) return null;

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone)) {
      setPhoneErr(true);
      return;
    }
    setPhoneErr(false);
    setStep(2);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 4) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const entered = otp.join('');
    if (entered.length < 5) { setOtpErr(true); return; }
    // Demo: accept any 5-digit code
    if (entered !== WA_OTP_DEMO && !/^\d{5}$/.test(entered)) {
      setOtpErr(true);
      return;
    }
    setOtpErr(false);
    onVerified(phone);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '']);
    setOtpErr(false);
    setStep(1);
  };

  return (
    <div className="wa-auth-modal" style={{ display: 'flex' }}>
      <div className="wa-auth-card">

        {/* STEP 1 */}
        {step === 1 && (
          <div id="waStep1">
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '38px' }}>📱</div>
              <div className="wa-auth-title" style={{ marginTop: '8px' }}>Verify your number</div>
              <div className="wa-auth-sub">Enter your mobile number to receive scan reports via WhatsApp.</div>
            </div>

            <div className="wa-phone-row">
              <div className="wa-pfx">+91</div>
              <input
                className="wa-phone-in"
                type="tel"
                placeholder="10-digit mobile"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneErr(false); }}
              />
            </div>

            {phoneErr && (
              <div style={{ fontSize: '11px', color: 'var(--r)', margin: '-8px 0 10px', display: 'block' }}>
                Please enter a valid 10-digit number
              </div>
            )}

            <button
              onClick={handleSendOtp}
              style={{
                width: '100%',
                padding: '14px',
                background: '#25D366',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <WhatsAppIcon />
              Send OTP via WhatsApp
            </button>

            <button
              onClick={onSkip}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                color: '#9C7D52',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Skip for now
            </button>

            <p style={{ textAlign: 'center', fontSize: '10px', color: '#9C7D52', marginTop: '8px' }}>
              🔒 One-time setup. No spam, ever.
            </p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div id="waStep2">
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '38px' }}>🔒</div>
              <div className="wa-auth-title" style={{ marginTop: '8px' }}>Enter OTP</div>
              <div className="wa-auth-sub" id="waOtpSubtitle">
                We sent a 5-digit code to your WhatsApp. Enter it below.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  className="wa-otp-box"
                  maxLength={1}
                  inputMode="numeric"
                  pattern="[0-9]"
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '46px',
                    height: '54px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    border: `2px solid ${otpErr ? 'var(--r)' : 'var(--bds)'}`,
                    borderRadius: '10px',
                    fontFamily: 'Poppins, sans-serif',
                    color: '#3A2700',
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            {otpErr && (
              <div style={{ fontSize: '11px', color: 'var(--r)', textAlign: 'center', margin: '-6px 0 10px' }}>
                Incorrect code. Please try again.
              </div>
            )}

            <button
              onClick={handleVerify}
              style={{
                width: '100%',
                padding: '14px',
                background: '#3A2700',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '10px',
              }}
            >
              Verify &amp; Continue
            </button>

            <button
              onClick={handleResend}
              style={{
                width: '100%',
                padding: '8px',
                background: 'transparent',
                color: '#9C7D52',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Resend OTP • Change number
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WaAuthModal;