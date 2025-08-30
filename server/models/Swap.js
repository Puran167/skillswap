const mongoose = require('mongoose');

const SwapSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillOffered: {
    type: String,
    required: true,
  },
  skillNeeded: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'rejected'],
    default: 'pending',
  },
});

module.exports = mongoose.model('Swap', SwapSchema);
