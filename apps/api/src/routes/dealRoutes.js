const express = require('express');
const router = express.Router();
const { setDeal, getActiveDeal, removeDeal } = require('../controllers/DealController');
const { protect, admin } = require('../middleware/authMiddleware');

console.log("Deal Routes Loaded");
router.post('/', protect, admin, setDeal);      // Set/Update Deal
router.get('/', getActiveDeal);                // Public get active deal
router.delete('/', protect, admin, removeDeal); // Remove deal

module.exports = router;
