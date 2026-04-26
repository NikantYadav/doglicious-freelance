import React from 'react';

export default function TestimonialsSection({ carouselIdx, setCarouselIdx, carTrackRef }) {
    const carMove = (dir) => {
        const max = 4; // Assuming 5 items based on the original code logic
        setCarouselIdx(prev => {
            let n = prev + dir;
            if (n < 0) return 0;
            if (n > max) return max;
            return n;
        });
    };

    return (
        <section id="results" style={{ padding: "100px 0", background: "white", overflow: "hidden" }}>
            <div className="wrap sg">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "50px" }}>
                    <div>
                        <span className="lbl rv">Real Results</span>
                        <h2 className="title rv">The impact of a fresh bowl.</h2>
                    </div>
                    <div className="flex-center rv" style={{ gap: "10px" }}>
                        <button className="c-btn" onClick={() => carMove(-1)}>←</button>
                        <button className="c-btn" onClick={() => carMove(1)}>→</button>
                    </div>
                </div>

                <div className="c-v rv">
                    <div className="c-t" ref={carTrackRef}>
                        {[
                            { n: 'Leo', b: 'Labrador, 4Y', msg: 'Leo had chronic skin issues since he was 6 months old. We tried every medicated kibble. 2 months on Doglicious and he has stopped scratching entirely. His coat is finally soft!' },
                            { n: 'Bruno', b: 'Golden Retriever, 2Y', msg: 'The difference in energy is insane. He used to be lethargic after meals, now he is active, his stools are firm and he actually licks the bowl clean every single time.' },
                            { n: 'Kiki', b: 'Indie, 7Y', msg: 'Kiki was getting picky as she got older. Doglicious is the only food she genuinely gets excited for. It feels good to know she is eating actual meat and not pellets.' },
                            { n: 'Simba', b: 'Shih Tzu, 1Y', msg: 'Perfect for small breeds. The portion sizes are exact and he is growing so well. No more tear stains or gut issues which we faced with his previous food brand.' },
                            { n: 'Zorro', b: 'GSD, 5Y', msg: 'Zorro is a working dog and needs high protein. Finding NABL certified food in India was a game changer for us. We trust Doglicious with his performance nutrition.' }
                        ].map((t, i) => (
                            <div key={i} className="c-i card">
                                <div style={{ fontSize: "24px", color: "var(--brown)", fontWeight: "800", marginBottom: "16px" }}>“</div>
                                <p style={{ fontSize: "15px", lineHeight: "1.6", color: "var(--t2)", marginBottom: "32px", minHeight: "120px" }}>{t.msg}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--cream-3)" }}></div>
                                    <div>
                                        <div style={{ fontWeight: "800", color: "var(--t1)", fontSize: "14px" }}>{t.n}</div>
                                        <div style={{ fontSize: "12px", color: "var(--t3)", fontWeight: "600" }}>{t.b}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="wrap" style={{ marginTop: "100px" }}>
                <div style={{ textAlign: "center", marginBottom: "60px" }} className="sg">
                    <span className="lbl rv">Case Studies</span>
                    <h2 className="title rv">Nutrition that heals.</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }} className="sg">
                    {[
                        { tag: 'Weight Management', t: 'How Shadow lost 6kg in 5 months.', d: 'Obesity is the #1 killer of Indian Labradors. Read how a calorie-exact fresh diet reversed Shadow\'s lethargy and joint pain.' },
                        { tag: 'Skin Recovery', t: 'From chronic dermatitis to a silky coat.', d: 'Identifying the specific inflammatory triggers in processed food changed everything for this Golden Retriever.' }
                    ].map((c, i) => (
                        <div key={i} className="card rv" style={{ padding: "48px", background: "var(--cream-2)" }}>
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--brown)", textTransform: "uppercase", letterSpacing: ".1em" }}>{c.tag}</span>
                            <h3 style={{ fontSize: "24px", fontWeight: "800", margin: "12px 0 16px", color: "var(--t1)" }}>{c.t}</h3>
                            <p style={{ fontSize: "15px", color: "var(--t3)", lineHeight: "1.6", marginBottom: "32px" }}>{c.d}</p>
                            <button style={{ background: "none", border: "none", padding: "0", color: "var(--t1)", fontWeight: "800", fontSize: "14px", textDecoration: "underline", cursor: "pointer" }}>Read Case Study →</button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
