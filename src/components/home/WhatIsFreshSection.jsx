import React from 'react';

export default function WhatIsFreshSection({ openModal }) {
    return (
        <section id="fresh">
            <div className="wrap">
                <div className="split">
                    <div className="rv">
                        <span className="lbl" style={{ display: "block", marginBottom: "10px" }}>What is Fresh?</span>
                        <h2 className="title" style={{ marginBottom: "12px" }}>Cooked daily.<br />Served daily<br />at your doorsteps.</h2>
                        <p className="lead mt12" style={{ marginBottom: "22px" }}>Real food, real ingredients — not kibble, not processed packs.</p>
                        <div className="ff"><div style={{ width: "44px", height: "44px", flexShrink: "0", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream-3)", borderRadius: "12px" }}>🚫</div><div><h3>Not Kibble</h3><p>Ultra-processed at extreme heat, destroying nutrients. Our food is gently cooked to preserve every vitamin and mineral.</p></div></div>
                        <div className="ff"><div style={{ width: "44px", height: "44px", flexShrink: "0", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream-3)", borderRadius: "12px" }}>🚫</div><div><h3>Not Processed</h3><p>No mystery shelf-life ingredients. Fresh food expires like real food — because it IS real food.</p></div></div>
                        <div className="ff"><div style={{ width: "44px", height: "44px", flexShrink: "0", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef8f3", borderRadius: "12px" }}>✅</div><div><h3>Real Food, Real Ingredients</h3><p>Whole proteins, organic vegetables, complex carbs. Every ingredient visible and traceable.</p></div></div>
                    </div>
                    <div className="rv fresh-stats-box">
                        <div className="fresh-stats-grid">
                            <div className="fresh-stat" style={{ borderRight: ".5px solid var(--b1)", borderBottom: ".5px solid var(--b1)" }}>
                                <div className="fresh-stat-n">100%</div>
                                <div className="fresh-stat-l">Fresh whole-food ingredients</div>
                            </div>
                            <div className="fresh-stat" style={{ borderBottom: ".5px solid var(--b1)" }}>
                                <div className="fresh-stat-n">0</div>
                                <div className="fresh-stat-l">Preservatives, ever</div>
                            </div>
                            <div className="fresh-stat" style={{ borderRight: ".5px solid var(--b1)" }}>
                                <div className="fresh-stat-n">3h</div>
                                <div className="fresh-stat-l">Kitchen to bowl</div>
                            </div>
                            <div className="fresh-stat">
                                <div className="fresh-stat-n">∞</div>
                                <div className="fresh-stat-l">Vet-approved recipes</div>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => openModal('sample')} style={{ width: "100%", justifyContent: "center" }}>Book sample — from ₹99</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
