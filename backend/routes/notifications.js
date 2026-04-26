const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllRead,
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markNotificationRead);
router.patch('/:id/unread', protect, markNotificationUnread);

module.exports = router;