import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const colorFor = (skill) => {
    const s = skill.toLowerCase();
    if (/(js|python|code|dev|react|node|programming|software)/.test(s)) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400';
    if (/(design|ui|ux|photoshop|figma|graphic)/.test(s)) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400';
    if (/(music|guitar|piano|sing|instrument)/.test(s)) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    if (/(cook|bake|chef|recipe)/.test(s)) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    if (/(write|blog|content|author)/.test(s)) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
    if (/(photo|camera|video|edit)/.test(s)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

const Browse = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        if (!filter && category === 'all') return true;
        
        const matchesFilter = !filter || 
            user.skillsOffered.some(skill => skill.toLowerCase().includes(filter.toLowerCase())) ||
            user.skillsNeeded.some(skill => skill.toLowerCase().includes(filter.toLowerCase())) ||
            user.name.toLowerCase().includes(filter.toLowerCase());

        const matchesCategory = category === 'all' || 
            user.skillsOffered.some(skill => {
                const s = skill.toLowerCase();
                switch(category) {
                    case 'coding': return /(js|python|code|dev|react|node|programming|software)/.test(s);
                    case 'design': return /(design|ui|ux|photoshop|figma|graphic)/.test(s);
                    case 'music': return /(music|guitar|piano|sing|instrument)/.test(s);
                    case 'cooking': return /(cook|bake|chef|recipe)/.test(s);
                    case 'writing': return /(write|blog|content|author)/.test(s);
                    case 'photography': return /(photo|camera|video|edit)/.test(s);
                    default: return true;
                }
            });

        return matchesFilter && matchesCategory;
    });

    const requestSwap = async (responderId, offered, needed) => {
        try {
            await api.post('/swaps', { responderId, skillOffered: offered, skillNeeded: needed });
            alert('Swap request sent successfully! 🎉');
        } catch (e) {
            console.error(e);
            alert('Error sending request. Please try again.');
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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Browse Skills 🔍
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Discover talented individuals and find your perfect skill swap match
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Skills or Users
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., JavaScript, Design, Photography..." 
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select 
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="coding">💻 Coding & Tech</option>
                                    <option value="design">🎨 Design & Creative</option>
                                    <option value="music">🎵 Music & Audio</option>
                                    <option value="cooking">🍳 Cooking & Food</option>
                                    <option value="writing">✍️ Writing & Content</option>
                                    <option value="photography">📸 Photography & Video</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} 
                            {filter && ` matching "${filter}"`}
                            {category !== 'all' && ` in ${category}`}
                        </p>
                    </div>

                    {/* User Grid */}
                    {filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map(user => (
                                <div key={user._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                                    {/* User Header */}
                                    <div className="flex items-center space-x-4 mb-4">
                                        {user.profilePic ? (
                                            <img 
                                                src={user.profilePic} 
                                                alt={user.name} 
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {user.name}
                                            </h3>
                                            {user.rating > 0 && (
                                                <div className="flex items-center">
                                                    <span className="text-yellow-500">⭐</span>
                                                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {user.rating.toFixed(1)} ({user.reviews?.length || 0} reviews)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {user.bio && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                            {user.bio}
                                        </p>
                                    )}

                                    {/* Skills Offered */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                            🎯 Offers
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {user.skillsOffered?.slice(0, 4).map(skill => (
                                                <span key={skill} className={`px-2 py-1 text-xs rounded-full font-medium ${colorFor(skill)}`}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {user.skillsOffered?.length > 4 && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                    +{user.skillsOffered.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills Needed */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                            🎯 Needs
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {user.skillsNeeded?.slice(0, 4).map(skill => (
                                                <span key={skill} className={`px-2 py-1 text-xs rounded-full font-medium border-2 ${colorFor(skill).replace('bg-', 'border-').replace('text-', 'text-')} bg-opacity-20`}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {user.skillsNeeded?.length > 4 && (
                                                <span className="px-2 py-1 text-xs rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                                    +{user.skillsNeeded.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        {user.skillsOffered?.length > 0 && user.skillsNeeded?.length > 0 && (
                                            <div className="space-y-2">
                                                {user.skillsOffered.slice(0, 2).map(offered => 
                                                    user.skillsNeeded.slice(0, 2).map(needed => (
                                                        <button 
                                                            key={`${offered}-${needed}`}
                                                            onClick={() => requestSwap(user._id, offered, needed)}
                                                            className="w-full text-left px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 hover:shadow-md"
                                                        >
                                                            <span className="block font-medium">Request Swap</span>
                                                            <span className="block text-xs opacity-90">
                                                                {offered} ↔ {needed}
                                                            </span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={() => window.location.href = `/chat/${user._id}`}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                                        >
                                            💬 Send Message
                                        </button>
                                        
                                        <button 
                                            onClick={() => window.location.href = `/schedule?user=${user._id}`}
                                            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                                        >
                                            📅 Schedule Session
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No users found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Try adjusting your search criteria or browse all users
                            </p>
                            <button 
                                onClick={() => { setFilter(''); setCategory('all'); }}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browse;