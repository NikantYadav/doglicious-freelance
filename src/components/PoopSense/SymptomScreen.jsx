import React, { useState } from 'react';

const NORMAL_SYMPTOMS = ['Normal diet', 'Normal water intake', 'No pain/bloat', 'Normal frequency'];
const BAD_SYMPTOMS = ['Diet change (24h)', 'Low water intake', 'Pain/bloat signs', 'Frequent stools', 'Vomiting', 'Blood visible', 'Mucus visible', 'Straining'];

export const SymptomScreen = ({ dog, onBack, onAnalyse }) => {
  const [selected, setSelected] = useState(new Set());
  const [notes, setNotes] = useState('');

  const toggle = (pill) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pill)) next.delete(pill);
      else next.add(pill);
      return next;
    });
  };

  const handleAnalyse = () => {
    const pills = [...selected];
    const symptoms = {
      diet: pills.includes('Diet change (24h)') ? 'Changed in 24h' : 'Normal',
      water: pills.includes('Low water intake') ? 'Low' : 'Normal',
      pain: pills.includes('Pain/bloat signs') ? 'Yes' : 'No',
      freq: pills.includes('Frequent stools') ? 'Frequent' : 'Normal',
      other: [
        pills.includes('Vomiting') ? 'Vomiting' : '',
        pills.includes('Blood visible') ? 'Blood' : '',
        pills.includes('Mucus visible') ? 'Mucus' : '',
        pills.includes('Straining') ? 'Straining' : '',
        notes.trim(),
      ].filter(Boolean).join(', '),
      pills,
    };
    onAnalyse(symptoms);
  };

  return (
    <>
      <div className="nhdr">
        <div className="nhdr-row">
          <button className="nbk" onClick={onBack} type="button">← Back</button>
        </div>
      </div>

      <div className="ph">
        <h2>Symptom Check</h2>
        <p>Select any symptoms for {dog?.name ?? 'your dog'} — helps AI give better insights</p>
      </div>

      <div className="content">
        <div className="prefill-banner">
          ✓ AI learns from symptoms you report to give more accurate analysis
        </div>

        <div className="sym-label">Normal signs (tap to confirm)</div>
        <div className="sym-pills">
          {NORMAL_SYMPTOMS.map((s) => (
            <button key={s} type="button" className={`sym-pill${selected.has(s) ? ' on' : ''}`} onClick={() => toggle(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="sym-label" style={{ marginTop: 14 }}>Concerning signs</div>
        <div className="sym-pills">
          {BAD_SYMPTOMS.map((s) => (
            <button key={s} type="button" className={`sym-pill bad${selected.has(s) ? ' on' : ''}`} onClick={() => toggle(s)}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="fl">Additional notes (optional)</label>
          <textarea
            className="fi"
            rows={3}
            placeholder="Any other observations about the stool or your dog's behaviour…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <button className="btn" onClick={handleAnalyse} style={{ marginTop: 14 }} type="button">
          🔬 Analyse with AI →
        </button>

        <p style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
          Powered by Claude Vision AI · Results are for informational purposes only
        </p>
      </div>
    </>
  );
};
