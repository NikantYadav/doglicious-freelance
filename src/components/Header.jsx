import React from 'react';
import { logoImg } from '../data/homeData';

export default function Header({ navScrolled, mobileMenuOpen, setMobileMenuOpen, openModal }) {
    return (
        <nav className={`nav ${navScrolled ? 'scrolled' : ''}`}>
            <div className="wrap flex-between">
                <div className="logo"><img src={logoImg} alt="Doglicious.in" width="192" height="192" /></div>
                <div className="nav-links flex-center">
                    <a href="#why">Why Fresh?</a>
                    <a href="#recipes">Recipes</a>
                    <a href="#tools">Tools</a>
                    <a href="#blogs">Blog</a>
                    <button className="btn btn-soft btn-sm" onClick={() => openModal('vet')}>🔍 Vet Rx Scan</button>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal('sample')}>Book Sample — ₹99</button>
                </div>
                <button className="mbtn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                </button>
            </div>

            <div className={`mm ${mobileMenuOpen ? 'o' : ''}`}>
                <div className="wrap">
                    <div className="flex-between py20">
                        <div className="logo"><img src={logoImg} alt="Doglicious.in" width="192" height="192" /></div>
                        <button className="mcl" onClick={() => setMobileMenuOpen(false)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                    </div>
                    <div className="mml">
                        <a href="#why" onClick={() => setMobileMenuOpen(false)}>Why Fresh Food?</a>
                        <a href="#recipes" onClick={() => setMobileMenuOpen(false)}>Our Recipes</a>
                        <a href="#tools" onClick={() => setMobileMenuOpen(false)}>Parent Tools</a>
                        <a href="#blogs" onClick={() => setMobileMenuOpen(false)}>Blog & Guides</a>
                        <hr style={{ opacity: ".1", margin: "20px 0" }} />
                        <button className="btn btn-soft" style={{ width: "100%", justifyContent: "center", marginBottom: "12px" }} onClick={() => { setMobileMenuOpen(false); openModal('vet'); }}>🔍 Vet Rx Scan — Free</button>
                        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setMobileMenuOpen(false); openModal('sample'); }}>Book Sample — ₹99</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
