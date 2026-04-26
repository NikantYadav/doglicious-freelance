import React from 'react';

export default function CtaSection({ openModal }) {
    return (
        <section style={{ padding: "48px 0 88px" }}>
            <div className="ctab rv">
                <div className="ctab-glow"></div>
                <div style={{ position: "relative", zIndex: "1" }}>
                    <h2 className="title" style={{ color: "var(--t1)", marginBottom: "12px" }}>Start feeding beautifully today.</h2>
                    <p className="lead mt12" style={{ color: "var(--t2)", marginBottom: "28px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>Join thousands of dog parents who've made the switch.</p>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "12px" }}>
                        <button className="btn btn-secondary" onClick={() => { openModal('vet') }} style={{ fontSize: "15px" }}>🔍 Vet Rx Scan — Free</button>
                        <button className="btn" style={{ background: "var(--cream)", color: "var(--t1)", border: ".5px solid var(--b2)" }} onClick={() => { openModal('sample') }}>Book Sample — ₹99</button>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--t3)" }}>No commitment · Free delivery · Cancel anytime</p>
                </div>
            </div>
        </section>
    );
}
