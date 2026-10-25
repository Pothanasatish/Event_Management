const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getSavedEvents,
  toggleSaveEvent,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/saved-events', protect, getSavedEvents);
router.post('/saved-events/:eventId', protect, toggleSaveEvent);

module.exports = router;
