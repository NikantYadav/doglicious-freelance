
// api/payu-failure.js
// PayU POSTs here on payment failure or cancellation.

export default async function handler(req, res) {
    const params = req.body || {};
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.warn('[payu-failure] Payment failed/cancelled:', params.txnid, params.status);
    const qp = new URLSearchParams({ payu_status: 'payment_failed', txnid: params.txnid || '' });
    res.redirect(302, `${frontendUrl}?${qp.toString()}`);
}
