import React from 'react';

export default function Hero({ openModal }) {
    return (
        <section className="hero" id="hero" style={{ padding: "0" }}>
            <div className="wrap" style={{ paddingTop: "0", paddingBottom: "0" }}>
                <div className="hero-l rv">
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--cream-2)", border: ".5px solid var(--b1)", color: "var(--t2)", fontSize: "11px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", padding: "7px 14px", borderRadius: "var(--r-max)", marginBottom: "20px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--brown)", flexShrink: "0", animation: "pd 2s infinite" }}></span>
                        India's First AI Dog Nutrition Company
                    </div>

                    <h1 className="serif-xl" style={{ color: "var(--t1)" }}>Superfood<br />for<br /><em style={{ color: "var(--brown)" }}>dogs.</em></h1>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "14px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "var(--cream-2)", border: ".5px solid var(--b1)", borderRadius: "var(--r-max)", padding: "6px 14px" }}>
                            <span style={{ fontSize: "14px" }}>🐾</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--t1)" }}>5+ Lacs meals served</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "var(--cream-2)", border: ".5px solid var(--b1)", borderRadius: "var(--r-max)", padding: "6px 14px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--t2)" }}>Estd. 2020</span>
                        </div>
                    </div>

                    <div className="hero-tagline">
                        <div className="hero-tagline-line">
                            <div className="htl-ico">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></svg>
                            </div>
                            <div><div className="htl-t">AI-Powered Nutrition</div><div className="htl-s">Personalised per your pet's breed, age &amp; health goals</div></div>
                        </div>
                        <div className="hero-tagline-line">
                            <div className="htl-ico">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2v14a4 4 0 0 1-8 0V2" /><path d="M6.5 6h8M10 2h4" /></svg>
                            </div>
                            <div><div className="htl-t">Backed by Science</div><div className="htl-s">AAFCO-aligned · NABL certified · Vet approved</div></div>
                        </div>
                        <div className="hero-tagline-line">
                            <div className="htl-ico">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            </div>
                            <div><div className="htl-t">Made with Love</div><div className="htl-s">Cooked daily · Served daily at your doorsteps</div></div>
                        </div>
                    </div>

                    <div className="hero-acts">
                        <button className="btn btn-primary" onClick={() => { openModal('vet') }} style={{ fontSize: "15px", padding: "15px 30px" }}>
                            <span style={{ fontSize: "18px" }}>🔍</span> Vet Rx Scan — Free
                        </button>
                        <button className="btn btn-secondary" onClick={() => { openModal('sample') }}>
                            Book a Sample — ₹99
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="hs"><div className="hs-n">100%</div><div className="hs-l">Human-grade</div></div>
                        <div className="hs"><div className="hs-n">0</div><div className="hs-l">Preservatives</div></div>
                        <div className="hs"><div className="hs-n">3h</div><div className="hs-l">Kitchen to bowl</div></div>
                        <div className="hs"><div className="hs-n">∞</div><div className="hs-l">Recipes</div></div>
                    </div>
                </div>
            </div>
            <div className="hero-img">
                <img src="/Happy Dog.webp" alt="Happy dog with fresh food" />
                <div className="hero-card">
                    <div className="hc-live"></div>
                    <div><div className="hc-t">Freshly cooked today</div><div className="hc-s">Delivered same day</div></div>
                </div>
            </div>
        </section>
    );
}
