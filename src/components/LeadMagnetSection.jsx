import React, { useState } from 'react';

export default function LeadMagnetSection({ openModal }) {
    const [email, setEmail] = useState('');

    const submitLead = (e) => {
        e.preventDefault();
        if (!email) return;
        openModal('confirm');
        setEmail('');
    };

    return (
        <section style={{ padding: "100px 0", background: "white" }}>
            <div className="wrap">
                <div className="card sg rv" style={{ background: "var(--cream)", padding: "100px 40px", borderRadius: "56px", textAlign: "center", border: "1px solid var(--b2)" }}>
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <span style={{ fontSize: "44px", marginBottom: "20px", display: "block" }}>📧</span>
                        <h2 className="title" style={{ fontSize: "36px", marginBottom: "16px" }}>Get the "Fresh Food Blueprint"</h2>
                        <p className="lead" style={{ marginBottom: "40px", fontSize: "16px" }}>Our 20-page guide on transitioning any dog breed to fresh food, managing allergies, and saving ₹2000+/mo on vet bills.</p>
                        <form onSubmit={submitLead} style={{ display: "flex", gap: "10px", background: "white", padding: "8px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,.05)", border: "1px solid var(--b2)" }}>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                style={{ flex: "1", border: "none", padding: "0 20px", outline: "none", fontSize: "15px", fontWeight: "600", color: "var(--t1)" }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: "14px 28px" }}>Send Me The Guide</button>
                        </form>
                        <div style={{ marginTop: "20px", fontSize: "12px", color: "var(--t3)", fontWeight: "600" }}>Join 4,000+ informed dog parents. No spam, ever.</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
