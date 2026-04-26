import React from 'react';
import ModalContainer from './ModalContainer';

export default function QuizModal({ isOpen, onClose, quizStep, setQuizStep, quizName, setQuizName, quizAnswers, setQuizAnswers, openModal }) {
    const goNext = (s) => {
        if (s === 1) {
            const n = quizName.trim();
            if (!n) return;
        }
        setQuizStep(s);
    };

    const selQ = (key, val) => setQuizAnswers(prev => ({ ...prev, [key]: val }));

    return (
        <ModalContainer isOpen={isOpen} onClose={onClose} title="Your dog's plan">
            <div className="qpg">
                {[0, 1, 2, 3, 4].map(i => <div key={i} className={`qdot${i <= quizStep ? ' dn' : ''}`} />)}
            </div>

            {/* Step 0: Name */}
            {quizStep === 0 && (
                <div>
                    <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "10px" }}>What's your dog's name?</p>
                    <input className="ifield" value={quizName} onChange={e => setQuizName(e.target.value)} placeholder="e.g. Bruno" style={{ marginBottom: "12px" }} />
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => goNext(1)}>Next →</button>
                </div>
            )}

            {/* Step 1: Age */}
            {quizStep === 1 && (
                <div>
                    <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "4px" }}>How old is <strong>{quizName || 'your dog'}</strong>?</p>
                    <div className="qog">
                        {[['🐣', 'Puppy', 'Under 1 yr', 'Puppy'], ['🌱', 'Young', '1–3 yrs', 'Young'], ['🐕', 'Adult', '3–7 yrs', 'Adult'], ['🧓', 'Senior', '7+ yrs', 'Senior']].map(([em, label, sub, val]) => (
                            <div key={val} className={`qop${quizAnswers.age === val ? ' sel' : ''}`} onClick={() => selQ('age', val)}>
                                {em} {label}<br /><small style={{ color: "var(--t3)" }}>{sub}</small>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => goNext(2)}>Next →</button>
                </div>
            )}

            {/* Step 2: Size */}
            {quizStep === 2 && (
                <div>
                    <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "4px" }}>How big is <strong>{quizName || 'your dog'}</strong>?</p>
                    <div className="qog">
                        {[['🐩', 'Small', 'Under 10kg', 'Small'], ['🐕', 'Medium', '10–25kg', 'Medium'], ['🦮', 'Large', '25–40kg', 'Large'], ['🐕‍🦺', 'XL', '40kg+', 'XL']].map(([em, label, sub, val]) => (
                            <div key={val} className={`qop${quizAnswers.size === val ? ' sel' : ''}`} onClick={() => selQ('size', val)}>
                                {em} {label}<br /><small style={{ color: "var(--t3)" }}>{sub}</small>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => goNext(3)}>Next →</button>
                </div>
            )}

            {/* Step 3: Goals */}
            {quizStep === 3 && (
                <div>
                    <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "4px" }}>Health goals?</p>
                    <div className="qog" style={{ gridTemplateColumns: "1fr" }}>
                        {['⚖️ Weight Management', '💪 Shiny Coat & Skin', '🦴 Joint & Bone Health', '🧠 Better Digestion'].map(g => (
                            <div key={g} className={`qop${quizAnswers.goals?.includes(g) ? ' sel' : ''}`}
                                onClick={() => {
                                    const goals = quizAnswers.goals || [];
                                    setQuizAnswers(prev => ({ ...prev, goals: goals.includes(g) ? goals.filter(x => x !== g) : [...goals, g] }));
                                }}>{g}</div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                        <button className="btn btn-soft btn-sm" style={{ flex: "1", justifyContent: "center" }} onClick={() => goNext(4)}>Skip</button>
                        <button className="btn btn-primary btn-sm" style={{ flex: "2", justifyContent: "center" }} onClick={() => goNext(4)}>Next →</button>
                    </div>
                </div>
            )}

            {/* Step 4: Result */}
            {quizStep === 4 && (
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "44px", marginBottom: "10px" }}>🎉</div>
                    <h3 style={{ fontFamily: "'Poppins',sans-serif", fontStyle: "italic", fontSize: "22px", marginBottom: "6px" }}>Plan ready!</h3>
                    <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "14px" }}>
                        Based on {quizName || 'your dog'}'s profile, we recommend Chicken &amp; Pumpkin to start. Full plan via WhatsApp.
                    </p>
                    <div style={{ background: "var(--cream-2)", borderRadius: "var(--r-md)", padding: "14px", textAlign: "left", marginBottom: "16px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".07em", color: "var(--t3)", marginBottom: "8px" }}>Recommended</div>
                        <div style={{ fontSize: "12px", color: "var(--t2)", display: "flex", flexDirection: "column", gap: "5px" }}>
                            <span>✓ Chicken &amp; Pumpkin recipe (starter)</span>
                            <span>✓ Starting portion: 200g/day</span>
                            <span>✓ Full plan sent via WhatsApp</span>
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }} onClick={() => { onClose(); setTimeout(() => openModal('sample'), 150); }}>Book sample for ₹99</button>
                    <a href="https://wa.me/919889887980?text=Hi!%20I%20completed%20the%20dog%20quiz%20and%20want%20my%20personalised%20plan!" target="_blank" rel="noreferrer" className="btn btn-wa" style={{ width: "100%", justifyContent: "center" }}>💬 Get full plan on WhatsApp</a>
                </div>
            )}
        </ModalContainer>
    );
}
