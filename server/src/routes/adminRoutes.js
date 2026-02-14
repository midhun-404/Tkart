const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const SettingsController = require('../controllers/SettingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// User Management
router.get('/users', protect, admin, AdminController.getAllUsers);
router.put('/users/:id/block', protect, admin, AdminController.toggleBlockUser);

// System Settings
router.get('/settings', protect, admin, SettingsController.getSettings);
router.post('/settings', protect, admin, SettingsController.updateSettings);

const OrderController = require('../controllers/OrderController');

// Analytics
router.get('/analytics/sales', protect, admin, OrderController.getSalesAnalytics);

module.exports = router;
