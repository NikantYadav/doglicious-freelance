import React, { useState } from 'react';

const FollowUpScreen = ({ report, dogProfile, onReset }) => {
    const [choice, setChoice] = useState(null);
    const dog = dogProfile || {};
    const r = report || {};
    const dogName = dog.name || 'your dog';

    const outcomes = {
        better: {
            emoji: '🎉',
            title: 'Excellent progress!',
            color: '#2D6A2D',
            msg: `${dogName} is responding well. Continue the full ${r.daysToImprove || 10}-day plan for complete recovery.`,
            tip: "Consistency is key — don't stop treatment early even when improving.",
        },
        same: {
            emoji: '⏳',
            title: 'Give it a bit more time',
            color: '#D97706',
            msg: 'Some conditions take 3–5 days to respond. Keep the routine and watch for directional change.',
            tip: 'If no improvement after 5 days total, schedule an in-person vet visit.',
        },
        worse: {
            emoji: '🚨',
            title: 'Please see a vet today',
            color: '#B33A3A',
            msg: 'Worsening symptoms require professional examination. Book an appointment immediately.',
            tip: 'Share this VetRx Scan report with your vet for context.',
        },
    };

    return (
        <div id="screen-followup" className="screen active pb-40">
            <div className="header">
                <h2>📅 2-Day Follow-Up</h2>
                <p>How is {dogName} doing?</p>
            </div>

            <div className="p-16" style={{ paddingTop: '24px' }}>
                {!choice ? (
                    <>
                        <div className="card text-center mb-16">
                            <p style={{ color: '#3D2B00', fontSize: '15px', fontWeight: 700 }}>
                                It's been 2 days since the<br />
                                <strong>{r.diagnosis || 'diagnosis'}</strong> diagnosis.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                ['better', '🟢 Getting better', 'Symptoms improving'],
                                ['same',   '🟡 About the same', 'No noticeable change'],
                                ['worse',  '🔴 Getting worse',  'Symptoms worsening'],
                            ].map(([k, label, sub]) => (
                                <button
                                    key={k}
                                    onClick={() => setChoice(k)}
                                    style={{
                                        background: '#fff',
                                        border: '2px solid #E0D5C0',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s',
                                        width: '100%',
                                        minHeight: '64px',
                                        WebkitAppearance: 'none',
                                    }}
                                >
                                    <p style={{ color: '#2A1E00', fontSize: '16px', fontWeight: 700, margin: 0 }}>{label}</p>
                                    <p style={{ color: '#9B7E4A', fontSize: '12px', margin: '2px 0 0' }}>{sub}</p>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="card text-center mb-16">
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{outcomes[choice].emoji}</div>
                            <h3 style={{ color: outcomes[choice].color, fontSize: '20px', fontWeight: 800, margin: '0 0 12px' }}>
                                {outcomes[choice].title}
                            </h3>
                            <p style={{ color: '#2A1E00', fontSize: '14px', lineHeight: 1.6, margin: '0 0 12px' }}>
                                {outcomes[choice].msg}
                            </p>
                            <div style={{ background: '#FBF6EC', borderRadius: '12px', padding: '12px' }}>
                                <p style={{ color: '#5C4215', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                                    💡 {outcomes[choice].tip}
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://wa.me/919889887980"
                            target="_blank"
                            rel="noreferrer"
                            className="btn-whatsapp mb-12"
                            style={{ marginBottom: '12px' }}
                        >
                            💬 Chat with Doglicious Support
                        </a>
                        <button className="btn btn-secondary" onClick={onReset} style={{ marginTop: '10px' }}>
                            + Start New Diagnosis
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FollowUpScreen;
