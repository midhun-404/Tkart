const express = require('express');
const router = express.Router();
const controller = require('../controllers/OrderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, controller.addOrderItems)
    .get(protect, (req, res, next) => {
        if (req.user.role === 'admin') controller.getAllOrders(req, res);
        else res.status(403).json({ message: 'Not authorized' });
    });

router.route('/:id/status').put(protect, (req, res, next) => {
    if (req.user.role === 'admin') controller.updateOrderStatus(req, res);
    else res.status(403).json({ message: 'Not authorized' });
});

router.route('/myorders').get(protect, controller.getMyOrders);

router.route('/stats').get(protect, (req, res, next) => {
    if (req.user.role === 'admin') controller.getDashboardStats(req, res);
    else res.status(403).json({ message: 'Not authorized' });
});

module.exports = router;
