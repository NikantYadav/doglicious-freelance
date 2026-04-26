import React from 'react';
import ModalContainer from './ModalContainer';
import { RECIPES, GRAM_OPTS, GRAM_PRICES } from '../../data/homeData';

export default function PaymentModal({
    isOpen,
    onClose,
    selectedPayment,
    setSelectedPayment,
    openModal,
    totalAmount,
    selectedRecipe,
    selectedGramIdx
}) {
    const recipe = RECIPES?.[selectedRecipe] ?? 'Chicken & Pumpkin';
    const grams = GRAM_OPTS?.[selectedGramIdx] ?? 100;
    const price = GRAM_PRICES?.[selectedGramIdx] ?? totalAmount;

    return (
        <ModalContainer isOpen={isOpen} onClose={onClose} title="Complete your order" maxWidth="440px">
            <div className="os">
                <div className="ol"><span>{recipe} · {grams}g</span><span>₹{price}</span></div>
                <div className="ol"><span>Delivery</span><span style={{ color: "var(--green)", fontWeight: "600" }}>FREE</span></div>
                <div className="ol tot"><span>Total</span><span>₹{price}</span></div>
            </div>
            {[
                { i: "📱", n: "UPI / GPay / PhonePe", s: "Instant · No charges" },
                { i: "💳", n: "Credit / Debit Card", s: "Visa, Mastercard, RuPay" },
                { i: "🏦", n: "Net Banking", s: "All major banks" },
            ].map((p, idx) => (
                <div key={idx} className={`pm${selectedPayment === idx ? ' sel' : ''}`} onClick={() => setSelectedPayment(idx)}>
                    <div className="pm-i">{p.i}</div>
                    <div><div className="pm-n">{p.n}</div><div className="pm-s">{p.s}</div></div>
                </div>
            ))}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "14px" }} onClick={() => openModal('confirm')}>
                Confirm &amp; pay ₹{price}
            </button>
            <p className="note mt8" style={{ textAlign: "center" }}>🔒 256-bit encrypted · Secure payment</p>
        </ModalContainer>
    );
}
