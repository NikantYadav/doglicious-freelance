import React from 'react';
import { WhatsAppIcon } from '../shared/Icons';

interface PaywallPanelProps {
  onPay: () => void;
  onWhatsApp: () => void;
  onActivateSub: () => void;
}

const FEATURES = [
  'Unlimited Claude AI scans',
  'Up to 3 dog profiles',
  'Full history & progress analytics',
  'PDF reports in English & Hindi',
  'Share directly to vet via WhatsApp',
  'Fresh food booking at ₹99',
];

export const PaywallPanel: React.FC<PaywallPanelProps> = ({ onPay, onWhatsApp, onActivateSub }) => (
  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: 'calc(var(--bnav) + env(safe-area-inset-bottom,8px))' }}>
    <div className="nhdr">
      <div className="nhdr-row">
        <div className="ntitle">Upgrade to Premium</div>
      </div>
    </div>

    <div style={{ padding: '16px 14px' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#3A2700,#6B4A10)', borderRadius: 16, padding: 18, marginBottom: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>💩✨</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#FFD580', marginBottom: 4 }}>PoopSense Premium</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', lineHeight: 1.6 }}>Complete dog health monitoring powered by Claude AI</div>
      </div>

      {/* Plans */}
      <div className="pw-plan-row">
        <div className="pw-plan on">
          <div className="pw-plan-price">₹499</div>
          <div className="pw-plan-lbl">1 Dog / Month</div>
        </div>
        <div className="pw-plan">
          <div className="pw-plan-price" style={{ fontSize: 16 }}>₹1,199</div>
          <div className="pw-plan-lbl">3 Dogs / Month</div>
        </div>
      </div>

      {/* Features */}
      <div className="pw-features">
        {FEATURES.map((f) => <div key={f} className="pw-feat">{f}</div>)}
      </div>

      {/* CTA */}
      <button className="btn-pay" onClick={onPay} type="button">💳 Pay via Payment Gateway</button>
      <button className="btn-pay-wa" onClick={onWhatsApp} type="button">Or contact us on WhatsApp</button>

      {/* Dev shortcut */}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button
          style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 10, cursor: 'pointer' }}
          onClick={onActivateSub}
          type="button"
        >
          [Dev] Activate subscription
        </button>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 10, color: 'var(--t3)', lineHeight: 1.7 }}>
        256-bit SSL · Renews monthly · Cancel anytime<br />
        PoopSense AI by Doglicious.in
      </div>
    </div>
  </div>
);