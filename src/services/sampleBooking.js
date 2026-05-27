// src/services/sampleBooking.js
// Handles Kylas CRM push and PayU payment initiation for sample bookings.
import { normalizePhone } from '../utils/phone';

const API = import.meta.env.VITE_API_URL ?? '';

/**
 * Push sample booking to Supabase via backend.
 * Fails silently — never blocks the user flow.
 */
export async function pushSampleToCRM({ dogName, phone, address, city, pincode, recipe, grams, price }) {
    try {
        const normPhone = normalizePhone(phone);
        await fetch(`${API}/api/db-sample`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dogName, phone: normPhone, address, city, pincode, recipe, grams, price }),
        });
    } catch (err) {
        console.error('[db-sample] push failed:', err);
    }
}

/**
 * Initiates a PayU hosted-checkout payment.
 * Calls the backend to generate the hash, then auto-submits a hidden form
 * to PayU's payment page — this is the only secure way to do PayU.
 */
export async function initiatePayU({ dogName, phone, price, recipe, grams, address, city, pincode }) {
    const normPhone = normalizePhone(phone);
    const res = await fetch(`${API}/api/payu-initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstname: dogName || 'Dog Parent',
            email: `${normPhone.replace(/\D/g, '')}@doglicious.in`,
            phone: normPhone,
            price: String(price),
            // Pack all order data into udf fields for server-side saving on success
            udf1: normPhone,
            udf2: window.location.pathname,
            udf3: String(price),
            udf4: `${recipe}|${grams}|${dogName || ''}`,
            udf5: `${address || ''}|${city || ''}|${pincode || ''}`,
            returnPath: window.location.pathname,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Payment initiation failed');
    }

    const { payuUrl, params } = await res.json();

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
