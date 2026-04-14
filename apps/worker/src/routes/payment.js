import { Hono } from 'hono';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';

const paymentRoutes = new Hono();

paymentRoutes.post('/create-order', async (c) => {
    const { amount } = await c.req.json();

    if (!amount || isNaN(amount) || amount <= 0) {
        return c.json({ message: "Invalid amount" }, 400);
    }

    const keyId = c.env.RAZORPAY_KEY_ID;
    const keySecret = c.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return c.json({ message: "Server Config Error" }, 500);
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // paise
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            })
        });

        const order = await response.json();

        if (order.error) {
            throw new Error(order.error.description);
        }

        return c.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: keyId
        });

    } catch (error) {
        return c.json({ message: error.message }, 500);
    }
});

paymentRoutes.post('/verify', async (c) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();
    const secret = c.env.RAZORPAY_KEY_SECRET;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = createHmac("sha256", secret)
        .update(sign)
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        return c.json({ message: "Payment verified successfully" });
    } else {
        return c.json({ message: "Invalid signature" }, 400);
    }
});

export default paymentRoutes;
