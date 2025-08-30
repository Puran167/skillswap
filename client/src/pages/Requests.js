import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const Requests = () => {
    const [swaps, setSwaps] = useState([]);
    const [activeTab, setActiveTab] = useState('received');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resUser, resSwaps] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/swaps')
                ]);
                setUser(resUser.data);
                setSwaps(resSwaps.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/swaps/${id}`, { status });
            // Refresh swaps
            const resSwaps = await api.get('/swaps');
            setSwaps(resSwaps.data);
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const deleteRequest = async (id) => {
        if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
            try {
                await api.delete(`/swaps/${id}`);
                // Refresh swaps
                const resSwaps = await api.get('/swaps');
                setSwaps(resSwaps.data);
            } catch (err) {
                console.error('Error deleting request:', err);
                alert('Error deleting request. ' + (err.response?.data?.msg || err.message));
            }
        }
    };

    const receivedRequests = swaps.filter(swap => swap.responderId._id === user?._id);
    const sentRequests = swaps.filter(swap => swap.requesterId._id === user?._id);

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'accepted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Sidebar />
            
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Swap Requests 📋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your incoming and outgoing skill swap requests
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('received')}
                                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                                    activeTab === 'received'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="block text-lg mb-1">📥</span>
                                Received ({receivedRequests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('sent')}
                                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                                    activeTab === 'sent'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="block text-lg mb-1">📤</span>
                                Sent ({sentRequests.length})
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'received' ? (
                                <div className="space-y-4">
                                    {receivedRequests.length > 0 ? (
                                        receivedRequests.map(swap => (
                                            <div key={swap._id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {swap.requesterId.name?.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                Request from {swap.requesterId.name}
                                                            </h3>
                                                            <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                                    They want to learn:
                                                                </p>
                                                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                                                    {swap.skillOffered}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-1">
                                                                    In exchange for teaching:
                                                                </p>
                                                                <p className="font-medium text-green-600 dark:text-green-400">
                                                                    {swap.skillNeeded}
                                                                </p>
                                                            </div>
                                                            <div className="mt-3 flex items-center space-x-3">
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swap.status)}`}>
                                                                    {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                                                                </span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(swap.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2">
                                                        {swap.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatus(swap._id, 'accepted')}
                                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                                >
                                                                    ✅ Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(swap._id, 'rejected')}
                                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                                >
                                                                    ❌ Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {swap.status === 'accepted' && (
                                                            <button
                                                                onClick={() => updateStatus(swap._id, 'completed')}
                                                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                            >
                                                                ✅ Mark Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => window.location.href = `/chat/${swap.requesterId._id}`}
                                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                        >
                                                            💬 Chat
                                                        </button>
                                                        {(swap.status === 'pending' || swap.status === 'rejected') && (
                                                            <button
                                                                onClick={() => deleteRequest(swap._id)}
                                                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                                title="Delete this request"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">📥</div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                No requests received yet
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                When others want to swap skills with you, they'll appear here
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sentRequests.length > 0 ? (
                                        sentRequests.map(swap => (
                                            <div key={swap._id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {swap.responderId.name?.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                Request to {swap.responderId.name}
                                                            </h3>
                                                            <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                                    You want to teach:
                                                                </p>
                                                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                                                    {swap.skillOffered}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-1">
                                                                    In exchange for learning:
                                                                </p>
                                                                <p className="font-medium text-green-600 dark:text-green-400">
                                                                    {swap.skillNeeded}
                                                                </p>
                                                            </div>
                                                            <div className="mt-3 flex items-center space-x-3">
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swap.status)}`}>
                                                                    {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                                                                </span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(swap.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2">
                                                        {swap.status === 'accepted' && (
                                                            <button
                                                                onClick={() => updateStatus(swap._id, 'completed')}
                                                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                            >
                                                                ✅ Mark Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => window.location.href = `/chat/${swap.responderId._id}`}
                                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                        >
                                                            💬 Chat
                                                        </button>
                                                        {(swap.status === 'pending' || swap.status === 'rejected') && (
                                                            <button
                                                                onClick={() => deleteRequest(swap._id)}
                                                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                                title="Delete this request"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">📤</div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                No requests sent yet
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                Start browsing skills and send your first swap request
                                            </p>
                                            <button
                                                onClick={() => window.location.href = '/browse'}
                                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                            >
                                                Browse Skills
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Requests;
