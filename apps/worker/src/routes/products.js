import { Hono } from 'hono';
import { Firestore } from '../lib/firestore';

const productRoutes = new Hono();

productRoutes.get('/', async (c) => {
    const db = new Firestore(c.env);
    const category = c.req.query('category');
    const brand = c.req.query('brand');
    const featured = c.req.query('is_featured');

    let conditions = [];
    if (category) conditions.push({ field: 'category', value: category });
    if (brand) conditions.push({ field: 'brand', value: brand });
    if (featured === 'true') conditions.push({ field: 'is_featured', value: true });

    try {
        let products;
        if (conditions.length > 0) {
            products = await db.runQuery('products', conditions);
        } else {
            products = await db.getCollection('products');
        }
        return c.json(products);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

productRoutes.get('/:id', async (c) => {
    const db = new Firestore(c.env);
    const id = c.req.param('id');
    try {
        const product = await db.getDocument('products', id);
        if (!product) return c.json({ error: "Product not found" }, 404);
        return c.json(product);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Admin Route: Create Product
productRoutes.post('/', async (c) => {
    const db = new Firestore(c.env);
    const body = await c.req.json();
    // TODO: Verify Admin Auth

    try {
        const newDoc = await db.addDocument('products', body);
        return c.json(newDoc, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default productRoutes;
