import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(formData.email, formData.password);

      if (response.access_token) {
        // Store user data and token
        login(
          { email: formData.email },
          response.access_token
        );

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Login failed. Invalid credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your ContentCraft AI account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
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

            {/* Email Input */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Password Input */}
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in to Dashboard'
              )}
            </Button>

            {/* Link to Signup */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Don't have an account?{' '}
              </span>
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Create one now
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to create amazing content with AI assistance. 🎨✨
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
