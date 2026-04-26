import React from 'react';

export default function TrustSection() {
    return (
        <section id="trust">
            <div className="wrap">
                <div className="sh c rv">
                    <span className="lbl">Quality Promise</span>
                    <h2 className="title">Our quality promise.</h2>
                    <p className="lead mt12">Every meal backed by science, certified by labs, approved by vets.</p>
                </div>
                <div className="tg sg">
                    <div className="tc"><div className="ti">📋</div><div className="tt">AAFCO Aligned</div><div className="td">Complete &amp; balanced nutritional standards.</div></div>
                    <div className="tc"><div className="ti">🔬</div><div className="tt">NABL Certified</div><div className="td">Every batch lab-tested for safety.</div></div>
                    <div className="tc"><div className="ti">👨‍⚕️</div><div className="tt">Vet Approved</div><div className="td">Reviewed by certified veterinary nutritionists.</div></div>
                    <div className="tc"><div className="ti">🏆</div><div className="tt">Human Grade</div><div className="td">Highest food safety standard.</div></div>
                    <div className="tc"><div className="ti">🚫</div><div className="tt">Preservative Free</div><div className="td">Zero artificial preservatives, naturally.</div></div>
                </div>
            </div>
        </section>
    );
}
