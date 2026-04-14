import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import dealRoutes from './routes/deals';
import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';

const app = new Hono();

// CORS Middleware
app.use('/*', cors({
    origin: '*', // Allow all origins for now (dev/prod)
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}));

// Routes
app.get('/', (c) => c.text('TrendKart Worker Backend is Running!'));

app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/deals', dealRoutes);
app.route('/api/payment', paymentRoutes);
app.route('/api/admin', adminRoutes);

export default app;
