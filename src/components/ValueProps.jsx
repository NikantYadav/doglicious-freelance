import React from 'react';
import { foodImg } from '../data/homeData';

export default function ValueProps() {
    return (
        <>
            <section id="why" style={{ padding: "80px 0", background: "white" }}>
                <div className="wrap">
                    <div style={{ textAlign: "center", marginBottom: "60px" }} className="sg">
                        <span className="lbl rv">Bio-available Nutrition</span>
                        <h2 className="title rv">Why switch to fresh?</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }} className="sg">
                        {[
                            { em: '✨', t: 'Cleaner Skin & Coat', d: 'Glow from within. Real proteins and healthy fats reduce itching and seasonal shedding.' },
                            { em: '🔋', t: 'Higher Vitality', d: 'Watch their energy levels soar. No more carb-crashes from grain-heavy kibble fillers.' },
                            { em: '⚖️', t: 'Perfect Weight', d: 'Lean muscles, healthy heart. High protein recipes help manage weight without starvation.' },
                            { em: '💩', t: 'Better Digestion', d: 'Smaller, firmer, less smelly stools. A sign their body is actually absorbing the food.' }
                        ].map((p, i) => (
                            <div key={i} className="card rv" style={{ padding: "40px", textAlign: "center" }}>
                                <div style={{ fontSize: "32px", marginBottom: "20px" }}>{p.em}</div>
                                <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px", color: "var(--t1)" }}>{p.t}</h3>
                                <p style={{ fontSize: "14px", color: "var(--t3)", lineHeight: "1.6" }}>{p.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: "100px 0", overflow: "hidden" }}>
                <div className="wrap">
                    <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: "80px", alignItems: "center" }} className="sg">
                        <div className="rv">
                            <div style={{ position: "relative" }}>
                                <img src={foodImg} alt="Fresh Ingredients" style={{ width: "100%", height: "540px", objectFit: "cover", borderRadius: "1000px 1000px 0 0", boxShadow: "0 40px 100px rgba(0,0,0,.15)" }} />
                                <div style={{ position: "absolute", top: "40px", right: "-40px", background: "var(--brown)", color: "white", padding: "24px", borderRadius: "24px", width: "180px", boxShadow: "0 20px 40px rgba(0,0,0,.2)" }}>
                                    <div style={{ fontSize: "24px", fontWeight: "800", marginBottom: "4px" }}>80%</div>
                                    <div style={{ fontSize: "11px", fontWeight: "700", opacity: ".8", textTransform: "uppercase", letterSpacing: ".05em" }}>Human Grade Animal Protein</div>
                                </div>
                            </div>
                        </div>
                        <div className="rv">
                            <span className="lbl">The Golden Standard</span>
                            <h2 className="title" style={{ fontSize: "42px", lineHeight: "1.1", marginBottom: "24px" }}>If you wouldn't eat it, your dog shouldn't either.</h2>
                            <p className="lead" style={{ marginBottom: "40px" }}>We don't use 'rendered meats' or 'animal by-products'. Every recipe uses farm-fresh meat, heart-healthy vegetables, and Ayurvedic herbs chosen by nutritionists.</p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {[
                                    { t: 'Human Grade Sourcing', d: 'We source from the same suppliers that serve top restaurants.' },
                                    { t: 'No Mysterious Fillers', d: 'Zero corn, wheat, soy or artificial preservatives. Ever.' },
                                    { t: 'Vitamins from Nature', d: 'Minerals sourced from whole foods like sea kelp and organic seeds.' }
                                ].map((it, i) => (
                                    <div key={i} style={{ display: "flex", gap: "16px" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--brown-l)", color: "var(--brown)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: "0", marginTop: "2px" }}>✓</div>
                                        <div>
                                            <div style={{ fontWeight: "700", color: "var(--t1)", marginBottom: "4px" }}>{it.t}</div>
                                            <div style={{ fontSize: "13px", color: "var(--t3)" }}>{it.d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ padding: "80px 0", background: "white" }}>
                <div className="wrap">
                    <div className="card sg rv" style={{ background: "var(--t1)", color: "white", padding: "80px 40px", borderRadius: "48px", overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", top: "0", right: "0", width: "40%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.03))" }}></div>
                        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative" }}>
                            <span className="lbl" style={{ color: "var(--brown-l)" }}>Ayurvedic Wisdom</span>
                            <h2 className="title" style={{ color: "white", fontSize: "38px" }}>Traditional ingredients for modern healing.</h2>
                            <p style={{ color: "rgba(255,255,255,.6)", fontSize: "17px", lineHeight: "1.6", marginBottom: "40px" }}>We infuse every batch with functional ingredients that tackle Indian canine health challenges — from heat-induced inflammation to seasonal immunity.</p>

                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
                                {['Curcumin', 'Ashwagandha', 'Moringa', 'Virgin Coconut Oil', 'Pumpkin Seeds', 'Triphala', 'Sea Kelp'].map((ing, i) => (
                                    <span key={i} style={{ padding: "10px 20px", borderRadius: "100px", border: "1px solid rgba(255,255,255,.15)", fontSize: "13px", fontWeight: "600" }}>{ing}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
