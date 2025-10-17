'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';
import Button from '../../../src/components/Button';
import Card from '../../../src/components/Card';
import Input from '../../../src/components/Input';

const LoginPage = () => {
  const router = useRouter();
  const { login, register } = useAuth();
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
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.error);
        }
      } else {
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          // Auto-login after registration
          router.push('/dashboard');
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 flex items-center justify-center dark:opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-secondary/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Header */}
      <div className="fixed top-6 left-6 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/')}>
        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 100 2h2a1 1 0 100-2H5z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-pt-sans">
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
        <Card glass padding="xl" className="relative overflow-hidden">
          {/* Sliding tab indicator */}
          <div className="relative mb-8">
            <div className="flex w-full bg-secondary/50 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 px-4 text-center font-semibold rounded-md transition-all duration-300 ${
                  isLogin
                    ? 'bg-primary text-primary-foreground shadow-md transform scale-[0.98]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 px-4 text-center font-semibold rounded-md transition-all duration-300 ${
                  !isLogin
                    ? 'bg-primary text-primary-foreground shadow-md transform scale-[0.98]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <h1 className={`text-3xl md:text-4xl font-bold text-center mb-2 font-playfair`}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-base md:text-lg text-center text-muted-foreground mb-8">
            {isLogin
              ? 'Sign in to continue your automation journey'
              : 'Join us and automate your social media presence'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                type="text"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required={!isLogin}
              />
            )}

            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {error && (
              <div className="text-error text-sm text-center bg-error/10 border border-error/20 p-3 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-3 text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Guest Access */}
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            size="lg"
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
