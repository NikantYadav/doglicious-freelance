import React from 'react';

export default function HowItWorksSection({ openModal }) {
    return (
        <section id="how" style={{ background: "var(--cream-2)" }}>
            <div className="wrap">
                <div className="sh rv"><span className="lbl">Process</span><h2 className="title">Up and running<br />in three steps.</h2></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0" }} className="sg steps-new">
                    <div className="st"><div className="sn">01</div><div><div className="st-t">Tell us about your dog</div><div className="st-d">Breed, age, weight, activity and health goals — takes 2 minutes.</div></div></div>
                    <div className="st" style={{ position: "relative" }}>
                        <div className="sn">02</div>
                        <div style={{ flex: "1" }}>
                            <div className="st-t">Choose how you want to start</div>
                            <div className="st-d" style={{ marginBottom: "12px" }}>Two ways in — try before you commit, or scan first.</div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <button className="btn btn-primary btn-sm" onClick={() => { openModal('sample') }} style={{ fontSize: "12px", padding: "8px 16px" }}>Book Sample — ₹99</button>
                                <button className="btn btn-soft btn-sm" onClick={() => { openModal('vet') }} style={{ fontSize: "12px", padding: "8px 16px", border: ".5px solid var(--b2)" }}>🔍 Vet Rx Scan</button>
                            </div>
                        </div>
                    </div>
                    <div className="st"><div className="sn">03</div><div><div className="st-t">Fresh food. Delivered.</div><div className="st-d">Freshly cooked each morning. Free delivery across Gurgaon &amp; Delhi NCR. 3 hours from kitchen to bowl.</div></div></div>
                </div>
                <div style={{ textAlign: "center", marginTop: "40px" }} className="rv">
                    <button className="btn btn-primary" onClick={() => { openModal('sample') }}>Book a Sample — ₹99</button>
                </div>
            </div>
        </section>
    );
}
