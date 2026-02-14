const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const BrandController = require('../controllers/BrandController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: Get All
router.get('/categories', CategoryController.getAll);
router.get('/brands', BrandController.getAll);

// Admin: CRUD
router.post('/categories', protect, admin, CategoryController.create);
router.put('/categories/:id', protect, admin, CategoryController.update);
router.delete('/categories/:id', protect, admin, CategoryController.remove);

router.post('/brands', protect, admin, BrandController.create);
router.put('/brands/:id', protect, admin, BrandController.update);
router.delete('/brands/:id', protect, admin, BrandController.remove);

module.exports = router;
