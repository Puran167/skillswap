const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const { sendNotificationToUser } = require('./notifications');

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send welcome email notification
    try {
      await sendEmail(
        email,
        'Welcome to SkillSwap!',
        `Hi ${name},\n\nWelcome to SkillSwap! Your account has been successfully created.\n\nYou can now start connecting with other learners and sharing your skills.\n\nBest regards,\nThe SkillSwap Team`
      );

      // Also create an in-app notification
      await sendNotificationToUser(user._id, {
        type: 'system',
        title: 'Welcome to SkillSwap!',
        message: 'Your account has been successfully created. Start exploring and connecting with other learners!',
        priority: 'medium'
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError.message);
      // Don't fail the registration if email fails
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Send login notification email
    try {
      const currentDate = new Date().toLocaleString();
      await sendEmail(
        email,
        'SkillSwap Login Notification',
        `Hi ${user.name},\n\nYou have successfully logged into your SkillSwap account on ${currentDate}.\n\nIf this wasn't you, please secure your account immediately.\n\nBest regards,\nThe SkillSwap Team`
      );

      // Also create an in-app notification
      await sendNotificationToUser(user._id, {
        type: 'system',
        title: 'Login Successful',
        message: `Welcome back! You logged in on ${currentDate}`,
        priority: 'low'
      });
    } catch (emailError) {
      console.error('Error sending login email:', emailError.message);
      // Don't fail the login if email fails
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
