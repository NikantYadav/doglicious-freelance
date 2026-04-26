import React from 'react';

export default function TrustSection() {
    return (
        <section style={{ padding: "80px 0", background: "var(--cream)" }}>
            <div className="wrap">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "60px", alignItems: "center" }} className="sg">
                    <div className="rv">
                        <h2 className="title" style={{ fontSize: "36px" }}>Don't take our word for it. Read the lab report.</h2>
                        <p className="lead" style={{ marginBottom: "30px" }}>Every single batch of Doglicious is independently tested by NABL-accredited laboratories. We print the specific report for your batch and include it with your delivery.</p>
                        <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid var(--b2)" }}>
                            <div style={{ fontSize: "12px", color: "var(--t3)", textTransform: "uppercase", fontWeight: "700", marginBottom: "16px" }}>What we test for:</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                {['❌ Pathogenic Bacteria', '❌ Aflatoxins & Mould', '✅ Crude Protein %', '✅ Crude Fat %', '✅ Accurate Caloric Count', '✅ Moisture Balance'].map((t, i) => (
                                    <div key={i} style={{ fontSize: "13px", fontWeight: "600", color: "var(--t2)" }}>{t}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="rv" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ background: "white", height: "300px", borderRadius: "20px", border: "1px solid var(--b2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", opacity: ".3" }}>Sample Report Page 1</span>
                        </div>
                        <div style={{ background: "white", height: "300px", borderRadius: "20px", border: "1px solid var(--b2)", marginTop: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", opacity: ".3" }}>Sample Report Page 2</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
