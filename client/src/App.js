import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Browse from './pages/Browse';
import Chat from './pages/Chat';
import ChatList from './pages/ChatList';
import AddSkill from './pages/AddSkill';
import Schedule from './pages/Schedule';
import Requests from './pages/Requests';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/browse" element={<PrivateRoute><Browse /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><ChatList /></PrivateRoute>} />
            <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/add-skill" element={<PrivateRoute><AddSkill /></PrivateRoute>} />
            <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
            <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
