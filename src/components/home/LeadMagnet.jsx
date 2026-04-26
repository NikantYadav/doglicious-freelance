import React from 'react';

export default function LeadMagnet({ foodImg, submitLead }) {
    return (
        <section id="lead" style={{ background: "var(--cream-2)" }}>
            <div className="wrap">
                <div className="lg">
                    {/* Left: guide info card */}
                    <div className="rv lead-card">
                        <div className="lead-card-inner">
                            <div style={{ padding: "clamp(24px,4vw,36px) clamp(20px,4vw,32px)", background: "var(--cream)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <div style={{ fontSize: "40px", marginBottom: "16px" }}>📖</div>
                                <h3 style={{ fontSize: "clamp(16px,3vw,20px)", fontWeight: "700", color: "var(--t1)", marginBottom: "8px", letterSpacing: "-.02em" }}>Free Home-Cooked Guide</h3>
                                <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "20px", lineHeight: "1.65" }}>Everything you need to start feeding your dog fresh food at home.</p>
                                <div className="lb">12 vet-approved home cooked recipes</div>
                                <div className="lb">Ingredient safety chart</div>
                                <div className="lb">Portion guide by breed &amp; weight</div>
                                <div className="lb">Transition guide from kibble to fresh</div>
                            </div>
                            <div className="lead-img-col">
                                <img src={foodImg} alt="Fresh dog food ingredients" style={{ width: "100%", maxWidth: "260px", height: "auto", objectFit: "contain", display: "block", borderRadius: "12px" }} />
                            </div>
                        </div>
                    </div>

                    {/* Right: form */}
                    <div className="rv">
                        <span className="lbl" style={{ display: "block", marginBottom: "10px" }}>Free Download</span>
                        <h2 className="title" style={{ fontSize: "clamp(22px,3vw,32px)", marginBottom: "8px" }}>Get the free<br />home cooking guide.</h2>
                        <p className="lead mt12" style={{ fontSize: "14px", marginBottom: "22px" }}>Join 5,000+ dog parents. 100% free, no spam.</p>
                        <form onSubmit={submitLead}>
                            <div className="fg2"><label className="ilab">Your Name</label><input className="ifield" id="ln" placeholder="e.g. Priya Sharma" required /></div>
                            <div className="fg2"><label className="ilab">Mobile (WhatsApp)</label><input className="ifield" id="lm" type="tel" placeholder="10-digit number" pattern="[0-9]{10}" required /></div>
                            <div className="fg2"><label className="ilab">Email Address</label><input className="ifield" id="le" type="email" placeholder="you@gmail.com" required /></div>
                            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Download free guide →</button>
                        </form>
                        <p className="note mt8">🔒 Guide sent via WhatsApp in 2 minutes.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
