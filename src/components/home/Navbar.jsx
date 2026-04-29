import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({
    navScrolled,
    mobileMenuOpen,
    setMobileMenuOpen,
    openModal,
    openTool,
    logoImg
}) {
    return (
        <>
            <nav id="nav" className={navScrolled ? "s" : ""}>
                <div className="nav-in">
                    <Link to="/" className="nav-logo"><img src={logoImg} alt="Doglicious.in" /></Link>
                    <ul className="nav-links">
                        <li><a href="#vet">🔍 Vet Rx Scan</a></li>
                        <li><Link to="/products">Products</Link></li>
                        <li><a href="#why">Why Us</a></li>
                        <li><a href="#case-studies">Results</a></li>
                        <li><Link to="/blogs">Blogs</Link></li>
                        <li><Link to="/tools">Free Tools <span className="ftag">8</span></Link></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button className="nav-vetrx" onClick={() => { openModal('vet') }}>🔍 Vet Rx Scan<span style={{ fontSize: "9px", opacity: ".75", marginLeft: "4px", letterSpacing: ".04em", fontWeight: "400" }}> AI</span></button>
                        <button className="nav-btn" onClick={() => { openModal('sample') }}>Book ₹99</button>
                        <button className={`hbg${mobileMenuOpen ? " o" : ""}`} id="hbg" onClick={() => { setMobileMenuOpen(prev => !prev) }}><span></span><span></span><span></span></button>
                    </div>
                </div>
            </nav>
            <div className={`mob-m ${mobileMenuOpen ? "o" : ""}`}>
                <a href="#vet" onClick={() => { setMobileMenuOpen(false); openModal('vet'); }}>🔍 Vet Rx Scan</a>
                <Link to="/products" onClick={() => { setMobileMenuOpen(false) }}>Products</Link>
                <a href="#why" onClick={() => { setMobileMenuOpen(false) }}>Why Doglicious</a>
                <Link to="/tools" onClick={() => { setMobileMenuOpen(false) }}>Free Tools</Link>
                <a href="#video-stories" onClick={() => { setMobileMenuOpen(false) }}>Videos</a>
                <a href="#case-studies" onClick={() => { setMobileMenuOpen(false) }}>Results</a>
                <Link to="/blogs" onClick={() => { setMobileMenuOpen(false) }}>Blogs</Link>
                <a href="#contact" onClick={() => { setMobileMenuOpen(false) }}>Contact</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); openModal('sample'); }}>Book Sample for ₹99 →</a>
            </div>
        </>
    );
}
