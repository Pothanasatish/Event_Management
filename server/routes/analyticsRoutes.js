const express = require('express');
const router = express.Router();
const {
  getOrganizerAnalytics,
  getAdminAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/organizer', protect, authorize('organizer', 'admin'), getOrganizerAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
