import React from 'react';

export default function VetRxHero({ openModal }) {
    return (
        <section className="vetrx-hero" id="vet">
            <div className="wrap">
                <div className="vetrx-grid">
                    <div className="rv">
                        <span style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: "10px" }}>AI-Powered · First Scan Free</span>
                        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontStyle: "italic", fontSize: "clamp(28px,4vw,44px)", fontWeight: "400", lineHeight: "1.1", letterSpacing: "-.02em", color: "var(--t1)", marginBottom: "14px" }}>Vet Rx Scan<br /><span style={{ fontSize: "clamp(14px,2vw,18px)", fontWeight: "300", opacity: ".7", fontStyle: "normal", letterSpacing: ".04em", textTransform: "uppercase" }}>AI Powered</span></h2>
                        <p style={{ fontSize: "16px", color: "var(--t2)", lineHeight: "1.7", marginBottom: "8px" }}>India's first AI dog health scanner. Upload a photo, describe symptoms, get instant insights — backed by veterinary knowledge. <strong style={{ color: "var(--t1)" }}>Completely free.</strong></p><p style={{ fontSize: "14px", color: "var(--t2)", marginBottom: "24px", fontStyle: "italic" }}>Free for customers &amp; non-customers alike. First scan is complimentary.</p>
                        <div className="vhf"><div style={{ fontSize: "20px", flexShrink: "0" }}>📸</div><div><h3>Photo-Based Analysis</h3><p>Upload a photo and describe symptoms for AI-guided health assessment.</p></div></div>
                        <div className="vhf"><div style={{ fontSize: "20px", flexShrink: "0" }}>🧠</div><div><h3>AI Nutrition Insights</h3><p>Personalised dietary recommendations based on health indicators.</p></div></div>
                        <div className="vhf"><div style={{ fontSize: "20px", flexShrink: "0" }}>👨‍⚕️</div><div><h3>Vet Escalation</h3><p>Serious concerns flagged and connected to a verified vet via WhatsApp.</p></div></div>
                    </div>
                    <div className="vetrx-box rv">
                        <div style={{ position: "relative", zIndex: "1", textAlign: "center" }}>
                            <div style={{ fontSize: "60px", marginBottom: "14px" }}>🔍</div>
                            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontStyle: "italic", fontSize: "22px", color: "var(--t1)", marginBottom: "8px" }}>Try Vet Rx Scan</h3>
                            <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "20px", lineHeight: "1.65" }}>Scan your dog's health instantly. AI analysis in seconds.</p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--t3)" }}><div className="vstep">1</div>Upload photo</div>
                                <div style={{ color: "var(--t3)", fontSize: "16px", alignSelf: "center" }}>→</div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--t3)" }}><div className="vstep">2</div>AI Analysis</div>
                                <div style={{ color: "var(--t3)", fontSize: "16px", alignSelf: "center" }}>→</div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--t3)" }}><div className="vstep">3</div>Insights</div>
                            </div>
                            <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginBottom: "10px", fontSize: "15px" }} onClick={() => { openModal('vet') }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg> Launch Vet Rx Scan
                            </button>

                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,.25)", marginTop: "10px" }}>Free service · Powered by AI · Vet-reviewed</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
