const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all cart routes

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.put('/update', CartController.updateCartItem);
router.delete('/remove/:productId', CartController.removeFromCart);
router.post('/merge', CartController.mergeCart);

module.exports = router;
