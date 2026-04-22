import React from 'react';

const QuestionsScreen = ({ questions, currentIndex, onAnswer }) => {
    const qs = questions || [];
    const total = qs.length;
    const q = qs[currentIndex] || { text: '', options: [] };
    const progressPct = total > 0 ? (currentIndex / total) * 100 : 0;

    return (
        <div id="screen-questions" className="screen active" style={{ background: '#FBF6EC' }}>
            <div className="header">
                <p style={{ color: 'rgba(251,246,236,0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Question {currentIndex + 1} of {total}
                </p>
                <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
            </div>

            <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="card" style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '30px', marginBottom: '10px' }}>🤔</div>
                    <h2 style={{ color: '#3D2B00', fontSize: '18px', fontWeight: 800, lineHeight: 1.4 }}>
                        {q.text}
                    </h2>
                </div>

                <div>
                    {q.options.map((opt) => (
                        <button key={opt} className="q-option" onClick={() => onAnswer(opt)}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionsScreen;
