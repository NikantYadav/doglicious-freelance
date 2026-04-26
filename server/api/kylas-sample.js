// server/api/kylas-sample.js
// Creates or updates a Kylas lead when a sample is booked from the homepage.

const KYLAS_BASE = 'https://api.kylas.io';
const kylasKey = () => process.env.KYLAS_API_KEY;

async function kylasPost(path, body) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'POST',
        headers: { 'api-key': kylasKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas error: ${res.status} ${err}`);
    }
    return res.json();
}

async function kylasPut(path, body) {
    const res = await fetch(`${KYLAS_BASE}${path}`, {
        method: 'PUT',
        headers: { 'api-key': kylasKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kylas PUT error: ${res.status} ${err}`);
    }
    return res.json();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { dogName, phone, address, city, pincode, recipe, grams, price } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    try {
        // Search for existing lead by phone
        const searchRes = await kylasPost('/v1/search/lead?size=10', {
            fields: ['phoneNumbers', 'customFieldValues', 'id', 'firstName'],
            jsonRule: {
                rules: [{
                    id: 'multi_field',
                    field: 'multi_field',
                    type: 'multi_field',
                    input: 'multi_field',
                    operator: 'multi_field',
                    value: phone
                }],
                condition: 'AND',
                valid: true
            }
        });

        let leadId = null;

        if (searchRes.content && searchRes.content.length > 0) {
            // Update existing lead
            leadId = searchRes.content[0].id;
            const existing = searchRes.content[0];
            if (!existing.customFieldValues) existing.customFieldValues = {};

            Object.assign(existing.customFieldValues, {
                cfDogName: dogName || '',
                cfSampleRecipe: recipe || '',
                cfSampleGrams: grams ? `${grams}g` : '',
                cfSamplePrice: price ? `₹${price}` : '',
                cfDeliveryAddress: `${address || ''}, ${city || ''} - ${pincode || ''}`,
                cfSampleStatus: 'booked',
            });

            // Strip read-only fields
            ['createdAt','updatedAt','createdBy','updatedBy','recordActions','metaData',
             'latestActivityCreatedAt','createdViaId','createdViaName','createdViaType',
             'updatedViaId','updatedViaName','updatedViaType'].forEach(k => delete existing[k]);

            await kylasPut(`/v1/leads/${leadId}`, existing);
        } else {
            // Create new lead
            const created = await kylasPost('/v1/leads/', {
                firstName: dogName || 'Dog Parent',
                lastName: '',
                phoneNumbers: [{
                    type: 'MOBILE',
                    code: 'IN',
                    dialCode: '+91',
                    value: phone,
                    primary: true
                }],
                customFieldValues: {
                    cfDogName: dogName || '',
                    cfSampleRecipe: recipe || '',
                    cfSampleGrams: grams ? `${grams}g` : '',
                    cfSamplePrice: price ? `₹${price}` : '',
                    cfDeliveryAddress: `${address || ''}, ${city || ''} - ${pincode || ''}`,
                    cfSampleStatus: 'booked',
                }
            });
            leadId = created.id;
        }

        // Add a note with full order details
        await kylasPost('/v1/notes/relation', {
            sourceEntity: {
                description: `Sample Booking\nDog: ${dogName || 'N/A'}\nPhone: ${phone}\nRecipe: ${recipe} (${grams}g)\nAmount: ₹${price}\nAddress: ${address}, ${city} - ${pincode}`.trim()
            },
            targetEntityId: parseInt(leadId, 10),
            targetEntityType: 'LEAD'
        });

        return res.status(200).json({ ok: true, leadId });
    } catch (err) {
        console.error('[kylas-sample]', err);
        // Fail silently — never block the user flow
        return res.status(200).json({ ok: false, error: err.message });
    }
}
