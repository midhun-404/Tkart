import { Hono } from 'hono';
import { Firestore } from '../lib/firestore';

const adminRoutes = new Hono();

adminRoutes.delete('/reset', async (c) => {
    const db = new Firestore(c.env);
    const collections = ['users', 'orders', 'products', 'deals', 'settings'];

    try {
        let deletedCount = 0;

        for (const col of collections) {
            // Get all documents in collection
            // Firestore runQuery to list all
            // Note: Our simple firestore wrapper might strictly need a filter or can return all.
            // Let's try to get all by using a dummy filter or just listing if possible.
            // If runQuery requires a filter, we can use a "not equal to null" on a field usually present (like 'id' or 'created_at')
            // Or simpler: The simple wrapper might not support listing *all* efficiently without knowing fields.
            // However, usually `runQuery` without a filter returns all? 
            // Let's look at `firestore.js` runQuery again. It builds a structuredQuery.

            // To get ALL documents, we can pass an empty array to runQuery?
            // "if (whereConditions.length > 0)" ... else it just passes "from: [{ collectionId }]".
            // If we pass empty array, it should fetch all.

            const docs = await db.runQuery(col, []);

            for (const doc of docs) {
                if (doc.id) {
                    await db.deleteDocument(col, doc.id);
                    deletedCount++;
                }
            }
        }

        return c.json({ success: true, message: `System reset complete. ${deletedCount} documents deleted.` });
    } catch (error) {
        console.error("Reset Error:", error);
        return c.json({ error: error.message }, 500);
    }
});

export default adminRoutes;
