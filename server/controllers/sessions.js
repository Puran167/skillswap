const Session = require('../models/Session');
const User = require('../models/User');
const { sendNotificationToUser } = require('./notifications');

// Create a new session
exports.createSession = async (req, res) => {
  const { participantId, title, date, time, mode, location, meetingLink, notes, skillOffered, skillNeeded } = req.body;

  try {
    // Validate required fields
    if (!participantId || !title || !date || !time || !mode || !skillOffered || !skillNeeded) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ msg: 'Participant not found' });
    }

    // Validate mode-specific fields
    if (mode === 'offline' && !location) {
      return res.status(400).json({ msg: 'Location is required for offline sessions' });
    }
    if (mode === 'online' && !meetingLink) {
      return res.status(400).json({ msg: 'Meeting link is required for online sessions' });
    }

    const newSession = new Session({
      creatorId: req.user.id,
      participantId,
      title,
      date: new Date(date),
      time,
      mode,
      location: mode === 'offline' ? location : '',
      meetingLink: mode === 'online' ? meetingLink : '',
      notes,
      skillOffered,
      skillNeeded
    });

    const session = await newSession.save();
    
    // Populate creator and participant info
    const populatedSession = await Session.findById(session._id)
      .populate('creatorId', 'name email')
      .populate('participantId', 'name email');

    // Send notification to participant
    const creator = await User.findById(req.user.id);
    await sendNotificationToUser(
      participantId,
      `${creator.name} scheduled a session "${title}" with you on ${new Date(date).toLocaleDateString()} at ${time}`,
      'session',
      { sessionId: session._id, type: 'session_scheduled' },
      ['inApp', 'email']
    );

    res.json(populatedSession);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all sessions for a user (as creator or participant)
exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { creatorId: req.user.id },
        { participantId: req.user.id }
      ]
    })
    .populate('creatorId', 'name email')
    .populate('participantId', 'name email')
    .sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('creatorId', 'name email')
      .populate('participantId', 'name email');

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Check if user is authorized to view this session
    if (session.creatorId._id.toString() !== req.user.id && 
        session.participantId._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(session);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Session not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update session
exports.updateSession = async (req, res) => {
  const { title, date, time, mode, location, meetingLink, notes, status } = req.body;

  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Check if user is authorized (creator or participant)
    const isCreator = session.creatorId.toString() === req.user.id;
    const isParticipant = session.participantId.toString() === req.user.id;

    if (!isCreator && !isParticipant) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Only creator can edit session details, both can update status
    if (!isCreator && (title || date || time || mode || location || meetingLink || notes)) {
      return res.status(403).json({ msg: 'Only session creator can edit session details' });
    }

    // Build update object
    const updateFields = {};
    if (title && isCreator) updateFields.title = title;
    if (date && isCreator) updateFields.date = new Date(date);
    if (time && isCreator) updateFields.time = time;
    if (mode !== undefined && isCreator) {
      updateFields.mode = mode;
      if (mode === 'offline') {
        updateFields.location = location || '';
        updateFields.meetingLink = '';
      } else {
        updateFields.meetingLink = meetingLink || '';
        updateFields.location = '';
      }
    }
    if (location !== undefined && isCreator) updateFields.location = location;
    if (meetingLink !== undefined && isCreator) updateFields.meetingLink = meetingLink;
    if (notes !== undefined && isCreator) updateFields.notes = notes;
    if (status) updateFields.status = status;

    session = await Session.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    )
    .populate('creatorId', 'name email')
    .populate('participantId', 'name email');

    res.json(session);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Session not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete/Cancel session
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Check if user is authorized (creator or participant)
    if (session.creatorId.toString() !== req.user.id && 
        session.participantId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Instead of deleting, mark as cancelled
    session.status = 'cancelled';
    await session.save();

    res.json({ msg: 'Session cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Session not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get upcoming sessions for dashboard
exports.getUpcomingSessions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      $or: [
        { creatorId: req.user.id },
        { participantId: req.user.id }
      ],
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('creatorId', 'name email')
    .populate('participantId', 'name email')
    .sort({ date: 1 })
    .limit(5);

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
