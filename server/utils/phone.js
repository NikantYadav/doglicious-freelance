// server/utils/phone.js

/**
 * Normalizes a phone number to include a leading +.
 * If it's 10 digits and has no country code, it defaults to +91 (India).
 * @param {string} phone - Raw phone number input
 * @returns {string} Normalized phone number (e.g., +919876543210)
 */
export function normalizePhone(phone) {
    if (!phone) return '';

    // 1. Remove all non-numeric characters EXCEPT +
    // This allows +91... to stay as +91...
    const clean = phone.trim().replace(/[^\d+]/g, '');

    // 2. If it already starts with +, return it as is
    if (clean.startsWith('+')) {
        return clean;
    }

    // 3. For numbers without +, get only the digits
    let digits = clean.replace(/\D/g, '');

    // 4. Handle leading '0' (often used for domestic numbers)
    if (digits.startsWith('0') && digits.length === 11) {
        digits = digits.substring(1);
    }

    // 5. If it's 10 digits, default to India (+91)
    if (digits.length === 10) {
        return `+91${digits}`;
    }

    // 6. If it's 12 digits and starts with 91, it's already got the country code (India)
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }

    // 7. If the user enters more than 10 digits but no +, and it doesn't match above,
    // we still try to treat the last 10 digits as the core number and add +91
    // as per the requirement "use +91 as the default country code everywhere".
    if (digits.length > 0) {
        return `+91${digits.slice(-10)}`;
    }

    return '';
}
