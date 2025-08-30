const Swap = require('../models/Swap');
const User = require('../models/User');
const { sendNotificationToUser } = require('./notifications');

// Create a swap request
exports.createSwap = async (req, res) => {
  const { responderId, skillOffered, skillNeeded } = req.body;

  try {
    const newSwap = new Swap({
      requesterId: req.user.id,
      responderId,
      skillOffered,
      skillNeeded,
    });

    const swap = await newSwap.save();
    
    // Get requester details for notification
    const requester = await User.findById(req.user.id);
    
    // Send notification to responder
    await sendNotificationToUser(
      responderId,
      `${requester.name} wants to swap ${skillOffered} for ${skillNeeded}`,
      'swap',
      { swapId: swap._id, requesterId: req.user.id },
      ['inApp', 'email']
    );
    
    res.json(swap);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get my swap requests
exports.getMySwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requesterId: req.user.id }, { responderId: req.user.id }],
    }).populate('requesterId responderId', 'name');
    res.json(swaps);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update swap status (responder can accept/reject; requester or responder can mark completed)
exports.updateSwapStatus = async (req, res) => {
  const { status } = req.body; // expected: accepted | rejected | completed
  try {
    let swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ msg: 'Swap not found' });

    const isRequester = swap.requesterId.toString() === req.user.id;
    const isResponder = swap.responderId.toString() === req.user.id;
    if (!isRequester && !isResponder) return res.status(401).json({ msg: 'Not authorized' });

    // Rules
    if ((status === 'accepted' || status === 'rejected') && !isResponder) {
      return res.status(403).json({ msg: 'Only responder can accept or reject.' });
    }
    if (status === 'completed' && swap.status !== 'accepted') {
      return res.status(400).json({ msg: 'Swap must be accepted before completion.' });
    }

    const oldStatus = swap.status;
    swap.status = status;
    await swap.save();

    // Send notification based on status change
    const currentUser = await User.findById(req.user.id);
    const otherUserId = isRequester ? swap.responderId : swap.requesterId;
    
    let message = '';
    if (status === 'accepted') {
      message = `${currentUser.name} accepted your swap request`;
    } else if (status === 'rejected') {
      message = `${currentUser.name} declined your swap request`;
    } else if (status === 'completed') {
      message = `Swap with ${currentUser.name} has been marked as completed`;
    }

    if (message) {
      await sendNotificationToUser(
        otherUserId,
        message,
        'swap',
        { swapId: swap._id, status },
        ['inApp', 'email']
      );
    }

    res.json(swap);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a swap request
exports.deleteSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    
    if (!swap) {
      return res.status(404).json({ msg: 'Swap request not found' });
    }

    const isRequester = swap.requesterId.toString() === req.user.id;
    const isResponder = swap.responderId.toString() === req.user.id;
    
    // Only allow requester or responder to delete
    if (!isRequester && !isResponder) {
      return res.status(401).json({ msg: 'Not authorized to delete this request' });
    }

    // Additional rules for deletion
    // - Requester can delete pending or rejected requests
    // - Responder can delete pending requests (essentially rejecting them)
    // - Accepted or completed swaps should not be deleted (for history)
    if (swap.status === 'accepted' || swap.status === 'completed') {
      return res.status(400).json({ 
        msg: 'Cannot delete accepted or completed swaps. This preserves your swap history.' 
      });
    }

    // If responder is deleting a pending request, notify the requester
    if (isResponder && swap.status === 'pending') {
      const responder = await User.findById(req.user.id);
      await sendNotificationToUser(
        swap.requesterId,
        `${responder.name} declined your swap request`,
        'swap',
        { swapId: swap._id, status: 'declined' },
        ['inApp', 'email']
      );
    }

    await Swap.findByIdAndDelete(req.params.id);
    
    res.json({ 
      msg: 'Swap request deleted successfully',
      deletedSwapId: req.params.id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
