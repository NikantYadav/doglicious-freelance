// src/services/sampleBooking.js
// Handles Kylas CRM push and PayU payment initiation for sample bookings.
import { normalizePhone } from '../utils/phone';

const API = import.meta.env.VITE_API_URL ?? '';

/**
 * Push sample booking lead to Wylto CRM.
 * Fails silently — never blocks the user flow.
 */
export async function pushSampleToCRM({ dogName, phone, address, city, pincode, recipe, grams, price }) {
    try {
        const normPhone = normalizePhone(phone);
        await fetch(`${API}/api/wylto-sample`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dogName, phone: normPhone, address, city, pincode, recipe, grams, price }),
        });
    } catch (err) {
        console.error('[wylto-sample] push failed:', err);
    }
}

/**
 * Initiates a PayU hosted-checkout payment.
 * Calls the backend to generate the hash, then auto-submits a hidden form
 * to PayU's payment page — this is the only secure way to do PayU.
 */
export async function initiatePayU({ dogName, phone, price, recipe, grams }) {
    const normPhone = normalizePhone(phone);
    const res = await fetch(`${API}/api/payu-initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstname: dogName || 'Dog Parent',
            email: `${normPhone}@doglicious.in`,   // phone-based email since we don't collect email here
            phone: normPhone,
            price: String(price),              // pass the actual displayed price to the backend
            // udf1 used to carry order info back on success callback
            udf1: `${recipe}|${grams}g|₹${price}`,
            returnPath: window.location.pathname,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Payment initiation failed');
    }

    const { payuUrl, params } = await res.json();

    // Build and auto-submit a hidden form — required by PayU
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payuUrl;
    form.style.display = 'none';

    Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value ?? '';
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}
