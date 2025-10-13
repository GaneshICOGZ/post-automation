import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../api/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    brand_info: '',
    post_style: '',
    post_focus: ''
  });
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
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
        preferences: JSON.stringify(preferences)
      };

      const response = await authAPI.signup(userData);

      // For signup, redirect to login or auto-login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const presetPreferences = [
    'technology', 'business', 'marketing', 'social media',
    'health', 'travel', 'food', 'entertainment'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <Card className="shadow-xl">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Join the AI Content Platform and start creating amazing content
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Brand Information (Optional)"
              name="brand_info"
              placeholder="Tell us about your brand or company..."
              value={formData.brand_info}
              onChange={handleChange}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Writing Style"
                name="post_style"
                type="text"
                placeholder="e.g., professional, casual, friendly"
                value={formData.post_style}
                onChange={handleChange}
              />

              <Input
                label="Content Focus"
                name="post_focus"
                type="text"
                placeholder="e.g., tech, business, marketing"
                value={formData.post_focus}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content Preferences (select multiple)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presetPreferences.map(pref => (
                  <label key={pref} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      value={pref}
                      checked={preferences.includes(pref)}
                      onChange={handlePreferenceChange}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{pref.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              variant="success"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Sign in here
                </Link>
              </span>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
