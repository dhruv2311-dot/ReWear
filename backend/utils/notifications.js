const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (req, payload) => {
  try {
    if (!payload?.recipient) return null;

    // Avoid creating noisy self-notifications.
    if (payload.actor && payload.recipient.toString() === payload.actor.toString()) {
      return null;
    }

    const recipientExists = await User.exists({ _id: payload.recipient });
    if (!recipientExists) return null;

    const notification = await Notification.create(payload);
    const hydrated = await Notification.findById(notification._id)
      .populate('actor', 'name avatar')
      .populate('item', 'title images')
      .populate('swap', 'status type')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${payload.recipient}`).emit('notification:new', hydrated || notification);
    }
    return hydrated || notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };