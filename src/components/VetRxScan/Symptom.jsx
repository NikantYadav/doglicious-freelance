import React from 'react';
import { BODY_PARTS, SYMPTOMS_MAP } from './constants';

const SymptomScreen = ({ bodyPart, selectedSymptoms, onSelectBodyPart, onToggleSymptom, onNext, onBack }) => {
    const isOk = bodyPart && selectedSymptoms.length > 0;
    const btnText = isOk
        ? `Continue with ${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''} →`
        : 'Select area & at least 1 symptom';

    return (
        <div id="screen-symptoms" className="screen active pb-100">
            <div className="header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h2>What's going on?</h2>
                <p>Select body area &amp; symptoms</p>
            </div>

            <div style={{ padding: '20px 16px 0' }}>
                <h3 style={{ color: '#3D2B00', fontSize: '13px', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📍 Affected Area
                </h3>
                <div className="grid-2 mb-24">
                    {BODY_PARTS.map((p) => (
                        <button
                            key={p.id}
                            className={'part-btn' + (bodyPart === p.id ? ' selected' : '')}
                            onClick={() => onSelectBodyPart(p.id)}
                            style={{ minWidth: 0 }}
                        >
                            <span style={{ fontSize: '18px', flexShrink: 0 }}>{p.icon}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{p.id}</span>
                        </button>
                    ))}
                </div>

                {bodyPart && (
                    <div>
                        <h3 style={{ color: '#3D2B00', fontSize: '13px', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🔎 Symptoms Noticed
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                            {(SYMPTOMS_MAP[bodyPart] || []).map((s) => (
                                <span
                                    key={s}
                                    className={'chip' + (selectedSymptoms.includes(s) ? ' selected' : '')}
                                    onClick={() => onToggleSymptom(s)}
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed-bottom">
                <button className="btn btn-primary" onClick={onNext} disabled={!isOk}>
                    {btnText}
                </button>
            </div>
        </div>
    );
};

export default SymptomScreen;
