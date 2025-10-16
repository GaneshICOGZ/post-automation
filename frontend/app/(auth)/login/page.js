import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContextNext';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { authApi } from '../../src/api/api';

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        // Use direct API call for login
        const res = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        response = await res.json();

        if (res.ok && response.access_token) {
          login({ email: formData.email }, response.access_token);
          router.push('/dashboard');
        } else {
          throw new Error(response.detail || 'Login failed');
        }
      } else {
        // Use direct API call for signup
        const res = await fetch('http://localhost:8000/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            preferences: []
          }),
        });

        response = await res.json();

        if (res.ok) {
          router.push('/'); // Go to login after successful signup
        } else {
          throw new Error(response.detail || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400/15 bgorb delay-1000"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400/15 bgorb"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/8 bgorb delay-500"></div>

      {/* Header */}
      <div className="fixed top-6 left-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">PA</span>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white font-headline">
          Post Automation
        </span>
      </div>

      {/* Back Button */}
      <Button
        onClick={() => router.push('/')}
        variant="ghost"
        className="fixed top-6 right-6"
      >
        ← Back to Home
      </Button>

      {/* Main Form */}
      <div className="w-full max-w-md z-10">
        <Card glassmorphism>
          {/* Tabs */}
          <div className="flex w-full mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-center rounded-lg transition-all duration-300 ${
                isLogin
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-center rounded-lg transition-all duration-300 ${
                !isLogin
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 font-headline text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-base sm:text-lg text-center text-gray-600 dark:text-gray-300 mb-8 font-body">
            {isLogin
              ? 'Sign in to continue your automation journey'
              : 'Join us and automate your social media presence'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full btn-primary"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-3 text-sm text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Guest Access */}
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="w-full"
          >
            Continue as Guest
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
