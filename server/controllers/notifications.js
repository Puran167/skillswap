const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { sendSMS } = require('../utils/smsService');
const { sendPushNotification } = require('../utils/pushService');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type, data, priority } = req.body;

    const notification = new Notification({
      userId,
      message,
      type,
      data: data || {},
      priority: priority || 'medium'
    });

    await notification.save();

    // Emit real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('newNotification', notification);
    }

    res.status(201).json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });

    res.json({
      notifications,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil((await Notification.countDocuments({ userId: req.user.id })) / limit)
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await notification.deleteOne();

    res.json({ msg: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Helper function to send notification via multiple channels
exports.sendNotificationToUser = async (userId, message, type, data = {}, channels = ['inApp']) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const promises = [];

    // In-app notification
    if (channels.includes('inApp') && user.notificationPreferences.inApp) {
      const notification = new Notification({
        userId,
        message,
        type,
        data
      });
      promises.push(notification.save());
    }

    // Email notification
    if (channels.includes('email') && user.notificationPreferences.email && user.email) {
      promises.push(sendEmail(user.email, getEmailSubject(type), message));
    }

    // SMS notification
    if (channels.includes('sms') && user.notificationPreferences.sms && user.phoneNumber) {
      promises.push(sendSMS(user.phoneNumber, message));
    }

    // Push notification
    if (channels.includes('push') && user.notificationPreferences.push && user.deviceToken) {
      promises.push(sendPushNotification(user.deviceToken, getEmailSubject(type), message));
    }

    await Promise.all(promises);

    // Emit real-time notification if in-app is enabled
    if (channels.includes('inApp') && user.notificationPreferences.inApp) {
      const io = global.io;
      if (io) {
        io.to(userId.toString()).emit('newNotification', {
          userId,
          message,
          type,
          data,
          createdAt: new Date()
        });
      }
    }

    return true;
  } catch (err) {
    console.error('Error sending notification:', err);
    return false;
  }
};

// Helper function to get email subject based on notification type
const getEmailSubject = (type) => {
  switch (type) {
    case 'swap':
      return 'SkillSwap - New Swap Activity';
    case 'session':
      return 'SkillSwap - Session Reminder';
    case 'system':
      return 'SkillSwap - System Update';
    default:
      return 'SkillSwap - Notification';
  }
};
