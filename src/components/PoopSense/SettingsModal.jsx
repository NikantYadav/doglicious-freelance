import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { useToast } from '../common/Toast';
import { getTrialStatus } from './helpers';
import { psSaveSettings } from './psService';
import { getPsSession } from './psSession';

const SettingsModal = ({ open, onClose, onSubscribe, onLogout, quota }) => {
  const { state, dispatch, setVet } = useApp();
  const { toast } = useToast();

  const [lang, setLang] = useState(state.pdfLang);
  const [vetName, setVetName] = useState(state.vet.name);
  const [vetNum, setVetNum] = useState(state.vet.num);

  useEffect(() => {
    if (!open) return;
    setLang(state.pdfLang);
    setVetName(state.vet.name);
    setVetNum(state.vet.num);
  }, [open, state.vet, state.pdfLang]);

  if (!open) return null;

  const handleLang = (l) => {
    setLang(l);
    dispatch({ type: 'SET_PDF_LANG', lang: l });
  };

  const handleSaveVet = () => {
    if (!vetName.trim()) { toast('Enter vet name.'); return; }
    if (!/^\d{10}$/.test(vetNum)) { toast('Enter a valid 10-digit mobile number.'); return; }
    setVet({ name: vetName.trim(), num: vetNum });
    toast('Vet info saved!');
    const session = getPsSession();
    if (session?.phone) {
      psSaveSettings(session.phone, {
        vetName: vetName.trim(),
        vetNum,
        pdfLang: lang,
        subscribed: state.subscribed,
        subDate: state.subDate || null,
        startDate: state.startDate || null,
      }).catch(e => console.warn('[SettingsModal] psSaveSettings failed:', e.message));
    }
  };

  const trialStatus = getTrialStatus(state.startDate, state.subscribed, quota);

  // Trial dates
  const trialDays = trialStatus.trialDays ?? 7;
  const startDate = state.startDate ? new Date(state.startDate) : null;
  const endDate = startDate ? new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
  const fmtDate = (d) => d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const daysUsed   = trialStatus.daysUsed  ?? 0;
  const daysLeft   = trialStatus.daysLeft  ?? trialDays;
  const progressPct = Math.min(100, Math.round((daysUsed / trialDays) * 100));

  return (
    <div className="modal-bg open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">

        {/* Header */}
        <div className="modal-h">
          <div className="modal-title">Settings</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Language */}
        <div className="clbl" style={{ marginBottom: 8 }}>Default Report Language</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`lang-btn${lang === 'en' ? ' on' : ''}`} onClick={() => handleLang('en')}>English</button>
          <button className={`lang-btn${lang === 'hi' ? ' on' : ''}`} onClick={() => handleLang('hi')}>हिंदी Hindi</button>
        </div>

        {/* Vet Info */}
        <div className="sett-section">
          <div className="clbl" style={{ marginBottom: 12 }}>Vet Info</div>

          <div className="fg">
            <label className="fl">Vet Name</label>
            <input
              className="fi"
              type="text"
              placeholder="e.g. Dr. Sharma"
              value={vetName}
              onChange={e => setVetName(e.target.value)}
            />
          </div>

          <div className="fg" style={{ marginBottom: 14 }}>
            <label className="fl">Vet Mobile</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 13, fontWeight: 600, color: 'var(--t2)'
              }}>+91</span>
              <input
                className="fi"
                type="tel"
                placeholder="10-digit mobile"
                style={{ paddingLeft: 40 }}
                maxLength={10}
                value={vetNum}
                onChange={e => setVetNum(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <button className="btn" onClick={handleSaveVet} style={{ borderRadius: 12, fontSize: 14, fontWeight: 700, padding: '14px' }}>
            Save Vet Info
          </button>
        </div>

        {/* Subscription */}
        <div className="sett-section">
          <div className="clbl" style={{ marginBottom: 12 }}>Subscription</div>

          {state.subscribed ? (
            /* ── Subscribed state ── */
            <div style={{ background: 'linear-gradient(135deg,#1a3d2b,#195c30)', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#FFD580' }}>
                  ✓ Active
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>PoopSense AI Pro</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>
                Subscribed since {fmtDate(state.subDate ? new Date(state.subDate) : null)}
              </div>
            </div>
          ) : (
            /* ── Trial state ── */
            <>
              {/* Trial status row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{
                  background: trialStatus.isExpired ? 'var(--r)' : trialStatus.daysLeft <= 2 ? '#C47808' : 'var(--g)',
                  borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#fff',
                  whiteSpace: 'nowrap', flexShrink: 0
                }}>
                  {trialStatus.isExpired ? 'Expired' : `${trialStatus.daysLeft} day${trialStatus.daysLeft !== 1 ? 's' : ''} left`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)', marginBottom: 3 }}>
                    <span>Trial started</span>
                    <span style={{ fontWeight: 700, color: 'var(--t1)' }}>{fmtDate(startDate)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)', marginBottom: 3 }}>
                    <span>Trial ends</span>
                    <span style={{ fontWeight: 700, color: 'var(--g)' }}>{fmtDate(endDate)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)' }}>
                    <span>Days used</span>
                    <span style={{ fontWeight: 700, color: 'var(--t1)' }}>{trialStatus.daysUsed} / 7</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 5, background: 'var(--sf2)', borderRadius: 3, border: '1px solid var(--bd)', marginBottom: 14, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: trialStatus.isExpired ? 'var(--r)' : trialStatus.daysLeft <= 2 ? '#C47808' : 'var(--g)',
                  width: `${progressPct}%`, transition: 'width 0.5s ease'
                }} />
              </div>

              {/* Subscribe card */}
              <div style={{ background: 'linear-gradient(135deg,#3A2700,#6B4100)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#FFD580', lineHeight: 1 }}>
                      ₹499<span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,213,128,.6)' }}>/month</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
                      1 Dog · Unlimited scans · All features
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                    {['✓ AI Analysis', '✓ PDF Reports', '✓ Vet Sharing', '✓ Progress Charts'].map(f => (
                      <div key={f} style={{ fontSize: 9.5, color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>{f}</div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onSubscribe}
                  style={{
                    width: '100%', padding: '13px', background: '#FFD580', color: '#3A2700',
                    border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 800,
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif', marginTop: 8
                  }}
                >
                  Subscribe Now →
                </button>
                <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>
                  Renews automatically · Cancel anytime · 256-bit SSL
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="sett-section">
          <button
            onClick={() => {
              clearPsSession();
              onClose();
              if (onLogout) onLogout();
            }}
            style={{
              width: '100%', padding: '13px', background: 'transparent',
              border: '1.5px solid rgba(173,34,24,.3)', borderRadius: 12,
              fontSize: 14, fontWeight: 700, color: '#AD2218',
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            }}
          >
            🚪 Log Out
          </button>
        </div>

        {/* Footer */}
        <div className="sett-section" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.7 }}>
            PoopSense AI v3.0 · Doglicious.in<br />Claude Vision AI · Poppins
          </p>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
