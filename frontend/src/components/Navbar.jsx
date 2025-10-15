import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">ContentCraft</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>

            <Link
              to="/create-post"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Create Post
            </Link>

            <Link
              to="/history"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              History
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md px-3 py-2">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.name || 'User'}
                </span>
                <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email || 'user@example.com'}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
