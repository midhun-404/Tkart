const express = require('express');
const router = express.Router();
const { createCoupon, getAllCoupons, deleteCoupon, validateCoupon } = require('../controllers/CouponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAllCoupons).post(protect, admin, createCoupon);
router.route('/:id').delete(protect, admin, deleteCoupon);
router.post('/validate', validateCoupon);

module.exports = router;
