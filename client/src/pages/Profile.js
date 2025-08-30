import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        location: '',
        availability: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/users/me');
                setUser(res.data);
                setFormData({
                    name: res.data.name || '',
                    email: res.data.email || '',
                    bio: res.data.bio || '',
                    location: res.data.location || '',
                    availability: res.data.availability || ''
                });
            } catch (err) {
                console.error('Error fetching user:', err);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/users/me', formData);
            setUser(res.data);
            setEditing(false);
            alert('Profile updated successfully! 🎉');
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Error updating profile. Please try again.');
        }
        setSaving(false);
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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            My Profile 👤
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your personal information and showcase your skills
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {user?.name || 'User'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {user?.location || 'Location not set'}
                                    </p>
                                    
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-500">{user?.rating?.toFixed(1) || '0.0'}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-500">{user?.skillsOffered?.length || 0}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Skills</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        {editing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                                {editing ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Edit Profile Information
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="e.g., New York, NY"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                rows="4"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="Tell others about yourself, your interests, and what makes you unique..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Availability
                                            </label>
                                            <select
                                                value={formData.availability}
                                                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            >
                                                <option value="">Select availability</option>
                                                <option value="Very Active">Very Active (Daily)</option>
                                                <option value="Active">Active (3-4 times/week)</option>
                                                <option value="Moderate">Moderate (1-2 times/week)</option>
                                                <option value="Occasional">Occasional (As needed)</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setEditing(false)}
                                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Profile Information
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h3>
                                                <p className="text-gray-900 dark:text-white">{user?.email}</p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Availability</h3>
                                                <p className="text-gray-900 dark:text-white">
                                                    {user?.availability || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</h3>
                                            <p className="text-gray-900 dark:text-white">
                                                {user?.bio || 'No bio added yet. Click "Edit Profile" to add one!'}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Skills I Offer</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {user?.skillsOffered?.length > 0 ? (
                                                    user.skillsOffered.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Skills I Want to Learn</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {user?.skillsNeeded?.length > 0 ? (
                                                    user.skillsNeeded.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reviews Section */}
                                        {user?.reviews && user.reviews.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Reviews</h3>
                                                <div className="space-y-4">
                                                    {user.reviews.map((review, index) => (
                                                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                            <div className="flex items-center mb-2">
                                                                <div className="flex text-yellow-400">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                                                            ⭐
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    {review.rating}/5
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300">{review.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
