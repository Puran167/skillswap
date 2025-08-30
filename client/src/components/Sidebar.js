import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/browse', icon: '🔍', label: 'Browse Skills' },
    { path: '/add-skill', icon: '➕', label: 'Add Skills' },
    { path: '/schedule', icon: '📅', label: 'Schedule' },
    { path: '/requests', icon: '📋', label: 'Requests' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen sticky top-16">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Menu</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
