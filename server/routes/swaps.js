const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const swapController = require('../controllers/swaps');

// @route   POST api/swaps
// @desc    Create a swap request
// @access  Private
router.post('/', auth, swapController.createSwap);

// @route   GET api/swaps
// @desc    Get my swap requests (sent and received)
// @access  Private
router.get('/', auth, swapController.getMySwaps);

// @route   PUT api/swaps/:id
// @desc    Update swap status
// @access  Private
router.put('/:id', auth, swapController.updateSwapStatus);

// @route   DELETE api/swaps/:id
// @desc    Delete a swap request
// @access  Private
router.delete('/:id', auth, swapController.deleteSwap);

module.exports = router;
