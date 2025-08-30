import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Schedule = () => {
    const [searchParams] = useSearchParams();
    const preselectedUserId = searchParams.get('user');
    
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'

    // Form state
    const [formData, setFormData] = useState({
        participantId: preselectedUserId || '',
        title: '',
        date: '',
        time: '',
        mode: 'online',
        location: '',
        meetingLink: '',
        notes: '',
        skillOffered: '',
        skillNeeded: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Auto-open form if user is preselected from Browse page
        if (preselectedUserId && users.length > 0) {
            setShowForm(true);
        }
    }, [preselectedUserId, users]);

    const fetchData = async () => {
        try {
            const [sessionsRes, usersRes, userRes] = await Promise.all([
                api.get('/sessions'),
                api.get('/users'),
                api.get('/users/me')
            ]);
            console.log('Sessions fetched:', sessionsRes.data);
            console.log('Users fetched:', usersRes.data);
            console.log('Current user:', userRes.data);
            setSessions(sessionsRes.data);
            setUsers(usersRes.data);
            setCurrentUser(userRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
        setLoading(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Submitting form data:', formData);
            if (editingSession) {
                const response = await api.put(`/sessions/${editingSession._id}`, formData);
                console.log('Session updated:', response.data);
                alert('Session updated successfully! 🎉');
            } else {
                const response = await api.post('/sessions', formData);
                console.log('Session created:', response.data);
                alert('Session scheduled successfully! 🎉');
            }
            
            setShowForm(false);
            setEditingSession(null);
            resetForm();
            fetchData();
        } catch (err) {
            console.error('Error saving session:', err);
            console.error('Error details:', err.response?.data);
            alert('Error saving session. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            participantId: preselectedUserId || '',
            title: '',
            date: '',
            time: '',
            mode: 'online',
            location: '',
            meetingLink: '',
            notes: '',
            skillOffered: '',
            skillNeeded: ''
        });
    };

    const handleEdit = (session) => {
        setEditingSession(session);
        setFormData({
            participantId: session.participantId._id,
            title: session.title,
            date: moment(session.date).format('YYYY-MM-DD'),
            time: session.time,
            mode: session.mode,
            location: session.location || '',
            meetingLink: session.meetingLink || '',
            notes: session.notes || '',
            skillOffered: session.skillOffered,
            skillNeeded: session.skillNeeded
        });
        setShowForm(true);
    };

    const handleCancel = async (sessionId) => {
        if (window.confirm('Are you sure you want to cancel this session?')) {
            try {
                await api.delete(`/sessions/${sessionId}`);
                alert('Session cancelled successfully!');
                fetchData();
            } catch (err) {
                console.error('Error cancelling session:', err);
                alert('Error cancelling session. Please try again.');
            }
        }
    };

    const handleStatusUpdate = async (sessionId, status) => {
        try {
            await api.put(`/sessions/${sessionId}`, { status });
            alert(`Session ${status} successfully!`);
            fetchData();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error updating session status. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const calendarEvents = sessions.map(session => ({
        id: session._id,
        title: session.title,
        start: moment(`${session.date} ${session.time}`).toDate(),
        end: moment(`${session.date} ${session.time}`).add(1, 'hour').toDate(),
        resource: session
    }));
    
    console.log('Sessions:', sessions);
    console.log('Calendar events:', calendarEvents);

    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

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
                            Schedule Sessions 📅
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Schedule and manage your skill swap sessions
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <button
                            onClick={() => {
                                setShowForm(true);
                                setEditingSession(null);
                                resetForm();
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            📅 Schedule New Session
                        </button>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('calendar')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'calendar'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                Calendar View
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'list'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                List View
                            </button>
                        </div>
                    </div>

                    {/* Calendar View */}
                    {view === 'calendar' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
                            <div style={{ height: 600 }}>
                                <Calendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    onSelectEvent={(event) => {
                                        const session = event.resource;
                                        if (session.creatorId._id === currentUser._id && session.status !== 'completed' && session.status !== 'cancelled') {
                                            handleEdit(session);
                                        }
                                    }}
                                    eventPropGetter={(event) => {
                                        const session = event.resource;
                                        let backgroundColor = '#3174ad';
                                        
                                        switch (session.status) {
                                            case 'pending': backgroundColor = '#f59e0b'; break;
                                            case 'confirmed': backgroundColor = '#10b981'; break;
                                            case 'completed': backgroundColor = '#6366f1'; break;
                                            case 'cancelled': backgroundColor = '#ef4444'; break;
                                        }
                                        
                                        return {
                                            style: {
                                                backgroundColor,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px'
                                            }
                                        };
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* List View */}
                    {view === 'list' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Sessions</h2>
                            
                            {sessions.length > 0 ? (
                                <div className="space-y-4">
                                    {sessions.map(session => {
                                        const isCreator = session.creatorId._id === currentUser._id;
                                        const otherUser = isCreator ? session.participantId : session.creatorId;
                                        
                                        return (
                                            <div key={session._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {session.title}
                                                            </h3>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                                {session.status}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <div>
                                                                <p><span className="font-medium">With:</span> {otherUser.name}</p>
                                                                <p><span className="font-medium">Date:</span> {moment(session.date).format('MMM DD, YYYY')}</p>
                                                                <p><span className="font-medium">Time:</span> {session.time}</p>
                                                            </div>
                                                            <div>
                                                                <p><span className="font-medium">Mode:</span> {session.mode}</p>
                                                                {session.mode === 'online' && session.meetingLink && (
                                                                    <p><span className="font-medium">Link:</span> 
                                                                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                                                                            Join Meeting
                                                                        </a>
                                                                    </p>
                                                                )}
                                                                {session.mode === 'offline' && session.location && (
                                                                    <p><span className="font-medium">Location:</span> {session.location}</p>
                                                                )}
                                                                <p><span className="font-medium">Skills:</span> {session.skillOffered} ↔ {session.skillNeeded}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {session.notes && (
                                                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Notes:</span> {session.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-2 mt-4 lg:mt-0 lg:ml-6">
                                                        {session.status === 'pending' && !isCreator && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(session._id, 'confirmed')}
                                                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancel(session._id)}
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        {session.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(session._id, 'completed')}
                                                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                                            >
                                                                Mark Complete
                                                            </button>
                                                        )}
                                                        
                                                        {isCreator && (session.status === 'pending' || session.status === 'confirmed') && (
                                                            <button
                                                                onClick={() => handleEdit(session)}
                                                                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        
                                                        {(session.status === 'pending' || session.status === 'confirmed') && (
                                                            <button
                                                                onClick={() => handleCancel(session._id)}
                                                                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📅</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        No sessions scheduled
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Schedule your first skill swap session to get started
                                    </p>
                                    <button
                                        onClick={() => {
                                            setShowForm(true);
                                            setEditingSession(null);
                                            resetForm();
                                        }}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Schedule Session
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Session Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {editingSession ? 'Edit Session' : 'Schedule New Session'}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingSession(null);
                                                resetForm();
                                            }}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleFormSubmit} className="space-y-6">
                                        {/* Participant Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Schedule with
                                            </label>
                                            <select
                                                value={formData.participantId}
                                                onChange={(e) => setFormData({...formData, participantId: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select a user</option>
                                                {users.filter(user => user._id !== currentUser._id).map(user => (
                                                    <option key={user._id} value={user._id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Session Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Session Title
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., JavaScript Basics Session"
                                                required
                                            />
                                        </div>

                                        {/* Skills */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Skill You'll Teach
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.skillOffered}
                                                    onChange={(e) => setFormData({...formData, skillOffered: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="e.g., JavaScript"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Skill You'll Learn
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.skillNeeded}
                                                    onChange={(e) => setFormData({...formData, skillNeeded: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="e.g., Guitar"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Date and Time */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    min={moment().format('YYYY-MM-DD')}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Time
                                                </label>
                                                <select
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select time</option>
                                                    {timeSlots.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Mode Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Meeting Mode
                                            </label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="online"
                                                        checked={formData.mode === 'online'}
                                                        onChange={(e) => setFormData({...formData, mode: e.target.value})}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-gray-900 dark:text-white">Online</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="offline"
                                                        checked={formData.mode === 'offline'}
                                                        onChange={(e) => setFormData({...formData, mode: e.target.value})}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-gray-900 dark:text-white">In Person</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Location or Meeting Link */}
                                        {formData.mode === 'online' ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Meeting Link
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.meetingLink}
                                                    onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="e.g., Coffee shop on Main St"
                                                    required
                                                />
                                            </div>
                                        )}

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows="3"
                                                placeholder="Any additional information for the session..."
                                            />
                                        </div>

                                        {/* Submit Buttons */}
                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                                            >
                                                {editingSession ? 'Update Session' : 'Schedule Session'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setEditingSession(null);
                                                    resetForm();
                                                }}
                                                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
