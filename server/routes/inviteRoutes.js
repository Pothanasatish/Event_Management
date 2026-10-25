const express = require('express');
const router = express.Router();
const {
  bulkSendInvites,
  getEventInvites,
  getInviteByToken,
  respondToInvite,
} = require('../controllers/inviteController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:eventId/bulk', protect, authorize('organizer', 'admin'), bulkSendInvites);
router.get('/:eventId', protect, authorize('organizer', 'admin'), getEventInvites);
router.get('/token/:token', getInviteByToken);
router.post('/token/:token/respond', respondToInvite);

module.exports = router;
