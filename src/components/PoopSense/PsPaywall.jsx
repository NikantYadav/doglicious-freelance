import React, { useState } from 'react';
import { psInitiatePayment, submitPayUForm } from './psService';

const FEATURES = [
  '✓ AI Analysis',
  '✓ PDF Reports',
  '✓ Vet Sharing',
  '✓ Progress Charts',
  '✓ Unlimited Scans',
];

export default function PsPaywall({ reason, phone, dogName, onClose, onDevActivate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isExpired = reason === 'subscription_expired';

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      // We need a name + email for PayU — use phone as fallback
      const firstname = dogName ? `${dogName}'s Parent` : 'Dog Parent';
      const email = `${phone.replace(/\D/g, '')}@poopsense.in`; // synthetic email
      const { payuUrl, params } = await psInitiatePayment(phone, firstname, email);
      submitPayUForm(payuUrl, params);
    } catch (e) {
      setError(e.message || 'Payment initiation failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
      zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0',
    }}>
      <div style={{
        background: '#FFF', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 430, maxHeight: '90dvh',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        animation: 'ps-fu .25s ease',
      }}>

        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(58,39,0,.08)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C3F18' }}
          >✕</button>
        )}

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#3A2700,#6B4100)', padding: '28px 20px 22px', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💩✨</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#FFD580', marginBottom: 4 }}>PoopSense Premium</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
            {isExpired
              ? 'Your subscription has expired. Renew to continue scanning.'
              : 'You\'ve used all your free scans. Subscribe to continue.'}
          </div>
        </div>

        <div style={{ padding: '20px 20px 32px' }}>

          {/* Price card */}
          <div style={{ background: 'linear-gradient(135deg,#3A2700,#6B4100)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#FFD580', lineHeight: 1 }}>
                  ₹499<span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,213,128,.6)' }}>/month</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
                  1 Dog · Unlimited scans · All features
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                {FEATURES.map(f => (
                  <div key={f} style={{ fontSize: 9.5, color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>{f}</div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', background: '#FFD580', color: '#3A2700',
                border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer', fontFamily: 'Poppins, sans-serif',
                marginTop: 14, opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Redirecting to payment…' : 'Subscribe Now →'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>
              Renews automatically · Cancel anytime · 256-bit SSL
            </div>
          </div>

          {error && (
            <div style={{ background: '#FCECEA', border: '1px solid rgba(173,34,24,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#AD2218', marginBottom: 12 }}>
              {error}
            </div>
          )}

          {/* WhatsApp fallback */}
          <button
            onClick={() => {
              const msg = encodeURIComponent('[PoopSense AI] Hi! I want to subscribe for ₹499/month. Please activate my plan.');
              window.open('https://wa.me/919889887980?text=' + msg, '_blank');
            }}
            style={{ width: '100%', padding: '11px', background: 'transparent', border: '1.5px solid rgba(58,39,0,.18)', color: '#5C3F18', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
          >
            Or contact us on WhatsApp
          </button>

        </div>
      </div>
    </div>
  );
}
