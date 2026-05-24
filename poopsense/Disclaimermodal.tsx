import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.5)',
        zIndex: 9999,
        padding: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fu .2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#FFF',
          borderRadius: '18px',
          padding: '22px',
          maxWidth: '360px',
          width: '100%',
          boxShadow: '0 12px 40px rgba(0,0,0,.18)',
          position: 'relative',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#EDE6DB',
            border: 'none',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5A3D1A',
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: '15px', fontWeight: 800, color: '#2D1F0A', marginBottom: '9px' }}>
          AI Health Disclaimer
        </div>

        <div style={{ fontSize: '12px', color: '#5A3D1A', lineHeight: 1.7, marginBottom: '9px' }}>
          PoopSense AI uses <strong>Claude Vision AI</strong> to analyse dog stool photos. Results are{' '}
          <strong style={{ color: '#AD2218' }}>not a substitute</strong> for professional veterinary diagnosis.
        </div>

        <div
          style={{
            background: '#F5EFE6',
            border: '1px solid rgba(74,50,24,.12)',
            borderRadius: '9px',
            padding: '9px 11px',
            fontSize: '10.5px',
            color: '#6B4E22',
            lineHeight: 1.6,
          }}
        >
          AI scores are indicative only. This tool does not replace clinical examination.
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '14px',
            width: '100%',
            padding: '11px',
            background: '#2D1F0A',
            color: '#FFF',
            border: 'none',
            borderRadius: '11px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Understood
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;