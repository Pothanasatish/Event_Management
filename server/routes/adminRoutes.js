const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  toggleFeaturedEvent,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.put('/events/:id/toggle-featured', toggleFeaturedEvent);

module.exports = router;
