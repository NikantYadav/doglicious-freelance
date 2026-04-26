import React from 'react';
import { RECIPES } from '../data/homeData';

export default function RecipesSection({ openModal }) {
    return (
        <section id="recipes" style={{ padding: "100px 0" }}>
            <div className="wrap">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "50px" }} className="sg">
                    <div>
                        <span className="lbl rv">Chef & Vet Crafted</span>
                        <h2 className="title rv">The 2024 Recipe Collection</h2>
                    </div>
                    <button className="btn btn-soft rv" style={{ marginBottom: "12px" }} onClick={() => openModal('quiz')}>Build Personalised Mix →</button>
                </div>

                <div className="recipes-grid sg">
                    {RECIPES.map((r, i) => (
                        <div key={i} className="recipe-card rv" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="recipe-img">
                                <div className="recipe-tag">80% Fresh Protein</div>
                                <div style={{ position: "absolute", bottom: "16px", left: "16px", background: "white", padding: "4px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>Low GI</div>
                            </div>
                            <div className="recipe-content">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--t1)" }}>{r}</h3>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--brown)" }}>₹99/100g</span>
                                </div>
                                <p style={{ fontSize: "11px", color: "var(--t3)", lineHeight: "1.5", marginBottom: "20px" }}>Single source protein with local farm vegetables and cold-pressed oils. Highly palatable for picky eaters.</p>
                                <button className="btn btn-soft btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => openModal('sample')}>Add to Sample Bag</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
