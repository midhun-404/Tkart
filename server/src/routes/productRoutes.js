const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, deleteProduct } = require('../controllers/ProductController');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getProducts).post(protect, admin, upload.array('images'), createProduct);
router.route('/:id').get(getProductById).delete(protect, admin, deleteProduct);

module.exports = router;
