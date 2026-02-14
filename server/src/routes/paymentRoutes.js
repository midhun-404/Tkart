const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment } = require('../controllers/PaymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

module.exports = router;
