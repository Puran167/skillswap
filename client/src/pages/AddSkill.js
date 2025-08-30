import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const AddSkill = () => {
    const [skillsOffered, setSkillsOffered] = useState('');
    const [skillsNeeded, setSkillsNeeded] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const skillCategories = [
        { name: 'Coding & Tech', skills: ['JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML', 'Java', 'C++', 'Database Design', 'Web Development'] },
        { name: 'Design & Creative', skills: ['Graphic Design', 'UI/UX Design', 'Photoshop', 'Figma', 'Illustrator', 'Logo Design', 'Branding', 'Typography'] },
        { name: 'Music & Audio', skills: ['Guitar', 'Piano', 'Singing', 'Music Production', 'Audio Editing', 'Drums', 'Violin', 'Music Theory'] },
        { name: 'Cooking & Food', skills: ['Baking', 'Italian Cooking', 'Pastry Making', 'Vegetarian Cooking', 'BBQ', 'Food Photography', 'Recipe Development'] },
        { name: 'Writing & Content', skills: ['Copywriting', 'Blog Writing', 'Creative Writing', 'Technical Writing', 'Content Strategy', 'Editing', 'Social Media'] },
        { name: 'Photography & Video', skills: ['Portrait Photography', 'Video Editing', 'Wedding Photography', 'Photo Editing', 'Videography', 'Animation'] },
        { name: 'Business & Marketing', skills: ['Digital Marketing', 'SEO', 'Social Media Marketing', 'Business Strategy', 'Public Speaking', 'Sales'] },
        { name: 'Languages', skills: ['Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'English', 'Italian', 'Portuguese'] }
    ];

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await api.get('/users/me');
                setCurrentUser(res.data);
                setSkillsOffered(res.data.skillsOffered?.join(', ') || '');
                setSkillsNeeded(res.data.skillsNeeded?.join(', ') || '');
            } catch (err) {
                console.error('Error fetching skills:', err);
            }
            setLoading(false);
        };
        fetchSkills();
    }, []);

    const addSkillToField = (skill, field) => {
        if (field === 'offered') {
            const current = skillsOffered.split(',').map(s => s.trim()).filter(s => s);
            if (!current.includes(skill)) {
                setSkillsOffered([...current, skill].join(', '));
            }
        } else {
            const current = skillsNeeded.split(',').map(s => s.trim()).filter(s => s);
            if (!current.includes(skill)) {
                setSkillsNeeded([...current, skill].join(', '));
            }
        }
    };

    const removeSkill = (skillToRemove, field) => {
        if (field === 'offered') {
            const updated = skillsOffered.split(',').map(s => s.trim()).filter(s => s !== skillToRemove);
            setSkillsOffered(updated.join(', '));
        } else {
            const updated = skillsNeeded.split(',').map(s => s.trim()).filter(s => s !== skillToRemove);
            setSkillsNeeded(updated.join(', '));
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            const offeredArray = skillsOffered.split(',').map(s => s.trim()).filter(s => s);
            const neededArray = skillsNeeded.split(',').map(s => s.trim()).filter(s => s);
            await api.put('/users/me', { skillsOffered: offeredArray, skillsNeeded: neededArray });
            alert('Skills updated successfully! 🎉');
        } catch (err) {
            console.error('Error updating skills:', err);
            alert('Error updating skills. Please try again.');
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
                            Manage Your Skills ⭐
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Add skills you can teach and skills you want to learn
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Skills I Offer */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <span className="text-2xl mr-2">🎯</span>
                                Skills I Can Teach
                            </h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Add skills (comma separated)
                                </label>
                                <textarea
                                    value={skillsOffered}
                                    onChange={e => setSkillsOffered(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    rows="3"
                                    placeholder="e.g., JavaScript, Guitar, Cooking, Photography..."
                                />
                            </div>

                            {/* Current Skills */}
                            {skillsOffered && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Skills:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsOffered.split(',').map(skill => skill.trim()).filter(skill => skill).map(skill => (
                                            <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill, 'offered')}
                                                    className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Add Categories */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Add:</h3>
                                {skillCategories.map(category => (
                                    <div key={category.name}>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{category.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {category.skills.map(skill => (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => addSkillToField(skill, 'offered')}
                                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                                >
                                                    + {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills I Need */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <span className="text-2xl mr-2">🎓</span>
                                Skills I Want to Learn
                            </h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Add skills (comma separated)
                                </label>
                                <textarea
                                    value={skillsNeeded}
                                    onChange={e => setSkillsNeeded(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    rows="3"
                                    placeholder="e.g., React, Piano, Spanish, Video Editing..."
                                />
                            </div>

                            {/* Current Skills */}
                            {skillsNeeded && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills to Learn:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsNeeded.split(',').map(skill => skill.trim()).filter(skill => skill).map(skill => (
                                            <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill, 'needed')}
                                                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Add Categories */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Add:</h3>
                                {skillCategories.map(category => (
                                    <div key={category.name}>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{category.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {category.skills.map(skill => (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => addSkillToField(skill, 'needed')}
                                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                                >
                                                    + {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {saving ? 'Saving...' : 'Save Skills'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSkill;
