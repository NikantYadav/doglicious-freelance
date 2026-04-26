import React from 'react';

export default function IngredientsSection() {
    const cardStyle = {
        background: "var(--cream)",
        border: ".5px solid var(--b1)",
        borderRadius: "24px",
        padding: "clamp(18px,4vw,32px)",
        transition: "all .25s",
        cursor: "default",
        overflow: "hidden",
        position: "relative",
    };
    const darkCardStyle = {
        ...cardStyle,
        background: "var(--warm-panel2)",
        border: ".5px solid var(--b2)",
    };
    const emojiStyle = { fontSize: "clamp(36px,6vw,52px)", marginBottom: "18px", lineHeight: "1", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.08))" };
    const catStyle = { fontSize: "11px", fontWeight: "700", letterSpacing: ".09em", textTransform: "uppercase", color: "var(--brown)", marginBottom: "8px" };
    const h3Style = { fontSize: "clamp(16px,2.5vw,20px)", fontWeight: "700", color: "var(--t1)", marginBottom: "14px", letterSpacing: "-.03em" };
    const rowStyle = (last) => ({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", padding: "8px 0", borderBottom: last ? "none" : ".5px solid var(--b1)" });
    const nameStyle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "clamp(11px,2vw,13px)", fontWeight: "600", color: "var(--t1)" };
    const benefitStyle = { fontSize: "11px", color: "var(--green)", fontWeight: "600", whiteSpace: "nowrap" };
    const badStyle = { fontSize: "11px", color: "#e05050", fontWeight: "600" };

    return (
        <section id="ingredients" style={{ background: "var(--cream-2)" }}>
            <div className="wrap">
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", marginBottom: "clamp(28px,5vw,48px)" }} className="rv">
                    <div>
                        <span className="lbl" style={{ display: "block", marginBottom: "10px" }}>Ingredients</span>
                        <h2 className="title">What goes inside.</h2>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--brown)", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "9px 18px", borderRadius: "var(--r-max)" }}>🏆 Human Grade Only</div>
                </div>

                <div className="ing-grid sg">
                    {/* Protein */}
                    <div style={cardStyle}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.08)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(0,0,0,.055)'; }}>
                        <div style={emojiStyle}>🥩</div>
                        <div style={catStyle}>Protein</div>
                        <h3 style={h3Style}>Fresh Protein</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[["🍗","Farm-Fresh Chicken","Lean · Rich protein"],["🐑","Tender Lamb","Iron · Energy boost"],["🐟","White Fish","Omega-3 · Coat glow"],["🧀","Paneer (veg)","Calcium · Bone health"]].map(([em,name,ben],i,a)=>(
                                <div key={i} style={rowStyle(i===a.length-1)}>
                                    <div style={nameStyle}><span style={{fontSize:"18px"}}>{em}</span>{name}</div>
                                    <span style={benefitStyle}>{ben}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vegetables */}
                    <div style={cardStyle}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.08)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(0,0,0,.055)'; }}>
                        <div style={emojiStyle}>🥕</div>
                        <div style={catStyle}>Vegetables</div>
                        <h3 style={h3Style}>Organic Vegetables</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {[["🍠","Sweet Potato","Energy · Fibre"],["🎃","Pumpkin","Gut · Digestion"],["🥕","Carrot","Vision · Beta-carotene"],["🌿","Spinach","Iron · Antioxidant"],["🥦","Broccoli","Vitamins · Immunity"],["🫑","Green Beans","Low cal · Crunch"],["🫛","Peas","Protein · Potassium"]].map(([em,name,ben],i,a)=>(
                                <div key={i} style={{...rowStyle(i===a.length-1), padding:"7px 0"}}>
                                    <div style={{...nameStyle, fontSize:"clamp(11px,2vw,13px)"}}><span style={{fontSize:"17px"}}>{em}</span>{name}</div>
                                    <span style={benefitStyle}>{ben}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carbs */}
                    <div style={cardStyle}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.08)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(0,0,0,.055)'; }}>
                        <div style={emojiStyle}>🌾</div>
                        <div style={catStyle}>Carbohydrates</div>
                        <h3 style={h3Style}>Complex Carbs</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[["🍚","Brown Rice","Fibre · Slow energy"],["🍚","White Rice","Easy · Gut gentle"],["🌿","Quinoa","Complete protein"],["🌾","Millets","Gluten-free · Rich"]].map(([em,name,ben],i,a)=>(
                                <div key={i} style={rowStyle(i===a.length-1)}>
                                    <div style={nameStyle}><span style={{fontSize:"18px"}}>{em}</span>{name}</div>
                                    <span style={benefitStyle}>{ben}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zero Preservatives */}
                    <div style={darkCardStyle}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}>
                        <div style={emojiStyle}>🚫</div>
                        <div style={catStyle}>Promise</div>
                        <h3 style={h3Style}>Zero Preservatives</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[["🚫","No artificial colors","Toxic · Avoid"],["🚫","No preservatives","Carcinogenic risk"],["🚫","No fillers","Empty calories"],["🚫","No sugars or salt","Harmful · Skip"]].map(([em,name,risk],i,a)=>(
                                <div key={i} style={rowStyle(i===a.length-1)}>
                                    <div style={nameStyle}><span style={{fontSize:"18px"}}>{em}</span>{name}</div>
                                    <span style={badStyle}>{risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
