import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../context/ToastContext';
import { getTrialStatus } from '../../utils/helpers';
import { PDFLang, VetInfo } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const SettingsModal: React.FC<Props> = ({ open, onClose, onSubscribe }) => {
  const { state, dispatch, setVet, activateSub } = useApp();
  const { toast } = useToastContext();

  const [lang, setLang] = useState<PDFLang>(state.pdfLang);
  const [vetName, setVetName] = useState(state.vet.name);
  const [vetNum, setVetNum] = useState(state.vet.num);
  const [vetSaved, setVetSaved] = useState(!!(state.vet.name && state.vet.num));
  const [editingVet, setEditingVet] = useState(!vetSaved);

  useEffect(() => {
    setLang(state.pdfLang);
    setVetName(state.vet.name);
    setVetNum(state.vet.num);
    const saved = !!(state.vet.name && state.vet.num);
    setVetSaved(saved);
    setEditingVet(!saved);
  }, [open, state.vet, state.pdfLang]);

  if (!open) return null;

  const handleLang = (l: PDFLang) => {
    setLang(l);
    dispatch({ type: 'SET_PDF_LANG', lang: l });
  };

  const handleSaveVet = () => {
    if (!vetName.trim() || !/^\d{10}$/.test(vetNum)) {
      toast('Enter vet name and valid 10-digit mobile.');
      return;
    }
    const v: VetInfo = { name: vetName.trim(), num: vetNum };
    setVet(v);
    setVetSaved(true);
    setEditingVet(false);
    toast('Vet info saved!');
  };

  const trialStatus = getTrialStatus(state.startDate, state.subscribed);

  const renderSubCard = () => {
    if (state.subscribed) {
      return (
        <div className="sub-info-card" style={{ background: 'var(--glt)', borderRadius: 'var(--rs)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--g)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ✓ Subscribed — Active
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginTop: '4px' }}>
            PoopSense AI Pro · ₹499/month
          </div>
        </div>
      );
    }
    const left = trialStatus.daysLeft;
    return (
      <div className="sub-info-card" style={{ background: left > 0 ? 'var(--sf2)' : '#FFF0EE', borderRadius: 'var(--rs)', padding: '12px 14px' }}>
        <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '6px' }}>
          {left > 0 ? `Free trial: ${left} day${left === 1 ? '' : 's'} remaining` : 'Free trial ended'}
        </div>
        <button
          className="btn"
          style={{ fontSize: '12px', width: '100%' }}
          onClick={onSubscribe}
        >
          Subscribe — ₹499/month
        </button>
        {/* Dev shortcut */}
        <button
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '6px',
            background: 'transparent',
            border: '1px dashed var(--bd)',
            borderRadius: '8px',
            fontSize: '10px',
            color: 'var(--t3)',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
          }}
          onClick={() => { activateSub(); toast('Dev: subscription activated!'); }}
        >
          [Dev] Activate subscription
        </button>
      </div>
    );
  };

  return (
    <div
      className={`modal-bg${open ? ' open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <div className="modal-h">
          <div className="modal-title">Settings</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Language */}
        <div className="clbl" style={{ marginBottom: '8px' }}>Default Report Language</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`lang-btn${lang === 'en' ? ' on' : ''}`}
            onClick={() => handleLang('en')}
          >
            English
          </button>
          <button
            className={`lang-btn${lang === 'hi' ? ' on' : ''}`}
            onClick={() => handleLang('hi')}
          >
            हिंदी Hindi
          </button>
        </div>

        {/* Vet Info */}
        <div className="sett-section">
          <div className="clbl" style={{ marginBottom: '10px' }}>Vet Info</div>

          {vetSaved && !editingVet ? (
            <div
              style={{
                display: 'none',
                background: 'var(--glt)',
                borderRadius: 'var(--rs)',
                padding: '12px 14px',
                marginBottom: '10px',
                ...(vetSaved && !editingVet ? { display: 'block' } : {}),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--g)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ✓ Vet info saved successfully
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginTop: '4px' }}>
                    {state.vet.name} · +91 {state.vet.num}
                  </div>
                </div>
                <button
                  onClick={() => setEditingVet(true)}
                  style={{
                    background: 'none',
                    border: '1.5px solid var(--bd)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--t2)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="fg">
                <label className="fl">Vet Name</label>
                <input
                  className="fi"
                  type="text"
                  placeholder="e.g. Dr. Sharma"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                />
              </div>
              <div className="fg">
                <label className="fl">Vet Mobile</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--t2)',
                    }}
                  >
                    +91
                  </span>
                  <input
                    className="fi"
                    type="tel"
                    placeholder="10-digit mobile"
                    style={{ paddingLeft: '34px' }}
                    maxLength={10}
                    value={vetNum}
                    onChange={(e) => setVetNum(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <button className="btn" style={{ fontSize: '12px' }} onClick={handleSaveVet}>
                Save Vet Info
              </button>
            </div>
          )}
        </div>

        {/* Subscription */}
        <div className="sett-section">
          <div className="clbl" style={{ marginBottom: '12px' }}>Subscription</div>
          {renderSubCard()}
        </div>

        {/* Footer */}
        <div className="sett-section" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'var(--t3)', lineHeight: 1.7 }}>
            PoopSense AI v3.0 · Doglicious.in
            <br />
            Claude Vision AI · Poppins
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;