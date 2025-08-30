const User = require('../models/User');
const Swap = require('../models/Swap');

// Get current user's profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { name, bio, profilePic, skillsOffered, skillsNeeded } = req.body;

  const profileFields = {};
  if (name) profileFields.name = name;
  if (bio) profileFields.bio = bio;
  if (profilePic) profileFields.profilePic = profilePic;
  if (skillsOffered) profileFields.skillsOffered = skillsOffered;
  if (skillsNeeded) profileFields.skillsNeeded = skillsNeeded;

  try {
    let user = await User.findById(req.user.id);

    if (user) {
      // Update
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');

      return res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get matching users
exports.getMatchingUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const users = await User.find({
            _id: { $ne: req.user.id }, // Exclude current user
            skillsOffered: { $in: currentUser.skillsNeeded },
            skillsNeeded: { $in: currentUser.skillsOffered }
        }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add a review for another user (allowed only if a completed swap exists between users)
exports.addReview = async (req, res) => {
  const { userId } = req.params;
  const { rating, text } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
  }
  try {
    // Ensure there is at least one completed swap between the two users
    const completedSwap = await Swap.findOne({
      status: 'completed',
      $or: [
        { requesterId: req.user.id, responderId: userId },
        { requesterId: userId, responderId: req.user.id }
      ]
    });
    if (!completedSwap) {
      return res.status(403).json({ msg: 'You can only review users after a completed swap.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ msg: 'User not found' });

    // Prevent duplicate review per swap per reviewer (optional simple check: one review per target from this user per completed swap)
    const alreadyReviewed = targetUser.reviews.find(r => r.user.toString() === req.user.id && r._swapId === completedSwap._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ msg: 'You have already reviewed this user for this swap.' });
    }

    targetUser.reviews.push({ user: req.user.id, text: text || '', rating, _swapId: completedSwap._id });
    // Recalculate average rating
    const total = targetUser.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    targetUser.rating = total / targetUser.reviews.length;
    await targetUser.save();
    res.json({ rating: targetUser.rating, reviews: targetUser.reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
