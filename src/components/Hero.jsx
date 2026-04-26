import React from 'react';

export default function Hero({ openModal }) {
    return (
        <section className="hero">
            <div className="wrap">
                <div className="hero-c">
                    <div className="rv" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.08)", padding: "6px 14px", borderRadius: "100px", marginBottom: "20px", border: ".5px solid rgba(255,255,255,.15)" }}>
                        <span style={{ fontSize: "14px" }}>🤖</span>
                        <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,.85)" }}>AI-Powered Dog Nutrition</span>
                    </div>
                    <h1 className="rv" style={{ fontSize: "clamp(38px,6vw,84px)", lineHeight: "1.05", fontWeight: "800", color: "#fff", letterSpacing: "-.04em", marginBottom: "24px" }}>Ghar ka khana,<br /><span style={{ color: "var(--brown-l)" }}>personalised by AI.</span></h1>
                    <p className="lead rv" style={{ color: "rgba(255,255,255,.7)", maxWidth: "580px", margin: "0 auto 36px", fontSize: "clamp(15px,1.4vw,19px)" }}>Freshly cooked meals for your dog, built on veterinary science and customized for your dog's exact breed, age and health goals.</p>
                    <div className="rv flex-center" style={{ gap: "14px", flexWrap: "wrap" }}>
                        <button className="btn btn-primary" style={{ padding: "16px 32px", fontSize: "16px" }} onClick={() => openModal('quiz')}>Create My Dog's Plan — Free</button>
                        <button className="btn btn-soft" style={{ padding: "16px 32px", fontSize: "16px", background: "rgba(255,255,255,.1)", color: "#fff" }} onClick={() => openModal('sample')}>Try Sample for ₹99</button>
                    </div>
                    <div className="rv" style={{ marginTop: "48px", display: "flex", justifyContent: "center", gap: "32px", opacity: ".6", color: "#fff", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".1em" }}>
                        <span>✓ Vet Approved</span>
                        <span>✓ Lab Certified</span>
                        <span>✓ No Preservatives</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
