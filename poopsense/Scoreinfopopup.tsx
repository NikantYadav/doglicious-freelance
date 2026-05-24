import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ScoreInfoPopup: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="score-info-popup"
      style={{ display: 'flex' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="score-info-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#3A2700' }}>
            📈 How is the Health Score calculated?
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(58,39,0,.08)',
              border: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#5C3F18', lineHeight: 1.65, marginBottom: '14px' }}>
          The <strong>PoopSense AI Health Score (0–100)</strong> is computed by Claude Vision AI by analysing
          your dog's stool photograph across 5 key parameters. Each parameter is weighted based on its clinical
          importance:
        </div>

        {/* Parameters */}
        <div className="score-band" style={{ background: '#EAF8EF' }}>
          <div style={{ fontSize: '20px' }}>🟡</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#195C30' }}>Colour (20 pts)</div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              Healthy = medium brown. Abnormal colours (black, red, grey, yellow, green) lower the score.
            </div>
          </div>
        </div>

        <div className="score-band" style={{ background: '#EAF8EF' }}>
          <div style={{ fontSize: '20px' }}>🧽</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#195C30' }}>Consistency (25 pts)</div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              Bristol Scale 3–4 is ideal. Too watery or too hard each reduce the score significantly.
            </div>
          </div>
        </div>

        <div className="score-band" style={{ background: '#EAF8EF' }}>
          <div style={{ fontSize: '20px' }}>🔬</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#195C30' }}>Shape (15 pts)</div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              Well-formed sausage shape is ideal. Fragmented, pellet-like, or formless shapes indicate digestive issues.
            </div>
          </div>
        </div>

        <div className="score-band" style={{ background: '#EAF8EF' }}>
          <div style={{ fontSize: '20px' }}>🔍</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#195C30' }}>Contents (20 pts)</div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              Presence of mucus, blood, parasites, undigested food or foreign material reduces the score.
            </div>
          </div>
        </div>

        <div className="score-band" style={{ background: '#EAF8EF' }}>
          <div style={{ fontSize: '20px' }}>📊</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#195C30' }}>Risk Pattern (20 pts)</div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              Overall clinical risk assessment. Detected patterns such as repeated soft stools, urgency, or blood reduce this score.
            </div>
          </div>
        </div>

        {/* Score bands */}
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#3A2700', margin: '14px 0 8px' }}>Score Bands</div>

        <div className="score-band" style={{ background: '#EAF8EF' }}>
          <div style={{ fontSize: '18px' }}>✅</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#195C30' }}>75–100 — Healthy</div>
            <div style={{ fontSize: '11px', color: '#555' }}>Stool looks normal. Routine diet and hydration are fine.</div>
          </div>
        </div>

        <div className="score-band" style={{ background: '#FFF8EE' }}>
          <div style={{ fontSize: '18px' }}>⚠️</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#C47808' }}>50–74 — Monitor</div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              Some concern noted. Keep an eye, offer bland food. Visit vet if it continues.
            </div>
          </div>
        </div>

        <div className="score-band" style={{ background: '#FFF0EE' }}>
          <div style={{ fontSize: '18px' }}>🚫</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#AD2218' }}>0–49 — Urgent</div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              Significant abnormality detected. Consult your vet as soon as possible.
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FFF8EE',
            borderRadius: '10px',
            padding: '10px 12px',
            marginTop: '12px',
            fontSize: '11px',
            color: '#5C3F18',
            lineHeight: 1.5,
          }}
        >
          🫶 This score is generated by AI for informational purposes only. Please always verify with your
          veterinarian, who can best guide your pet's care.
        </div>
      </div>
    </div>
  );
};

export default ScoreInfoPopup;