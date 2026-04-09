const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// Get daily tracking for a given date
router.get('/:date', trackingController.getDailyTracking);

// Mark dose as taken/missed/pending
router.put('/:id', trackingController.updateTrackingStatus);

module.exports = router;
