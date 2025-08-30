const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/users');

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, userController.getMe);

// @route   GET api/users/match
// @desc    Get matching users
// @access  Private
router.get('/match', auth, userController.getMatchingUsers);

// @route   PUT api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, userController.updateProfile);

// @route   GET api/users
// @desc    Get all users (for browsing skills)
// @access  Public
router.get('/', userController.getAllUsers);

// @route   GET api/users/:userId
// @desc    Get user by ID
// @access  Private
router.get('/:userId', auth, userController.getUserById);

// @route   POST api/users/:userId/review
// @desc    Add a review for a user (requires completed swap)
// @access  Private
router.post('/:userId/review', auth, userController.addReview);


module.exports = router;
