import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import io from 'socket.io-client';
import Sidebar from '../components/Sidebar';

const Chat = () => {
    const { userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        socketRef.current = io('http://localhost:3002', {
            auth: { token }
        });

        // Join the chat room
        const chatId = [currentUser?._id, userId].sort().join('-');
        socketRef.current.emit('joinChat', chatId);

        // Listen for new messages
        socketRef.current.on('receiveMessage', (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Listen for typing status
        socketRef.current.on('typing', ({ userId: typingUserId, isTyping }) => {
            if (typingUserId === userId) {
                setIsTyping(isTyping);
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [userId, currentUser?._id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [messagesRes, userRes, otherUserRes] = await Promise.all([
                    api.get(`/messages/${userId}`),
                    api.get('/users/me'),
                    api.get(`/users/${userId}`)
                ]);
                
                setMessages(messagesRes.data);
                setCurrentUser(userRes.data);
                setOtherUser(otherUserRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
            setLoading(false);
        };
        fetchData();
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        if (!currentUser) return;
        
        const chatId = [currentUser._id, userId].sort().join('-');
        socketRef.current.emit('typing', { chatId, userId: currentUser._id, isTyping: true });
        
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        
        const timeout = setTimeout(() => {
            socketRef.current.emit('typing', { chatId, userId: currentUser._id, isTyping: false });
        }, 1000);
        
        setTypingTimeout(timeout);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        try {
            const messageData = {
                receiverId: userId,
                text: newMessage.trim()
            };

            const res = await api.post('/messages', messageData);
            
            // Emit to socket
            const chatId = [currentUser._id, userId].sort().join('-');
            const socketMessage = {
                senderId: currentUser._id,
                receiverId: userId,
                text: newMessage.trim(),
                chatId,
                timestamp: new Date()
            };
            
            socketRef.current.emit('sendMessage', socketMessage);
            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
            
            // Stop typing
            socketRef.current.emit('typing', { chatId, userId: currentUser._id, isTyping: false });
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Error sending message. Please try again.');
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        const msgDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (msgDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (msgDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return msgDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(message => {
            const date = new Date(message.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Sidebar />
            
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-semibold">
                                    {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {otherUser?.name || 'User'}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Chat with {otherUser?.name || 'user'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Object.entries(messageGroups).map(([date, dayMessages]) => (
                        <div key={date}>
                            {/* Date Separator */}
                            <div className="flex items-center justify-center my-4">
                                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {formatDate(dayMessages[0].timestamp)}
                                    </span>
                                </div>
                            </div>

                            {/* Messages for this date */}
                            {dayMessages.map((message, index) => {
                                const isOwn = message.senderId === currentUser._id;
                                const showAvatar = index === 0 || dayMessages[index - 1].senderId !== message.senderId;
                                
                                return (
                                    <div key={message._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                                        <div className={`flex items-end max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            {showAvatar && !isOwn && (
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 mb-1">
                                                    <span className="text-xs text-white font-semibold">
                                                        {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Message Bubble */}
                                            <div className={`px-4 py-2 rounded-2xl ${
                                                isOwn 
                                                    ? 'bg-blue-500 text-white rounded-br-md' 
                                                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
                                            }`}>
                                                <p className="text-sm">{message.text}</p>
                                                <p className={`text-xs mt-1 ${
                                                    isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    {formatTime(message.timestamp)}
                                                    {isOwn && (
                                                        <span className="ml-1">
                                                            {message.isRead ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            
                                            {/* Spacer for own messages without avatar */}
                                            {showAvatar && isOwn && <div className="w-8 ml-2"></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start mb-2">
                            <div className="flex items-end">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 mb-1">
                                    <span className="text-xs text-white font-semibold">
                                        {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-2xl rounded-bl-md">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                    <form onSubmit={sendMessage} className="flex items-center space-x-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                placeholder="Type a message..."
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors"
                        >
                            Send 📤
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
