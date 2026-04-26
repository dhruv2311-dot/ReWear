const Notification = require('../models/Notification');

const createNotification = async (req, payload) => {
  try {
    const notification = await Notification.create(payload);
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${payload.recipient}`).emit('notification:new', notification);
    }
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };