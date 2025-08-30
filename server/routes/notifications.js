const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notifications');

// @route   POST /api/notifications
// @desc    Create a notification
// @access  Private
router.post('/', auth, notificationController.createNotification);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, notificationController.getUserNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
