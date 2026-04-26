import React from 'react';

const VIDEOS = [
    { n: 1, emoji: "🐕", bg: "linear-gradient(135deg,#2a1e00,#4a3010)", label: "30 sec · Bruno's story", title: "Bruno's Transformation", sub: "4yr Labrador · Gurgaon · Lost 4kg in 8 weeks", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { n: 2, emoji: "🐩", bg: "linear-gradient(135deg,#1a2a1a,#2a4020)", label: "30 sec · Max's story",   title: "Max's Skin Recovery",    sub: "2yr Beagle · South Delhi · Itching stopped in 3 weeks", src: "https://www.w3schools.com/html/movie.mp4" },
    { n: 3, emoji: "🦮", bg: "linear-gradient(135deg,#1a1a2a,#20204a)", label: "30 sec · Zeus's story",  title: "Zeus's Weight Journey",  sub: "5yr GSD · Noida · Lost 3.2kg in 8 weeks", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { n: 4, emoji: "🐾", bg: "linear-gradient(135deg,#2a1a1a,#4a2020)", label: "30 sec · Mia's story",   title: "Mia's First Year Fresh",  sub: "1yr Shih Tzu · DLF Phase 3 · Thriving on fresh", src: "https://www.w3schools.com/html/movie.mp4" },
];

export default function VideoStories({ playVid }) {
    return (
        <section id="video-stories" style={{ background: "var(--cream)" }}>
            <div className="wrap">
                <div className="sh c rv">
                    <span className="lbl">Video Stories</span>
                    <h2 className="title">Watch the transformations.</h2>
                    <p className="lead mt12">Real dogs. Real families. Real results — on camera.</p>
                </div>
                <div className="rv">
                    <div className="video-grid sg" id="videoGrid">
                        {VIDEOS.map(v => (
                            <div key={v.n} className="video-card">
                                <div style={{ position: "relative", aspectRatio: "16/9", background: "#1a1a1a", cursor: "pointer" }} onClick={() => playVid(v.n)}>
                                    <div style={{ position: "absolute", inset: "0", background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }} id={`vcover${v.n}`}>
                                        <div style={{ fontSize: "clamp(32px,6vw,48px)", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.3))" }}>{v.emoji}</div>
                                        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,.3)" }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                        <div style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>{v.label}</div>
                                    </div>
                                    <video id={`vid${v.n}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "none" }} controls preload="none">
                                        <source src={v.src} type="video/mp4" />
                                    </video>
                                    <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,.5)", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "var(--r-max)", backdropFilter: "blur(4px)" }}>▶ PLAY</div>
                                </div>
                                <div style={{ padding: "14px 16px" }}>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--t1)", marginBottom: "3px" }}>{v.title}</div>
                                    <div style={{ fontSize: "11px", color: "var(--t3)" }}>{v.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: "28px" }}>
                        <p style={{ fontSize: "13px", color: "var(--t3)", marginBottom: "14px" }}>Share your dog's story on WhatsApp</p>
                        <a href="https://wa.me/919889887980?text=Hi!%20I%20want%20to%20share%20my%20dog%27s%20Doglicious%20story%20video!" target="_blank" rel="noreferrer" className="btn btn-soft btn-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                            Share Your Dog's Story
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
