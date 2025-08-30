import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The platform to exchange skills, not money. Learn something new while teaching what you know.
            </p>
            <div className="space-x-4">
              <Link 
                to="/signup" 
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started Free
              </Link>
              <Link 
                to="/browse" 
                className="inline-block px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Browse Skills
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full opacity-10 animate-bounce delay-75"></div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How it Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Simple steps to start swapping skills</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds', icon: '👤' },
              { step: '2', title: 'Add Skills', desc: 'List what you can teach and want to learn', icon: '⭐' },
              { step: '3', title: 'Find Matches', desc: 'Discover users with complementary skills', icon: '🔍' },
              { step: '4', title: 'Start Swapping', desc: 'Connect and exchange knowledge', icon: '🤝' }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </div>
                <div className="w-8 h-8 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose SkillSwap?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'No Money Required', desc: 'Pure skill exchange - no payments, no fees', icon: '💸' },
              { title: 'Real-time Chat', desc: 'Connect instantly with built-in messaging', icon: '💬' },
              { title: 'Rating System', desc: 'Build trust with reviews and ratings', icon: '⭐' }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of users already exchanging skills</p>
          <Link 
            to="/signup" 
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Join SkillSwap Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
