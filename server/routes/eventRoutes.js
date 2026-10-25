const express = require('express');
const router = express.Router();
const {
  getEvents,
  getFeaturedEvents,
  getEventById,
  getRelatedEvents,
  createEvent,
  updateEvent,
  cancelEvent,
  duplicateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getEvents);
router.get('/featured', optionalAuth, getFeaturedEvents);
router.get('/:idOrSlug', optionalAuth, getEventById);
router.get('/:id/related', optionalAuth, getRelatedEvents);

router.post('/', protect, authorize('organizer', 'admin'), upload.single('coverImage'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('coverImage'), updateEvent);
router.put('/:id/cancel', protect, authorize('organizer', 'admin'), cancelEvent);
router.post('/:id/duplicate', protect, authorize('organizer', 'admin'), duplicateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
