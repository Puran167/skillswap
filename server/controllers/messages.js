const Message = require('../models/Message');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { sendNotificationToUser } = require('./notifications');

// Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  if (!text) return res.status(400).json({ msg: 'Text required' });
  
  try {
    const newMessage = new Message({ senderId: req.user.id, receiverId, text });
    const message = await newMessage.save();

    // Get sender and receiver details for notifications
    const [sender, receiver] = await Promise.all([
      User.findById(req.user.id).select('name email'),
      User.findById(receiverId).select('name email notificationPreferences')
    ]);

    if (receiver && sender) {
      // Send email notification if user has email notifications enabled
      const emailEnabled = receiver.notificationPreferences?.email !== false;
      
      if (emailEnabled) {
        try {
          await sendEmail(
            receiver.email,
            'New Message on SkillSwap',
            `Hi ${receiver.name},\n\nYou have received a new message from ${sender.name}:\n\n"${text}"\n\nLog in to SkillSwap to reply: http://localhost:3000/messages\n\nBest regards,\nThe SkillSwap Team`
          );
        } catch (emailError) {
          console.error('Error sending message email:', emailError.message);
        }
      }

      // Send in-app notification
      try {
        await sendNotificationToUser(receiverId, {
          type: 'message',
          title: 'New Message',
          message: `${sender.name} sent you a message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
          priority: 'high',
          relatedId: message._id
        });
      } catch (notificationError) {
        console.error('Error sending in-app notification:', notificationError.message);
      }
    }

    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get messages with a user
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// List conversations (distinct user ids with last message)
exports.getConversations = async (req, res) => {
  try {
    const userId = require('mongoose').Types.ObjectId(req.user.id);
    
    const pipeline = [
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          _id: 1,
          otherUser: {
            _id: '$otherUser._id',
            name: '$otherUser.name',
            email: '$otherUser.email',
            profilePic: '$otherUser.profilePic',
            skillsOffered: '$otherUser.skillsOffered',
            skillsNeeded: '$otherUser.skillsNeeded'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            text: '$lastMessage.text',
            senderId: '$lastMessage.senderId',
            receiverId: '$lastMessage.receiverId',
            createdAt: '$lastMessage.timestamp',
            isRead: '$lastMessage.isRead'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $limit: 50
      }
    ];
    
    const conversations = await Message.aggregate(pipeline);
    res.json(conversations);
  } catch (e) {
    console.error('Error in getConversations:', e.message);
    res.status(500).send('Server Error');
  }
};

// Mark messages as read
exports.markRead = async (req, res) => {
  try {
    const { userId } = req.params; // other user
    await Message.updateMany({ senderId: userId, receiverId: req.user.id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server Error');
  }
};
