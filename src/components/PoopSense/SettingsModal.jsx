import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { useToastContext } from './ToastContext';
import { getTrialStatus } from './helpers';

const SettingsModal = ({ open, onClose, onSubscribe }) => {
  const { state, dispatch, setVet, activateSub } = useApp();
  const { toast } = useToastContext();

  const [lang, setLang] = useState(state.pdfLang);
  const [vetName, setVetName] = useState(state.vet.name);
  const [vetNum, setVetNum] = useState(state.vet.num);
  const [vetSaved, setVetSaved] = useState(!!(state.vet.name && state.vet.num));
  const [editingVet, setEditingVet] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLang(state.pdfLang);
    setVetName(state.vet.name);
    setVetNum(state.vet.num);
    const saved = !!(state.vet.name && state.vet.num);
    setVetSaved(saved);
    setEditingVet(!saved);
  }, [open, state.vet, state.pdfLang]);

  if (!open) return null;

  const handleLang = (l) => {
    setLang(l);
    dispatch({ type: 'SET_PDF_LANG', lang: l });
  };

  const handleSaveVet = () => {
    if (!vetName.trim() || !/^\d{10}$/.test(vetNum)) {
      toast('Enter vet name and valid 10-digit mobile.');
      return;
    }
    setVet({ name: vetName.trim(), num: vetNum });
    setVetSaved(true);
    setEditingVet(false);
    toast('Vet info saved!');
  };

  const trialStatus = getTrialStatus(state.startDate, state.subscribed);

  const renderSubCard = () => {
    if (state.subscribed) {
      return (
        <div className="sub-info-card" style={{ background: 'linear-gradient(135deg,#1a3d2b,#195c30)', borderRadius: 'var(--rs)', padding: '14px' }}>
          <div className="sub-plan-name">PoopSense AI Pro</div>
          <div className="sub-plan-desc">₹499/month · Active subscription</div>
          <div style={{ marginTop: 8, display: 'inline-block', background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 700, color: '#FFD580' }}>✓ Subscribed</div>
        </div>
      );
    }
    const left = trialStatus.daysLeft;
    const pct = Math.round((trialStatus.daysUsed / 7) * 100);
    return (
      <div className="sub-info-card" style={{ background: left > 0 ? 'linear-gradient(135deg,#3a2700,#6b4100)' : '#FFF0EE', borderRadius: 'var(--rs)', padding: '14px' }}>
        {left > 0 ? (
          <>
            <div className="sub-plan-name">Free Trial</div>
            <div className="sub-plan-desc">{left} day{left !== 1 ? 's' : ''} remaining · then ₹499/month</div>
            <div className="sub-progress-wrap" style={{ marginTop: 10 }}>
              <div className="sub-progress-bar" style={{ width: `${pct}%`, background: '#FFD580' }} />
            </div>
            <button className="sub-subscribe-btn" style={{ marginTop: 12 }} onClick={onSubscribe}>
              Subscribe — ₹499/month
            </button>
            <div className="sub-footnote">Cancel anytime · Renews monthly</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--r)', marginBottom: 6 }}>Trial Expired</div>
            <button className="btn" style={{ fontSize: 12, width: '100%' }} onClick={onSubscribe}>
              Subscribe — ₹499/month
            </button>
          </>
        )}
        <button
          style={{ marginTop: 8, width: '100%', padding: 6, background: 'transparent', border: '1px dashed rgba(255,255,255,.2)', borderRadius: 8, fontSize: 10, color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
          onClick={() => { activateSub(); toast('Dev: subscription activated!'); }}
        >
          [Dev] Activate subscription
        </button>
      </div>
    );
  };

  return (
    <div className="modal-bg open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-h">
          <div className="modal-title">Settings</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Language */}
        <div className="clbl" style={{ marginBottom: 8 }}>Default Report Language</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`lang-btn${lang === 'en' ? ' on' : ''}`} onClick={() => handleLang('en')}>English</button>
          <button className={`lang-btn${lang === 'hi' ? ' on' : ''}`} onClick={() => handleLang('hi')}>हिंदी Hindi</button>
        </div>

        {/* Vet Info */}
        <div className="sett-section">
          <div className="clbl" style={{ marginBottom: 10 }}>Vet Info</div>

          {vetSaved && !editingVet ? (
            <div style={{ background: 'var(--glt)', borderRadius: 'var(--rs)', padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--g)', display: 'flex', alignItems: 'center', gap: 5 }}>✓ Vet info saved successfully</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginTop: 4 }}>
                    {state.vet.name} · +91 {state.vet.num}
                  </div>
                </div>
                <button
                  onClick={() => setEditingVet(true)}
                  style={{ background: 'none', border: '1.5px solid var(--bd)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: 'var(--t2)', fontFamily: 'Poppins, sans-serif' }}
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="fg">
                <label className="fl">Vet Name</label>
                <input className="fi" type="text" placeholder="e.g. Dr. Sharma" value={vetName} onChange={e => setVetName(e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Vet Mobile</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>+91</span>
                  <input className="fi" type="tel" placeholder="10-digit mobile" style={{ paddingLeft: 34 }} maxLength={10} value={vetNum} onChange={e => setVetNum(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
              <button className="btn" style={{ fontSize: 12 }} onClick={handleSaveVet}>Save Vet Info</button>
            </div>
          )}
        </div>

        {/* Subscription */}
        <div className="sett-section">
          <div className="clbl" style={{ marginBottom: 12 }}>Subscription</div>
          {renderSubCard()}
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
