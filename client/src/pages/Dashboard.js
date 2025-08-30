import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [matches, setMatches] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewUserId, setReviewUserId] = useState(null);
    const [stats, setStats] = useState({ totalSkills: 0, completedSwaps: 0, pendingRequests: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resUser = await api.get('/users/me');
                setUser(resUser.data);
                const resMatches = await api.get('/users/match');
                setMatches(resMatches.data);
                const resSessions = await api.get('/sessions/upcoming');
                setSessions(resSessions.data);
                await loadSwaps();
                
                // Calculate stats
                const totalSkills = (resUser.data.skillsOffered?.length || 0) + (resUser.data.skillsNeeded?.length || 0);
                setStats(prev => ({ ...prev, totalSkills }));
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, []);

    const loadSwaps = async () => {
        try {
            const resSwaps = await api.get('/swaps');
            setSwaps(resSwaps.data);
            
            const completedSwaps = resSwaps.data.filter(s => s.status === 'completed').length;
            const pendingRequests = resSwaps.data.filter(s => s.status === 'pending').length;
            setStats(prev => ({ ...prev, completedSwaps, pendingRequests }));
        } catch (err) {
            console.error('Error fetching swaps:', err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/swaps/${id}`, { status });
            await loadSwaps();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!reviewUserId) return;
        try {
            await api.post(`/users/${reviewUserId}/review`, { rating: reviewRating, text: reviewText });
            alert('Review submitted successfully!');
            setReviewUserId(null); 
            setReviewText(''); 
            setReviewRating(5);
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    if (!user) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Sidebar />
            
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {user.name}! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Here's what's happening with your skills today.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100">Total Skills</p>
                                    <p className="text-2xl font-bold">{stats.totalSkills}</p>
                                </div>
                                <div className="text-3xl">⭐</div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100">Completed Swaps</p>
                                    <p className="text-2xl font-bold">{stats.completedSwaps}</p>
                                </div>
                                <div className="text-3xl">✅</div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100">Pending Requests</p>
                                    <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                                </div>
                                <div className="text-3xl">⏳</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Profile</h2>
                            <div className="text-center mb-4">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="Profile" className="w-20 h-20 rounded-full mx-auto mb-3" />
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                                <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                {user.rating > 0 && (
                                    <div className="flex items-center justify-center mt-2">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                                            {user.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Skills Offered</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skillsOffered?.map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Skills Needed</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skillsNeeded?.map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <Link 
                                to="/profile" 
                                className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-center block"
                            >
                                Edit Profile
                            </Link>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Link 
                                        to="/add-skill"
                                        className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <span className="text-2xl">➕</span>
                                        <span className="font-medium text-blue-700 dark:text-blue-400">Add Skills</span>
                                    </Link>
                                    
                                    <Link 
                                        to="/schedule"
                                        className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                    >
                                        <span className="text-2xl">📅</span>
                                        <span className="font-medium text-green-700 dark:text-green-400">Schedule Session</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Matches */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Recommended Matches ({matches.length})
                                </h2>
                                {matches.length > 0 ? (
                                    <div className="space-y-3">
                                        {matches.slice(0, 3).map(match => (
                                            <div key={match._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {match.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{match.name}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Skills match available
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link 
                                                    to={`/chat/${match._id}`} 
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                                >
                                                    Chat
                                                </Link>
                                            </div>
                                        ))}
                                        {matches.length > 3 && (
                                            <Link 
                                                to="/browse" 
                                                className="block text-center text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                View all {matches.length} matches
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">No matches found yet</p>
                                        <Link 
                                            to="/add-skill" 
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Add more skills to find matches
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Upcoming Sessions */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Upcoming Sessions ({sessions.length})
                                </h2>
                                {sessions.length > 0 ? (
                                    <div className="space-y-3">
                                        {sessions.slice(0, 3).map(session => {
                                            const isCreator = session.creatorId._id === user._id;
                                            const otherUser = isCreator ? session.participantId : session.creatorId;
                                            
                                            return (
                                                <div key={session._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            📅
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{session.title}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                With {otherUser.name} • {new Date(session.date).toLocaleDateString()} at {session.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Link 
                                                        to="/schedule" 
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                        {sessions.length > 3 && (
                                            <Link 
                                                to="/schedule" 
                                                className="block text-center text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                View all {sessions.length} sessions
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming sessions</p>
                                        <Link 
                                            to="/schedule" 
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Schedule your first session
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Recent Swaps */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Recent Swap Requests
                                </h2>
                                {swaps.length > 0 ? (
                                    <div className="space-y-3">
                                        {swaps.slice(0, 5).map(swap => {
                                            const otherName = swap.requesterId._id === user._id ? swap.responderId.name : swap.requesterId.name;
                                            const otherId = swap.requesterId._id === user._id ? swap.responderId._id : swap.requesterId._id;
                                            const isReceived = swap.responderId._id === user._id;
                                            
                                            return (
                                                <div key={swap._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {isReceived ? 'From' : 'To'} {otherName}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {swap.skillOffered} ↔ {swap.skillNeeded}
                                                        </p>
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                                                            swap.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                            swap.status === 'accepted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                                            swap.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                        }`}>
                                                            {swap.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2">
                                                        {swap.status === 'pending' && isReceived && (
                                                            <>
                                                                <button 
                                                                    onClick={() => updateStatus(swap._id, 'accepted')} 
                                                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button 
                                                                    onClick={() => updateStatus(swap._id, 'rejected')} 
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {swap.status === 'accepted' && (
                                                            <button 
                                                                onClick={() => updateStatus(swap._id, 'completed')} 
                                                                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
                                                            >
                                                                Mark Complete
                                                            </button>
                                                        )}
                                                        {swap.status === 'completed' && (
                                                            <button 
                                                                onClick={() => setReviewUserId(otherId)} 
                                                                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                                                            >
                                                                Review
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {swaps.length > 5 && (
                                            <Link 
                                                to="/requests" 
                                                className="block text-center text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                View all requests
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">No swap requests yet</p>
                                        <Link 
                                            to="/browse" 
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Browse skills to start swapping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Review Modal */}
                    {reviewUserId && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full mx-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submit Review</h3>
                                <form onSubmit={submitReview} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Rating
                                        </label>
                                        <select 
                                            value={reviewRating} 
                                            onChange={e => setReviewRating(Number(e.target.value))} 
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            {[1,2,3,4,5].map(r => (
                                                <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Feedback (optional)
                                        </label>
                                        <textarea
                                            value={reviewText} 
                                            onChange={e => setReviewText(e.target.value)} 
                                            placeholder="Share your experience..."
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            rows="3"
                                        />
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <button 
                                            type="submit" 
                                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Submit Review
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setReviewUserId(null)} 
                                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
