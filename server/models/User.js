const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  profilePic: {
    type: String,
  },
  skillsOffered: {
    type: [String],
  },
  skillsNeeded: {
    type: [String],
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
      rating: Number,
      _swapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Swap' }
    },
  ],
  phoneNumber: {
    type: String,
  },
  deviceToken: {
    type: String,
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
