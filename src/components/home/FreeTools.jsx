import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FreeTools({ openTool }) {
    const navigate = useNavigate();

    const handleTool = (idx) => {
        if (idx === 0) { navigate('/tools/bmi-calculator');      }
        else if (idx === 1) { navigate('/tools/feeding-calculator');  }
        else if (idx === 2) { navigate('/tools/cost-calculator');     }
        else if (idx === 3) { navigate('/tools/age-calculator');      }
        else if (idx === 4) { navigate('/tools/best-vegetables');     }
        else if (idx === 5) { navigate('/tools/natural-healing');     }
        else if (idx === 6) { navigate('/tools/aafco-planner');       }
        else if (idx === 7) { navigate('/tools/health-quiz');         }
        else { openTool(idx); }
    };
    return (
        <>
            <section id="free-tools-section" style={{ background: "var(--cream)" }}>
                <div className="wrap">
                    <div className="sh c rv">
                        <span className="lbl">100% Free · No Sign-up</span>
                        <h2 className="title">Free tools for dog parents.</h2>
                        <p className="lead mt12">Science-backed tools built for Indian dog parents. Know more, feed better — all completely free.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "14px" }} className="sg free-tools-grid-resp">
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            }
                            title="Dog BMI Calculator"
                            desc="Is your dog at a healthy weight? Check instantly by breed and age."
                            onClick={() => handleTool(0)}
                        />
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
                            }
                            title="Feeding Calculator"
                            desc="How much should your dog eat daily? Calculated for their exact weight and activity."
                            onClick={() => handleTool(1)}
                        />
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            }
                            title="Cost Calculator"
                            desc="Fresh food vs kibble — see the real cost comparison over a month and a year."
                            onClick={() => handleTool(2)}
                        />
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            }
                            title="Age Calculator"
                            desc="How old is your dog in human years? Understand their life stage and what it means for nutrition."
                            onClick={() => handleTool(3)}
                        />
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 .46 1.61A3 3 0 0 0 9 15h6a3 3 0 0 0 2.54-4.39A3 3 0 0 0 18 8a3 3 0 0 0-3-3 3 3 0 0 0-3-3z" /><line x1="12" y1="15" x2="12" y2="22" /></svg>
                            }
                            title="Safe Vegetables Guide"
                            desc="Which vegetables are safe for dogs? Complete guide with portions and what to avoid."
                            onClick={() => handleTool(4)}
                        />
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4" /><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7z" /><path d="M22 19H2" /></svg>
                            }
                            title="Natural Healing Guide"
                            desc="Natural remedies for common dog problems — vet reviewed, evidence-based, Indian context."
                            onClick={() => handleTool(5)}
                        />
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            }
                            title="AAFCO Meal Planner"
                            desc="Build a complete, balanced homemade meal plan that meets AAFCO nutritional standards."
                            onClick={() => handleTool(6)}
                        />
                        <ToolCard
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            }
                            title="Dog Health Quiz"
                            desc="How healthy is your dog right now? 5 minutes to your personalised health score and recommendations."
                            onClick={() => handleTool(7)}
                        />
                    </div>
                </div>
            </section>

            <section id="tools" style={{ background: "var(--cream-2)" }}>
                <div className="wrap">
                    <div className="sh c rv"><span className="lbl">Free Tools</span><h2 className="title">Free nutrition tools.</h2><p className="lead mt12">Science-backed tools built for Indian dog parents. Know more, feed better.</p></div>
                    <div className="toolg sg">
                        <ToolBox icon="⚖️" title="BMI" desc="Is your dog at a healthy weight?" onClick={() => handleTool(0)} />
                        <ToolBox icon="🍽️" title="Feeding" desc="How much should your dog eat daily?" onClick={() => handleTool(1)} />
                        <ToolBox icon="💰" title="Cost" desc="Fresh vs kibble — real cost comparison" onClick={() => handleTool(2)} />
                        <ToolBox icon="📅" title="Age" desc="How old is your dog in human years?" onClick={() => handleTool(3)} />
                        <ToolBox icon="🥦" title="Vegetables" desc="Which vegetables are safe for dogs?" onClick={() => handleTool(4)} />
                        <ToolBox icon="💊" title="Healing" desc="Natural remedies for common dog problems" onClick={() => handleTool(5)} />
                        <ToolBox icon="📋" title="AAFCO" desc="Build a complete, balanced meal plan" onClick={() => handleTool(6)} />
                        <ToolBox icon="🧠" title="Health Quiz" desc="How healthy is your dog right now?" onClick={() => handleTool(7)} />
                    </div>
                </div>
            </section>
        </>
    );
}

function ToolCard({ icon, title, desc, onClick }) {
    return (
        <div
            style={{
                background: "var(--cream-2)",
                border: ".5px solid var(--b1)",
                borderRadius: "20px",
                padding: "28px",
                cursor: "pointer",
                transition: "all .25s",
                display: "flex",
                gap: "18px",
                alignItems: "flex-start"
            }}
            onClick={onClick}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.07)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,.12)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(0,0,0,.055)' }}
        >
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                {icon}
            </div>
            <div style={{ flex: "1" }}>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--t1)", marginBottom: "4px", letterSpacing: "-.02em" }}>{title}</div>
                <div style={{ fontSize: "13px", color: "var(--t2)", lineHeight: "1.55", marginBottom: "10px" }}>{desc}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "600", color: "var(--brown)" }}>
                    Use free tool <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
            </div>
        </div>
    );
}

function ToolBox({ icon, title, desc, onClick }) {
    return (
        <div className="toolc" onClick={onClick}>
            <div className="tool-ic">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <span className="toolf">Free</span>
        </div>
    );
}
