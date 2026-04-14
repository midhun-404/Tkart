import { Hono } from 'hono';
import { Firestore } from '../lib/firestore';

const orderRoutes = new Hono();

// Create Order (Simulated Logic)
// In a full implementation, we would replicate the exact `addOrderItems` logic 
// (stock check, coupon validation, etc.)
orderRoutes.post('/', async (c) => {
    const db = new Firestore(c.env);
    const body = await c.req.json();
    const { orderItems, shippingAddress, paymentMethod, totalAmount, user } = body;
    // Note: Assuming Auth Middleware attaches user info, or client sends it for now.
    // Ideally we verifying the JWT here.

    try {
        // Basic Stock Check (Simplified for migration speed)
        // For distinct correctness, we should loop items and check db.getDocument('products', id)

        const newOrder = {
            user_id: user?.id || 'guest',
            user_name: user?.name || body.userName,
            user_email: user?.email,
            shipping_address: shippingAddress,
            total_amount: totalAmount,
            total_profit: Math.round(totalAmount * 0.3), // Simulated 30% profit margin
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'COD' ? 'Pending' : 'Paid', // Simplified
            order_status: 'Placed',
            created_at: new Date().toISOString(),
            items: orderItems // Storing items directly in order doc for simplicity in NoSQL
        };

        const doc = await db.addDocument('orders', newOrder);
        // Extract ID
        const id = doc.name.split('/').pop();

        // Return structured order
        return c.json({ id, ...newOrder }, 201);
    } catch (error) {
        return c.json({ message: error.message }, 500);
    }
});

orderRoutes.get('/my-orders', async (c) => {
    const db = new Firestore(c.env);
    const userId = c.req.query('userId'); // Pass userId via query for now (or auth header in future)

    try {
        if (!userId) return c.json({ error: "UserId required" }, 400);

        const orders = await db.runQuery('orders', [{ field: 'user_id', value: userId }]);
        return c.json(orders);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default orderRoutes;
