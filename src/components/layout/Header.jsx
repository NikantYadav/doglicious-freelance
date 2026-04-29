import React from 'react';
import { logoImg } from '../../data/homeData';

export default function Header({
    navScrolled,
    mobileMenuOpen,
    setMobileMenuOpen,
    openModal,
    openTool
}) {
    return (
        <>
            <nav id="nav" className={navScrolled ? "s" : ""}>
                <div className="nav-in">
                    <a href="#" className="nav-logo"><img src={logoImg} alt="Doglicious.in" width="192" height="192" /></a>
                    <ul className="nav-links">
                        <li><a href="#vet">🔍 Vet Rx Scan</a></li>
                        <li><a href="#why">Why Us</a></li>
                        <li><a href="#fresh">What is Fresh?</a></li>
                        <li><a href="#recipes">Recipes</a></li>
                        <li><a href="#case-studies">Results</a></li>
                        <li><a href="#blogs">Blogs</a></li>
                        <li className="dd">
                            <a href="#tools">Free Tools <span className="ftag">8</span></a>
                            <div className="ddm">
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(0); }}>⚖️ BMI Calculator</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(1); }}>🍽️ Feeding Calculator</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(2); }}>💰 Cost Calculator</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(3); }}>📅 Age Calculator</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(4); }}>🥦 Best Vegetables</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(5); }}>💊 Natural Healing</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(6); }}>📋 AAFCO Planner</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); openTool(7); }}>🧠 Health Quiz</a>
                            </div>
                        </li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button className="nav-vetrx" onClick={() => { openModal('vet') }}>🔍 Vet Rx Scan<span style={{ fontSize: "9px", opacity: ".75", marginLeft: "4px", letterSpacing: ".04em", fontWeight: "400" }}> AI</span></button>
                        <button className="nav-btn" onClick={() => { openModal('sample') }}>Book ₹99</button>
                        <button className="hbg" id="hbg" onClick={() => { setMobileMenuOpen(prev => !prev) }}><span></span><span></span><span></span></button>
                    </div>
                </div>
            </nav>

            <div className={`mob-m ${mobileMenuOpen ? "o" : ""}`}>
                <a href="#vet" onClick={() => { setMobileMenuOpen(false); openModal('vet'); }}>🔍 Vet Rx Scan</a>
                <a href="#why" onClick={() => { setMobileMenuOpen(false) }}>Why Doglicious</a>
                <a href="#fresh" onClick={() => { setMobileMenuOpen(false) }}>What is Fresh?</a>
                <a href="#recipes" onClick={() => { setMobileMenuOpen(false) }}>Recipes</a>
                <a href="#tools" onClick={() => { setMobileMenuOpen(false) }}>Free Tools</a>
                <a href="#video-stories" onClick={() => { setMobileMenuOpen(false) }}>Videos</a>
                <a href="#case-studies" onClick={() => { setMobileMenuOpen(false) }}>Results</a>
                <a href="#blogs" onClick={() => { setMobileMenuOpen(false) }}>Blogs</a>
                <a href="#contact" onClick={() => { setMobileMenuOpen(false) }}>Contact</a>
                <a href="#" onClick={() => { setMobileMenuOpen(false); openModal('sample'); }}>Book Sample for ₹99 →</a>
            </div>
        </>
    );
}
