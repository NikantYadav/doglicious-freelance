
// api/payu-failure.js
// PayU POSTs here on payment failure or cancellation.

export default async function handler(req, res) {
    const params = req.body || {};
    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    const origin = base.replace(/\/[^?#]*$/, '');
    const safePath = (params.udf2 || '/').replace(/[^a-zA-Z0-9/_-]/g, '') || '/';
    console.warn('[payu-failure] Payment failed/cancelled:', params.txnid, params.status);
    const qp = new URLSearchParams({ payu_status: 'payment_failed', txnid: params.txnid || '' });
    res.redirect(302, `${origin}${safePath}?${qp.toString()}`);
}
