'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../src/context/AuthContext';
import Button from '../src/components/Button';
import Navbar from '../src/components/Navbar';
import Card from '../src/components/Card';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 flex items-center justify-center dark:opacity-30">
              <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-32 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-40 right-1/4 w-64 h-64 bg-secondary/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="relative z-10 text-center py-16 lg:py-24">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-playfair mb-6 animate-fade-in">
                Transform Ideas into
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Multi-Platform Content
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Generate engaging posts, stories, and articles for all your favorite platforms with AI-powered automation.
                Save time and reach more audiences effortlessly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button
                  size="xl"
                  onClick={handleGetStarted}
                  className="text-lg px-8 py-4"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-6 py-3"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
              Everything you need to conquer social media
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea generation to multi-platform publishing - streamline your content workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hoverable padding="lg" className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Generation</h3>
              <p className="text-muted-foreground">
                Generate compelling content summaries from any topic using advanced AI technology
              </p>
            </Card>

            <Card hoverable padding="lg" className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Platform Publishing</h3>
              <p className="text-muted-foreground">
                Automatically create and optimize content for Twitter, Facebook, LinkedIn, Instagram, and YouTube
              </p>
            </Card>

            <Card hoverable padding="lg" className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate and publish content across multiple platforms in minutes, not hours
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card glass padding="xl" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold font-playfair mb-4">
                Ready to revolutionize your content strategy?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of creators who have transformed their social media presence with AI-powered automation
              </p>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="text-lg px-8 py-4"
              >
                {isAuthenticated ? 'Continue to Dashboard' : 'Start Your Journey'}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
