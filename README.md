# SkillSwap 🚀

A comprehensive skill exchange platform where users can swap knowledge, schedule learning sessions, and connect with other learners.

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure registration and login system
- **Skill Matching** - Find users with complementary skills
- **Swap Requests** - Send and receive skill exchange requests
- **Session Scheduling** - Schedule and manage learning sessions
- **Real-time Chat** - Communicate with other users
- **Notifications** - Multi-channel notification system

### Advanced Features
- **📧 Email Notifications** - Welcome emails, login alerts, message notifications
- **📱 Real-time Updates** - Socket.IO powered live notifications
- **🗑️ Request Management** - Delete/cancel requests with smart rules
- **📅 Session Reminders** - Automated email reminders for upcoming sessions
- **⭐ Rating System** - Rate and review completed swaps
- **🔍 Advanced Search** - Filter users by skills and preferences

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Nodemailer** for email services
- **Twilio** for SMS notifications
- **Firebase** for push notifications
- **Bcrypt** for password hashing

### Frontend
- **React.js** with functional components
- **Tailwind CSS** for responsive design
- **Axios** for API communication
- **Socket.IO Client** for real-time features

## 📁 Project Structure

```
SkillSystem/
├── server/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── server.js          # Main server file
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── public/
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Gmail account for email services
- Twilio account for SMS (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Puran167/skillswap.git
   cd skillswap
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**
   Create a `.env` file in the server directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the application**
   
   **Backend** (Terminal 1):
   ```bash
   cd server
   npm start
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📧 Email Notifications

The application includes a comprehensive email notification system:

- **Welcome emails** on user registration
- **Login security notifications**
- **New message alerts**
- **Session reminders** (automated)
- **Swap request notifications**

## 🗑️ Request Management

Smart delete functionality for swap requests:
- Delete pending or rejected requests
- Preserve completed swap history
- Automatic notifications on request deletion
- Confirmation dialogs for safety

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users
- `PUT /api/users/me` - Update profile

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps` - Get user's swap requests
- `PUT /api/swaps/:id` - Update swap status
- `DELETE /api/swaps/:id` - Delete swap request

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions` - Get user's sessions
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Cancel session

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/send` - Send notification

## 🧪 Testing

Email notification testing:
```bash
cd server
node test-email.js
```

## 📱 Features in Detail

### Real-time Notifications
- Socket.IO integration for instant updates
- Notification bell with unread count
- Live message delivery
- Session reminder alerts

### Responsive Design
- Mobile-first approach
- Dark/light mode support
- Smooth animations and transitions
- Intuitive user interface

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Authorization middleware
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Puran** - [GitHub](https://github.com/Puran167)

## 🙏 Acknowledgments

- Thanks to all contributors and testers
- Inspired by the need for better skill sharing platforms
- Built with love for the learning community

---

**Happy Learning! 🎓✨**
