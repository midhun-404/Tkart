const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[DEBUG] Request In: ${req.method} ${req.url}`);
    next();
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes (Placeholder)
app.get('/', (req, res) => {
    res.send('TrendKart API is running');
});

app.get('/api/test-deal-direct', (req, res) => {
    res.json({ message: "Direct route works" });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');


const dealRoutes = require('./routes/dealRoutes');
app.use('/api/deals', dealRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);
const couponRoutes = require('./routes/couponRoutes');
app.use('/api/coupons', couponRoutes);
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api', inventoryRoutes); // /api/categories, /api/brands
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes); // /api/admin/users, /api/admin/settings

// const dealRoutes = require('./routes/dealRoutes');
// app.use('/api/deals', dealRoutes);

// Serve frontend in production
// Serve frontend in production
// if (process.env.NODE_ENV === 'production' || true) { // Force for this setup
//     app.use(express.static(path.join(__dirname, '../../client/dist')));
//
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
//     });
// }

// 404 Handler
app.use((req, res, next) => {
    console.log(`[DEBUG] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

module.exports = app;
