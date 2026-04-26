import React from 'react';

export default function TestimonialsCarousel({ carouselIdx, CAR_DATA, carTrackRef, carMove }) {
    return (
        <section id="testimonials" style={{ background: "var(--cream-2)" }}>
            <div className="wrap">
                <div className="sh c rv"><span className="lbl">Real Stories</span><h2 className="title">Loved by dogs.<br />Trusted by parents.</h2></div>
                <div className="rv">
                    <div className="car-wrap">
                        <div className="car-track" id="carTrack" ref={carTrackRef}>
                            {CAR_DATA.map((c, i) => (
                                <div className="tmc" key={i}>
                                    <div className="vbg">{c.v}</div>
                                    <div className="stars">
                                        {[...Array(5)].map((_, j) => <div className="star" key={j}></div>)}
                                    </div>
                                    <p className="qt">"{c.q}"</p>
                                    <div className="qa">
                                        <div className="qav">{c.n[0]}</div>
                                        <div>
                                            <div className="qan">{c.n}</div>
                                            <div className="qad">{c.d}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="car-btns">
                        <button className="car-btn" onClick={() => carMove(-1)}>←</button>
                        <button className="car-btn" onClick={() => carMove(1)}>→</button>
                    </div>
                    <div className="car-dots" id="carDots">
                        {CAR_DATA.map((_, i) => (
                            <div key={i} className={`car-dot${i === carouselIdx ? ' a' : ''}`} onClick={() => carMove(i - carouselIdx)} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
