import React, { useState } from 'react';
import { psInitiatePayment, submitPayUForm } from './psService';

// Human-readable headline for each quota-exceeded reason
function getHeadline(reason) {
  switch (reason) {
    case 'subscription_expired': return 'Subscription Expired';
    case 'daily_limit_reached':  return "Today's Scans Used Up";
    case 'period_cap_reached':   return 'Monthly Limit Reached';
    case 'trial_expired':        return 'Free Trial Ended';
    case 'free_limit_reached':   return 'Free Trial Scans Used';
    default:                     return 'Upgrade to PoopSense Premium';
  }
}

function getSubline(reason, quota) {
  const dailyCap  = quota?.dailyCap  ?? '—';
  const periodCap = quota?.periodCap ?? '—';
  const trialDays = quota?.trialDays ?? '—';
  const trialScans = quota?.trialScans ?? '—';
  switch (reason) {
    case 'subscription_expired':
      return 'Your subscription has expired. Renew to keep scanning.';
    case 'daily_limit_reached':
      return `You've used all ${dailyCap} scans for today. Come back tomorrow.`;
    case 'period_cap_reached':
      return `You've reached the ${periodCap}-scan limit for this period.`;
    case 'trial_expired':
      return `Your ${trialDays}-day free trial has ended.`;
    case 'free_limit_reached':
      return `You've used all ${trialScans} free trial scans.`;
    default:
      return quota
        ? `Get full access — ${dailyCap} scans/day, up to ${periodCap} scans in ${quota.subDays ?? 30} days.`
        : 'Get full access with PoopSense Premium.';
  }
}

function buildFeatures(quota) {
  const daily  = quota?.dailyCap  ?? '4';
  const period = quota?.periodCap ?? '120';
  return [
    '✓ AI-powered poop analysis',
    `✓ ${daily} scans / day · ${period} scans / month`,
    '✓ Full history & progress charts',
    '✓ PDF reports (English & Hindi)',
    '✓ Share report to vet via WhatsApp',
  ];
}

export default function PsPaywall({ reason, phone, dogName, quota, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const subPrice = quota?.subPrice ?? '499';
  const subDays  = quota?.subDays  ?? 30;
  const dailyCap = quota?.dailyCap ?? 4;
  const periodCap = quota?.periodCap ?? 120;

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const firstname = dogName ? `${dogName}'s Parent` : 'Dog Parent';
      const email     = `${phone.replace(/\D/g, '')}@poopsense.in`;
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
    }}>
      <div style={{
        background: '#FFF', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 430, maxHeight: '90dvh',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        animation: 'ps-fu .25s ease', position: 'relative',
      }}>

        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(58,39,0,.08)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C3F18', zIndex: 1 }}
          >✕</button>
        )}

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#3A2700,#6B4100)', padding: '28px 20px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💩✨</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#FFD580', marginBottom: 6 }}>
            {getHeadline(reason)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', lineHeight: 1.7 }}>
            {getSubline(reason, quota)}
          </div>
        </div>

        <div style={{ padding: '20px 20px 32px' }}>

          {/* Price card */}
          <div style={{ background: 'linear-gradient(135deg,#3A2700,#6B4100)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#FFD580', lineHeight: 1 }}>
                  ₹{subPrice}
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,213,128,.6)' }}>/{subDays}days</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
                  {dailyCap} scans/day · {periodCap} scans total
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                {buildFeatures(quota).map(f => (
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
              {loading ? 'Redirecting to payment…' : `Subscribe for ₹${subPrice} →`}
            </button>

            <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>
              {dailyCap} scans/day · max {periodCap} scans in {subDays} days · 256-bit SSL
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
              const msg = encodeURIComponent(`[PoopSense AI] Hi! I want to subscribe for ₹${subPrice}/${subDays} days. Please activate my plan.`);
              window.open('https://wa.me/919889887980?text=' + msg, '_blank');
            }}
            style={{ width: '100%', padding: '11px', background: 'transparent', border: '1.5px solid rgba(58,39,0,.18)', color: '#5C3F18', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', marginBottom: 8 }}
          >
            Or contact us on WhatsApp
          </button>

        </div>
      </div>
    </div>
  );
}
