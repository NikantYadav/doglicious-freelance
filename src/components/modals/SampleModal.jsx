import React from 'react';
import ModalContainer from './ModalContainer';
import { GRAM_OPTS, GRAM_PRICES } from '../../data/homeData';

export default function SampleModal({
    isOpen,
    onClose,
    sampleStep,
    setSampleStep,
    selectedRecipe,
    setSelectedRecipe,
    selectedGramIdx,
    setSelectedGramIdx,
    dogName,
    setDogName,
    mobile,
    mobileValid,
    handleMobileInput,
    deliveryAddress,
    setDeliveryAddress,
    deliveryCity,
    setDeliveryCity,
    deliveryPin,
    handlePincodeInput,
    mapSrc,
    openMapVerify,
    proceedToPayment,
    currentPrice,
    currentGrams
}) {
    const recipes = [
        { n: "Chicken & Pumpkin", e: "🍗", d: "Bestseller", desc: "Tender chicken with gut-healing pumpkin — perfect for sensitive stomachs and shiny coats." },
        { n: "Tender Lamb", e: "🍖", d: "Fan Favorite", desc: "Slow-cooked lamb in rich broth — iron-packed, deeply nourishing for active dogs." },
        { n: "Bone Broth", e: "🫙", d: "Joint Health", desc: "Mineral-rich bone broth over chicken — supports joints, hydration, and senior mobility." },
        { n: "Chicken Quinoa", e: "🥗", d: "High Energy", desc: "Lean chicken with protein-rich quinoa — ideal for active and working dog breeds." },
        { n: "Paneer & Farm", e: "🧀", d: "Vegetarian", desc: "Fresh paneer with seasonal farm vegetables — calcium-rich, complete vegetarian nutrition." },
        { n: "Liver Delite", e: "🫀", d: "Superfood", desc: "Iron-dense chicken liver with pumpkin — boosts immunity, vision, and coat quality." }
    ];

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            title="Book your sample"
            maxWidth="520px"
        >
            <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
                <div style={{ flex: "1", height: "3px", borderRadius: "2px", background: sampleStep >= 1 ? "var(--brown)" : "var(--cream-3)" }}></div>
                <div style={{ flex: "1", height: "3px", borderRadius: "2px", background: sampleStep >= 2 ? "var(--brown)" : "var(--cream-3)" }}></div>
                <div style={{ flex: "1", height: "3px", borderRadius: "2px", background: sampleStep >= 3 ? "var(--brown)" : "var(--cream-3)" }}></div>
            </div>

            {sampleStep === 1 && (
                <div id="sm-step1">
                    <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--t3)", marginBottom: "12px" }}>Choose a recipe</p>
                    <div className="sm-recipes">
                        {recipes.map((r, i) => (
                            <div
                                className={`sr ${selectedRecipe === i ? "sel" : ""}`}
                                key={i}
                                onClick={() => setSelectedRecipe(i)}
                            >
                                <div className="sr-e">{r.e}</div>
                                <div className="sr-n">{r.n}</div>
                                <div className="sr-d">{r.d}</div>
                                <div style={{ fontSize: "10px", color: "var(--t3)", marginTop: "4px", lineHeight: "1.4" }}>{r.desc}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".07em", color: "var(--t3)", marginBottom: "8px" }}>Select quantity</p>
                    <div className="sm-grams">
                        {GRAM_OPTS.map((g, i) => (
                            <div
                                className={`sg-btn ${selectedGramIdx === i ? "sel" : ""}`}
                                key={i}
                                onClick={() => setSelectedGramIdx(i)}
                            >
                                {g}g
                                <span style={{ display: "block", fontSize: "10px", opacity: ".6", fontWeight: "400" }}>₹{GRAM_PRICES[i]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="sm-price-display">
                        <div className="sm-price-amt">₹{currentPrice}</div>
                        <div className="sm-price-lbl">for {currentGrams}g · one-time sample — free delivery included</div>
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setSampleStep(2) }}>Continue →</button>
                </div>
            )}

            {sampleStep === 2 && (
                <div id="sm-step2">
                    <div className="fg2"><label className="ilab">Dog's name</label><input className="ifield" value={dogName} onChange={(e) => setDogName(e.target.value)} placeholder="e.g. Bruno" required /></div>
                    <div className="fg2">
                        <label className="ilab">Your mobile (WhatsApp)</label>
                        <div style={{ position: "relative" }}>
                            <input
                                className="ifield"
                                value={mobile}
                                onChange={(e) => handleMobileInput(e.target.value)}
                                type="tel"
                                placeholder="e.g. 10-digit mobile number"
                                pattern="[0-9]{10}"
                                required
                            />
                            {mobileValid && <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>✅</span>}
                        </div>
                    </div>
                    <div className="fg2"><label className="ilab">Delivery Address</label><input className="ifield" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="House/Flat no, Street, Area" required /></div>
                    <div className="addr-row">
                        <div className="fg2"><label className="ilab">City</label><input className="ifield" value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} placeholder="e.g. Gurgaon" required /></div>
                        <div className="fg2">
                            <label className="ilab">Pincode</label>
                            <input
                                className="ifield"
                                value={deliveryPin}
                                onChange={(e) => handlePincodeInput(e.target.value)}
                                placeholder="122001"
                                maxLength="6"
                                required
                            />
                        </div>
                    </div>
                    <button className="map-btn" onClick={openMapVerify}>📍 Verify on Google Maps</button>
                    {mapSrc && (
                        <iframe src={mapSrc} className="map-iframe" style={{ display: "block" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    )}
                    <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                        <button className="btn btn-soft btn-sm" onClick={() => { setSampleStep(1) }} style={{ flex: "1", justifyContent: "center" }}>← Back</button>
                        <button className="btn btn-primary" onClick={proceedToPayment} style={{ flex: "2", justifyContent: "center" }}>Pay <span>₹{currentPrice}</span> →</button>
                    </div>
                </div>
            )}
        </ModalContainer>
    );
}
