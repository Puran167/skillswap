const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messages');

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, messageController.sendMessage);

// @route   GET api/messages/:userId
// @desc    Get messages with a user
// @access  Private
router.get('/:userId', auth, messageController.getMessages);

// @route GET api/messages
// @desc Conversations list
router.get('/', auth, messageController.getConversations);

// @route POST api/messages/:userId/read
// @desc Mark messages from user read
router.post('/:userId/read', auth, messageController.markRead);

module.exports = router;
