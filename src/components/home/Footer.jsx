import React from 'react';
import { Link } from 'react-router-dom';
import { logoImg } from '../../data/homeData';

export default function Footer({ openModal, openTool }) {
    return (
        <footer id="contact">
            <div className="wrap">
                <div className="fgrid">
                    <div>
                        <div className="flogo"><img src={logoImg} alt="Doglicious.in" width="192" height="192" loading="lazy" /></div>
                        <div className="faib">🤖 AI-Powered Nutrition. Backed by Science. Made with Love.</div>
                        <p className="ft">Superfood for dogs. Personalised by AI. Vet approved. Cooked fresh daily. Delivered across Delhi NCR.</p>
                        <div className="fct">
                            <span>📱 <a href="tel:9889887980">9889887980</a></span>
                            <span>💬 <a href="https://wa.me/919889887980" target="_blank" rel="noreferrer">WhatsApp Us</a></span>
                            <span>📧 <a href="mailto:woof@doglicious.in">woof@doglicious.in</a></span>
                        </div>
                    </div>
                    <div>
                        <div className="fh">Navigate</div>
                        <ul className="fl">
                            <li><a href="#vet" onClick={() => { openModal('vet') }}>Vet Rx Scan</a></li>
                            <li><a href="#why">Why Doglicious</a></li>
                            <li><a href="#fresh">What is Fresh?</a></li>
                            <li><a href="#recipes">Recipes</a></li>
                            <li><a href="#how">How it Works</a></li>
                            <li><a href="#results">Results</a></li>
                        </ul>
                    </div>
                    <div>
                        <div className="fh">Free Tools</div>
                        <ul className="fl">
                            <li><a href="#" onClick={(e) => { e.preventDefault(); openTool(0); }}>BMI Calculator</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); openTool(1); }}>Feeding Calculator</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); openTool(2); }}>Cost Calculator</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); openTool(3); }}>Age Calculator</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); openTool(6); }}>AAFCO Planner</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); openTool(7); }}>Health Quiz</a></li>
                        </ul>
                    </div>
                    <div>
                        <div className="fh">Certifications</div>
                        <div className="fcerts">
                            <div className="fcert"><span>📋</span>AAFCO Aligned</div>
                            <div className="fcert"><span>🔬</span>NABL Lab Certified</div>
                            <div className="fcert"><span>👨‍⚕️</span>Vet Approved</div>
                            <div className="fcert"><span>🏆</span>Human Grade</div>
                            <div className="fcert"><span>🚫</span>Preservative Free</div>
                        </div>
                    </div>
                </div>
                <div className="fb">
                    <div>
                        <div className="fbt">© 2025 Doglicious.in · Petlicious Superfoods India Pvt. Ltd. · All rights reserved.</div>
                        <div className="fbl mt8">
                            <Link to="/privacy-policy">Privacy</Link>
                            <Link to="/terms-of-service">Terms</Link>
                            <Link to="/shipping-policy">Shipping</Link>
                            <Link to="/refund-policy">Refunds</Link>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                        <div className="pls"><span className="pl">UPI</span><span className="pl">VISA</span><span className="pl">MC</span><span className="pl">GPay</span><span className="pl">COD</span></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
