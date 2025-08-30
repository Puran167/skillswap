const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sessionController = require('../controllers/sessions');

// @route   POST api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', auth, sessionController.createSession);

// @route   GET api/sessions
// @desc    Get all sessions for current user
// @access  Private
router.get('/', auth, sessionController.getUserSessions);

// @route   GET api/sessions/upcoming
// @desc    Get upcoming sessions for dashboard
// @access  Private
router.get('/upcoming', auth, sessionController.getUpcomingSessions);

// @route   GET api/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get('/:id', auth, sessionController.getSessionById);

// @route   PUT api/sessions/:id
// @desc    Update session
// @access  Private
router.put('/:id', auth, sessionController.updateSession);

// @route   DELETE api/sessions/:id
// @desc    Cancel session
// @access  Private
router.delete('/:id', auth, sessionController.deleteSession);

module.exports = router;
