import React from 'react';
import { TOOL_TITLES } from '../data/homeData';

export default function FreeToolsSection({ openTool }) {
    return (
        <section id="tools" style={{ padding: "80px 0", background: "var(--t1)", color: "white" }}>
            <div className="wrap sg">
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <span className="lbl rv" style={{ color: "var(--brown-l)" }}>Dog Parent Resources</span>
                    <h2 className="title rv" style={{ color: "white" }}>Free health &amp; nutrition tools.</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "16px" }} className="sg">
                    {TOOL_TITLES.map((t, i) => (
                        <button key={i} className="tool-b rv" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => openTool(i)}>
                            <span style={{ fontSize: "20px" }}>{t.split(' ')[0]}</span>
                            <span style={{ fontWeight: "700", textAlign: "left" }}>{t.split(' ').slice(1).join(' ')}</span>
                            <span className="ta" style={{ marginLeft: "auto" }}>→</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
