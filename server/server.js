const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Message = require('./models/Message');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: [
    "https://message-site-frontend.onrender.com",
    "http://localhost:3000"
  ],
  credentials: true
}));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/test', require('./routes/test'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://message-site-1.onrender.com",
    methods: ["GET", "POST"]
  }
});

// Make io globally available for notifications
global.io = io;
app.set('io', io);

io.on('connection', (socket) => {
  console.log('a user connected');

  // Join user to their own room for notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('sendMessage', async (message) => {
    try {
      const saved = await new Message({ senderId: message.senderId, receiverId: message.receiverId, text: message.text }).save();
      io.to(message.chatId).emit('receiveMessage', saved);
    } catch (e) {
      console.error('Socket message save error', e.message);
    }
  });

  socket.on('typing', ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit('typing', { userId, isTyping });
  });

  socket.on('markRead', async ({ chatId, readerId, otherUserId }) => {
    try {
      await Message.updateMany({ senderId: otherUserId, receiverId: readerId, isRead: false }, { $set: { isRead: true } });
      socket.to(chatId).emit('readReceipt', { readerId });
    } catch (e) {
      console.error('read receipt error', e.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize cron jobs only if dependencies are available
  try {
    const { initializeCronJobs } = require('./utils/cronJobs');
    initializeCronJobs();
    console.log('Notification system initialized');
  } catch (error) {
    console.log('Notification dependencies not installed yet. Server running without cron jobs.');
    console.log('Run: npm install node-cron nodemailer twilio firebase-admin');
  }
});
