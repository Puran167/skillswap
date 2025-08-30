import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const ChatList = () => {
    const [conversations, setConversations] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, conversationsRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/messages')
            ]);
            setCurrentUser(userRes.data);
            setConversations(conversationsRes.data);
        } catch (err) {
            console.error('Error fetching chat data:', err);
        }
        setLoading(false);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (messageDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Sidebar />
            
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Messages 💬
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Your conversations with other SkillSwap members
                        </p>
                    </div>

                    {/* Conversations List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                        {conversations.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {conversations.map((conversation) => {
                                    const otherUser = conversation.otherUser;
                                    const lastMessage = conversation.lastMessage;
                                    const unreadCount = conversation.unreadCount;

                                    return (
                                        <Link
                                            key={otherUser._id}
                                            to={`/chat/${otherUser._id}`}
                                            className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="p-6 flex items-center space-x-4">
                                                {/* Profile Picture */}
                                                <div className="relative">
                                                    {otherUser.profilePic ? (
                                                        <img 
                                                            src={otherUser.profilePic} 
                                                            alt={otherUser.name}
                                                            className="w-12 h-12 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {otherUser.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    {conversation.isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                                    )}
                                                </div>

                                                {/* Message Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                            {otherUser.name}
                                                        </h3>
                                                        <div className="flex items-center space-x-2">
                                                            {lastMessage && (
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {formatTime(lastMessage.createdAt)}
                                                                </span>
                                                            )}
                                                            {unreadCount > 0 && (
                                                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                                    {unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {lastMessage ? (
                                                        <p className="text-gray-600 dark:text-gray-400 truncate mt-1">
                                                            {lastMessage.senderId === currentUser._id ? 'You: ' : ''}
                                                            {lastMessage.text}
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-500 dark:text-gray-500 italic mt-1">
                                                            No messages yet
                                                        </p>
                                                    )}
                                                    
                                                    {/* Skills Preview */}
                                                    {otherUser.skillsOffered && otherUser.skillsOffered.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {otherUser.skillsOffered.slice(0, 3).map((skill, index) => (
                                                                <span 
                                                                    key={index}
                                                                    className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {otherUser.skillsOffered.length > 3 && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                                                                    +{otherUser.skillsOffered.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Arrow */}
                                                <div className="text-gray-400 dark:text-gray-500">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No conversations yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Start chatting with other members to exchange skills
                                </p>
                                <Link 
                                    to="/browse"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                                >
                                    <span className="mr-2">🔍</span>
                                    Browse Skills
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link 
                            to="/browse"
                            className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <span className="text-2xl">🔍</span>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Find New People</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Browse skills and connect</p>
                            </div>
                        </Link>
                        
                        <Link 
                            to="/requests"
                            className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <span className="text-2xl">📋</span>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">View Requests</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Manage swap requests</p>
                            </div>
                        </Link>
                        
                        <Link 
                            to="/schedule"
                            className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <span className="text-2xl">📅</span>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Schedule Session</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Plan your skill swaps</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatList;
