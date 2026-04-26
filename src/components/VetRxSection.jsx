import React from 'react';

export default function VetRxSection({ openModal }) {
    return (
        <section id="vet" style={{ padding: "100px 0 60px" }}>
            <div className="wrap">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }} className="sg">
                    <div className="rv">
                        <span className="lbl">India's First</span>
                        <h2 className="title" style={{ fontSize: "44px", lineHeight: "1.1", marginBottom: "20px" }}>Scan your vet's prescription. Get AI analysis.</h2>
                        <p className="lead" style={{ marginBottom: "32px" }}>Upload any vet prescription or medical report. Our AI reads the handwritten notes, identifies your dog's sensitivities, and suggests the perfect fresh food plan.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--cream-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: "0" }}>📄</div>
                                <div>
                                    <div style={{ fontWeight: "700", color: "var(--t1)", marginBottom: "4px" }}>Reads Handwriting</div>
                                    <div style={{ fontSize: "13px", color: "var(--t3)", lineHeight: "1.5" }}>Our deep learning model understands vet handwriting and technical medical terms instantly.</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--cream-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: "0" }}>🧬</div>
                                <div>
                                    <div style={{ fontWeight: "700", color: "var(--t1)", marginBottom: "4px" }}>Sensitivity Match</div>
                                    <div style={{ fontSize: "13px", color: "var(--t3)", lineHeight: "1.5" }}>Identifies allergies, chronic conditions, and specific vitamins mentioned by your vet.</div>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ padding: "16px 28px" }} onClick={() => openModal('vet')}>Try Vet Rx Scan — Free →</button>
                    </div>
                    <div className="rv" style={{ position: "relative" }}>
                        <div style={{ background: "var(--cream)", borderRadius: "32px", padding: "40px", border: "1px solid var(--b2)", boxShadow: "0 22px 50px rgba(0,0,0,.08)" }}>
                            <div style={{ padding: "20px", border: "2px dashed var(--b2)", borderRadius: "20px", textAlign: "center", marginBottom: "24px", background: "#fff" }}>
                                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📸</div>
                                <div style={{ fontWeight: "700", color: "var(--t1)" }}>Upload Prescription</div>
                                <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "4px" }}>JPEG, PNG or PDF · Up to 10MB</div>
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--t3)", marginBottom: "16px" }}>Recent Analysis</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ background: "var(--cream-2)", padding: "14px", borderRadius: "14px", fontSize: "13px" }}>
                                    <div style={{ fontWeight: "700", marginBottom: "4px" }}>Diagnosis detected: "Mild Dermatitis"</div>
                                    <div style={{ color: "var(--t3)" }}>AI recommendation: Grain-free recipe with Omega-3 enrichment.</div>
                                </div>
                                <div style={{ background: "var(--cream-2)", padding: "14px", borderRadius: "14px", fontSize: "13px", opacity: ".6" }}>
                                    <div style={{ fontWeight: "700", marginBottom: "4px" }}>Dietary note: "Avoid high-fat chicken"</div>
                                    <div style={{ color: "var(--t3)" }}>AI recommendation: Lean Lamb &amp; Fish formulation.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
