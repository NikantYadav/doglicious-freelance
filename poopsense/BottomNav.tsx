import React, { useState } from 'react';
import { GalleryIcon, ActivityIcon, FileIcon, InfoIcon } from '../shared/Icons';

interface LandingScreenProps {
  onGetStarted: () => void;
  onShowDisclaimer: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted, onShowDisclaimer }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div
      id="disc"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: '#EDE0CC',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 9999,
        width: '100%',
      }}
    >
      <div style={{ width: '100%', maxWidth: 430, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

        {/* ── HERO ── */}
        <div style={{
          background: '#EDE0CC', padding: '32px 24px 28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(74,50,24,.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(74,50,24,.04)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#2D1F0A', letterSpacing: -0.3, lineHeight: 1.1, marginBottom: 2, position: 'relative', zIndex: 1 }}>Doglicious.in</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B4E22', marginBottom: 20, position: 'relative', zIndex: 1 }}>Superfood for Dogs</div>
          <div style={{ fontSize: 'clamp(32px,9vw,42px)', fontWeight: 900, color: '#2D1F0A', letterSpacing: -1, lineHeight: 1, marginBottom: 8, position: 'relative', zIndex: 1 }}>PoopSense AI</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8B6B3D', position: 'relative', zIndex: 1 }}>Track · Detect · Protect</div>
        </div>

        {/* ── FEATURES ── */}
        <div style={{ padding: '16px 16px 0', background: '#F5EDE0', flexShrink: 0 }}>
          <div style={{ background: '#FFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 14px rgba(74,50,24,.08)', border: '1px solid rgba(74,50,24,.09)' }}>
            {[
              { icon: <CameraIconFeature />, title: 'Instant Photo Scan', sub: 'Upload a photo, get AI analysis in seconds' },
              { icon: <ActivityIcon size={20} stroke="#4A3218" strokeWidth={1.8} />, title: 'Clinical AI Analysis', sub: 'Bristol scale, colour, consistency & risk score' },
              { icon: <FileIcon size={20} stroke="#4A3218" strokeWidth={1.8} />, title: 'Vet-Ready PDF Report', sub: 'Share directly via WhatsApp to your vet' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid #F0E8DC' : undefined }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2D1F0A', marginBottom: 1 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#8B6B3D' }}>{item.sub}</div>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C4B49A" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ padding: '12px 16px 0', background: '#F5EDE0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: '7', lbl: 'Day Free' },
              { val: '4', lbl: 'Scans/Day' },
              { val: 'AI', lbl: 'Claude', small: true },
            ].map(({ val, lbl, small }) => (
              <div key={lbl} style={{ flex: 1, background: '#FFF', borderRadius: 12, padding: '10px 6px', textAlign: 'center', boxShadow: '0 1px 6px rgba(74,50,24,.06)' }}>
                <div style={{ fontSize: small ? 16 : 22, fontWeight: 900, color: '#2D1F0A', lineHeight: small ? 1.2 : 1 }}>{val}</div>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: '#8B6B3D', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── T&C ── */}
        <div style={{ padding: '12px 16px 0', background: '#F5EDE0', flexShrink: 0 }}>
          <div className="d-checkrow" onClick={() => setAgreed(v => !v)}>
            <div className={`d-cb${agreed ? ' on' : ''}`} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: '#5A3D1A', lineHeight: 1.6 }}>
              I agree to the{' '}
              <span
                style={{ color: '#4A3218', fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid rgba(74,50,24,.4)' }}
                onClick={(e) => { e.stopPropagation(); onShowDisclaimer(); }}
              >
                Terms &amp; Conditions
              </span>
              {' '}&nbsp;
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#8B6B3D', fontWeight: 600, cursor: 'pointer', fontSize: 10 }}
                onClick={(e) => { e.stopPropagation(); onShowDisclaimer(); }}
              >
                <InfoIcon size={10} />AI Disclaimer
              </span>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ padding: '12px 16px 0', background: '#F5EDE0', flexShrink: 0 }}>
          <button
            className={`btn-start${agreed ? ' go' : ''}`}
            style={{ width: '100%', fontSize: 15, fontWeight: 700, padding: 15, borderRadius: 13, background: '#2D1F0A', boxShadow: '0 5px 18px rgba(45,31,10,.28)' }}
            onClick={agreed ? onGetStarted : undefined}
          >
            Get Started →
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ padding: '10px 16px 20px', background: '#F5EDE0', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#8B6B3D' }}>7 days free &nbsp;·&nbsp; then ₹499/month &nbsp;·&nbsp; Cancel anytime</div>
        </div>

      </div>
    </div>
  );
};

// Small inline camera icon for feature list
const CameraIconFeature: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A3218" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);