import { Hono } from 'hono';
import { Firestore } from '../lib/firestore';

const dealRoutes = new Hono();

// Get Deal of the Day
dealRoutes.get('/', async (c) => {
    const db = new Firestore(c.env);
    try {
        // Query for active deals, sorted by newest
        const deals = await db.runQuery('deals', [
            { field: 'is_active', operator: 'EQUAL', value: true }
        ]);

        // Return the first one or null
        const deal = deals.length > 0 ? deals[0] : null;
        return c.json(deal || { message: "No active deal" });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Create/Update Deal of the Day (Admin)
dealRoutes.post('/', async (c) => {
    const db = new Firestore(c.env);
    try {
        const body = await c.req.json();
        const { product_id, discount_price, end_time, title, image } = body;

        // Validation
        if (!product_id || !end_time) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const newDeal = {
            product_id,
            discount_price,
            end_time,
            title,
            image,
            is_active: true,
            created_at: new Date().toISOString()
        };

        // For simplicity, we can just add a new doc. 
        // In a real app, we might want to deactivate old ones first.
        const doc = await db.addDocument('deals', newDeal);
        return c.json({ id: doc.name.split('/').pop(), ...newDeal }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Delete Deal
dealRoutes.delete('/:id', async (c) => {
    const db = new Firestore(c.env);
    const id = c.req.param('id');
    try {
        await db.deleteDocument('deals', id);
        return c.json({ success: true, message: "Deal deleted" });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default dealRoutes;
