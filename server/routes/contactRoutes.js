const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getContactMessages,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitContactMessage);
router.get('/', protect, authorize('admin'), getContactMessages);

module.exports = router;
