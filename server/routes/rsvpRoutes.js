const express = require('express');
const router = express.Router();
const {
  createOrUpdateRSVP,
  getMyRSVPs,
  getEventRSVPs,
  exportRSVPsCSV,
  checkInGuest,
  downloadICS,
  manualAddGuest,
  removeGuest,
} = require('../controllers/rsvpController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createOrUpdateRSVP);
router.get('/my', protect, getMyRSVPs);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventRSVPs);
router.get('/event/:eventId/export', protect, authorize('organizer', 'admin'), exportRSVPsCSV);
router.post('/check-in', protect, authorize('organizer', 'admin'), checkInGuest);
router.get('/calendar/:eventId', downloadICS);
router.post('/event/:eventId/manual', protect, authorize('organizer', 'admin'), manualAddGuest);
router.delete('/:id', protect, authorize('organizer', 'admin'), removeGuest);

module.exports = router;
