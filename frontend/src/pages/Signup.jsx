import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const preference = e.target.value;
    setPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = {
        ...formData,
        preferences: preferences
      };

      const response = await registerUser(userData);

      if (response.access_token) {
        // Registration successful, redirect to login
        navigate('/login');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const presetPreferences = [
    'technology', 'business', 'marketing', 'social media',
    'health', 'travel', 'food', 'entertainment', 'sports', 'lifestyle'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Join ContentCraft AI</h2>
            <p className="text-purple-100">Start your AI-powered content creation journey</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Choose a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {/* Content Preferences */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Content Preferences (Select all that interest you)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {presetPreferences.map(pref => (
                    <label key={pref} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        value={pref}
                        checked={preferences.includes(pref)}
                        onChange={handlePreferenceChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">{pref}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 We'll use your preferences to show you relevant trending topics and content suggestions
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Your Account...
                  </div>
                ) : (
                  '🚀 Start Creating Amazing Content'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                  Sign in to continue
                </Link>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
