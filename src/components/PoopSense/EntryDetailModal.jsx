import React from 'react';
import { fmtDateShort } from './helpers';

export const EntryDetailModal = ({ isOpen, entry, onClose, onDownloadPDF }) => {
  if (!entry) return null;
  const rk = entry.risk;

  return (
    <div className={`modal-bg${isOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
        {entry.imgB64 && (
          <img className="em-img" src={`data:image/jpeg;base64,${entry.imgB64}`} alt="Scan" />
        )}
        <div className="em-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="modal-title" style={{ fontSize: 16 }}>Scan Detail</div>
            <button className="modal-close" onClick={onClose} type="button">✕</button>
          </div>

          <div className="em-score-row">
            <div className={`em-score-circle ${rk}`}>{entry.score}</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>{fmtDateShort(entry.date)} · {entry.time}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand)' }}>{entry.stoolType}</div>
            </div>
          </div>

          <div className="em-grid">
            {[
              { l: 'Type', v: entry.stoolType },
              { l: 'Bristol', v: `Type ${entry.bristolScore}/7` },
              { l: 'Colour', v: entry.color },
              { l: 'Consistency', v: entry.consistency },
            ].map(({ l, v }) => (
              <div key={l} className="em-cell">
                <div className="el-lbl">{l}</div>
                <div className="el-val">{v}</div>
              </div>
            ))}
          </div>

          <div className="em-sum">{entry.sum}</div>

          {entry.simpleEn && (
            <div style={{ background: 'linear-gradient(135deg,#E8F4FD,#D6EAF8)', border: '1px solid rgba(52,152,219,.25)', borderRadius: 10, padding: '10px 12px', margin: '10px 0', fontSize: 12, color: '#1A3550', lineHeight: 1.65 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1A5276', marginBottom: 4 }}>In simple terms…</div>
              <div>{entry.simpleEn}</div>
            </div>
          )}

          <button className="btn btn-out" style={{ marginTop: 4, fontSize: 12 }} onClick={() => onDownloadPDF(entry)} type="button">
            📄 Download this scan as PDF
          </button>
        </div>
      </div>
    </div>
  );
};
