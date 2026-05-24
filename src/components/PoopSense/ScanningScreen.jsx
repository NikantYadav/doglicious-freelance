import React, { useEffect, useState } from 'react';

const STEPS = [
  'Uploading photo securely',
  'Claude Vision analysing image',
  'Extracting stool parameters',
  'Calculating health score',
  'Generating recommendations',
];

export const ScanningScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="content scan-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sorb">💩</div>
      <div className="sttl">Analysing stool sample…</div>
      <div className="ssub">Claude Vision AI is processing your photo</div>

      <ul className="slist">
        {STEPS.map((s, i) => {
          const cls = i < step ? 'done' : i === step ? 'act' : '';
          return (
            <li key={s} className={cls}>
              <span className="sdot" />
              {i < step ? '✓ ' : ''}{s}
            </li>
          );
        })}
      </ul>

      <div className="ai-status">
        <div className="ai-dot" />
        <div className="ai-dot" />
        <div className="ai-dot" />
        <span>Claude Vision processing</span>
      </div>
    </div>
  );
};
