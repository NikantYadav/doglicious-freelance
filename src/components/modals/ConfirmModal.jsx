import React from 'react';
import ModalContainer from './ModalContainer';

export default function ConfirmModal({ isOpen, onClose, dogName, mobile, recipe, grams, price, address }) {
    const waMsg = encodeURIComponent(`Thanks for booking with Doglicious! 🐾\n\nYour order is confirmed.\nOur customer care agent will call you soon.\n\nYou can reach us at 9889887980 between 10 AM to 6 PM.\n\nOrder details:\nRecipe: ${recipe} (${grams}g)\nAmount: ₹${price}`);

    return (
        <ModalContainer isOpen={isOpen} onClose={onClose} title="" maxWidth="420px">
            <div style={{ textAlign: "center" }}>
                <div className="success-circle">✅</div>
                <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Order Confirmed! 🎉</h3>
                <p style={{ fontSize: "14px", color: "var(--t2)", marginBottom: "18px", lineHeight: "1.6" }}>Thanks for booking with Doglicious! Your order is confirmed. Our customer care agent will call you soon. You can reach us at 9889887980 between 10 AM to 6 PM.</p>
                <div style={{ background: "var(--cream-2)", borderRadius: "var(--r-md)", padding: "14px", textAlign: "left", marginBottom: "18px", fontSize: "13px", color: "var(--t2)", display: "flex", flexDirection: "column", gap: "5px" }}>
                    {dogName && <span>🐕 Dog: <strong>{dogName}</strong></span>}
                    {recipe && <span>🍽️ {recipe} ({grams}g)</span>}
                    {price && <span>💰 ₹{price}</span>}
                    {address && <span>📍 {address}</span>}
                </div>
                <a href={`https://wa.me/${mobile ? mobile.replace(/^0/, '') + '91' : '919889887980'}?text=${waMsg}`} target="_blank" rel="noreferrer" className="btn btn-wa" style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}>💬 Track on WhatsApp</a>
                <button className="btn btn-soft btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>Done</button>
            </div>
        </ModalContainer>
    );
}
