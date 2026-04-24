// server/api/config.js
// Returns global application configuration (scans per pack, free scans, etc.)
// This avoids hardcoding these rules in the frontend environment.

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    return res.status(200).json({
        numFreeScans: parseInt(process.env.NUM_FREE_SCAN || '1', 10),
        numPaidScansPerPack: parseInt(process.env.NUM_SCAN || '5', 10),
        payuAmount: process.env.PAYU_AMOUNT || '99.00',
        payuProduct: process.env.PAYU_PRODUCT || 'VetRx Scan - Additional Scans Pack'
    });
}
