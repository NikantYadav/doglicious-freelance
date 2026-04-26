import React from 'react';

export default function CaseStudies() {
    return (
        <section id="case-studies">
            <div className="wrap">
                <div className="sh rv">
                    <span className="lbl">Case Studies</span>
                    <h2 className="title">Real results,<br />real dogs.</h2>
                    <p className="lead mt12">Before and after from dogs who switched to Doglicious.</p>
                </div>
                <div className="csg sg">
                    <div className="csc">
                        <div className="csh"><div className="csav">🐕</div><div><div className="csn">Bruno</div><div className="csbt">4yr Labrador · Gurgaon</div></div></div>
                        <div className="csb">
                            <div className="csp"><strong>Challenge</strong>Chronic bloating, loose stools and low energy on kibble for 3 years.</div>
                            <div className="csr"><strong>Result</strong>Digestion normalised in 10 days. Energy improved. Coat became glossy.</div>
                            <div className="csw">⏱ Visible improvement in 2 weeks</div>
                        </div>
                    </div>
                    <div className="csc">
                        <div className="csh"><div className="csav">🐩</div><div><div className="csn">Max</div><div className="csbt">2yr Beagle · South Delhi</div></div></div>
                        <div className="csb">
                            <div className="csp"><strong>Challenge</strong>Persistent skin allergies, itching and dull coat. Chicken allergy undiagnosed.</div>
                            <div className="csr"><strong>Result</strong>AI plan identified sensitivity. Switched to lamb &amp; fish. Itching stopped, coat restored.</div>
                            <div className="csw">⏱ Full coat restoration in 3 weeks</div>
                        </div>
                    </div>
                    <div className="csc">
                        <div className="csh"><div className="csav">🦮</div><div><div className="csn">Zeus</div><div className="csbt">5yr German Shepherd · Noida</div></div></div>
                        <div className="csb">
                            <div className="csp"><strong>Challenge</strong>Overweight (28kg, target 24kg) with joint stiffness.</div>
                            <div className="csr"><strong>Result</strong>Lost 3.2kg in 8 weeks on custom weight plan. Joint mobility improved.</div>
                            <div className="csw">⏱ Target weight in 12 weeks</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
