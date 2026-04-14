const CouponRepository = require('../database/repositories/CouponRepository');

const createCoupon = async (req, res) => {
    try {
        const coupon = await CouponRepository.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await CouponRepository.findAll();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        await CouponRepository.delete(req.params.id);
        res.json({ message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await CouponRepository.findByCode(code);

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (new Date(coupon.expiry_date) < new Date()) {
            return res.status(400).json({ message: 'Coupon expired' });
        }

        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createCoupon, getAllCoupons, deleteCoupon, validateCoupon };
