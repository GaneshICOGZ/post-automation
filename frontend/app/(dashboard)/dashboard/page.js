'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';
import { getTrendingTopics } from '../../../src/api/api';
import Card, { CardHeader, CardContent } from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import Navbar from '../../../src/components/Navbar';

const DashboardPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);
      const response = await getTrendingTopics();
      if (response.topics && response.topics.length > 0) {
        setTrends(response.topics);
      } else {
        // Default topics if API doesn't return any
        setTrends([
          {
            topic: "Welcome to Post Automation! 🎉",
            category: "getting-started",
            trend: "featured"
          },
          {
            topic: "AI-powered multi-platform content creation",
            category: "getting-started",
            trend: "featured"
          },
          {
            topic: "Social media automation made simple",
            category: "technology",
            trend: "rising"
          }
        ]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Unable to fetch trending topics. Please try again later.');
      // Set default welcome topics on error
      setTrends([
        {
          topic: "Welcome to Post Automation! 🎉",
          category: "getting-started",
          trend: "featured"
        },
        {
          topic: "Transform your content strategy with AI",
          category: "business",
          trend: "rising"
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTrendingTopics();
  };

  const handleCreatePost = (topic = '') => {
    if (topic) {
      router.push(`/create-post?topic=${encodeURIComponent(topic)}`);
    } else {
      router.push('/create-post');
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-playfair text-foreground mb-2">
                Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Ready to create amazing content with AI?
              </p>
            </div>
            <Button size="xl" onClick={() => handleCreatePost()}>
              🚀 Create Content
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card hoverable padding="lg" className="text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-4xl mb-3">🤖</div>
            <div className="text-sm font-medium text-foreground mb-1">AI-Powered Content</div>
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-xs text-muted-foreground">Unlimited possibilities</div>
          </Card>

          <Card hoverable padding="lg" className="text-center bg-gradient-to-br from-accent/5 to-accent/10">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-sm font-medium text-foreground mb-1">Smart Suggestions</div>
            <div className="text-2xl font-bold text-accent">AI</div>
            <div className="text-xs text-muted-foreground">Always learning</div>
          </Card>

          <Card hoverable padding="lg" className="text-center bg-gradient-to-br from-success/5 to-success/10">
            <div className="text-4xl mb-3">🚀</div>
            <div className="text-sm font-medium text-foreground mb-1">Multi-Platform</div>
            <div className="text-2xl font-bold text-success">5+</div>
            <div className="text-xs text-muted-foreground">One-click publishing</div>
          </Card>
        </div>

        {/* Trending Topics Section */}
        <section className="mb-8">
          <CardHeader className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-playfair text-foreground">
                📈 Trending Topics
              </h2>
              <p className="text-muted-foreground">
                Get inspired by the latest content trends
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={refreshing || loading}
              size="sm"
            >
              {!refreshing && !loading && (
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Refresh
            </Button>
          </CardHeader>

          {error && (
            <Card className="mb-6 bg-warning/5 border-warning/20">
              <CardContent className="flex items-center text-warning">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trends.slice(0, 6).map((trend, index) => (
              <Card
                key={`${trend.topic}-${index}`}
                hoverable
                padding="lg"
                className="border-l-4 hover:border-l-primary transition-all duration-300"
                onClick={() => handleCreatePost(trend.topic)}
              >
                <div className="cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
                        {trend.topic}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                          {trend.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trend.trend === 'rising'
                            ? 'bg-error/10 text-error border border-error/20'
                            : trend.trend === 'top'
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {trend.trend}
                        </span>
                      </div>
                    </div>
                    {trend.trend === 'rising' && (
                      <div className="flex items-center text-error ml-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-sm font-medium text-primary">
                    Use this topic →
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions CTA */}
        <Card glass padding="xl" className="text-center bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <h3 className="text-2xl md:text-3xl font-bold font-playfair mb-4">
            Ready to revolutionize your content strategy?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Choose any trending topic above, or start with your own idea. Our AI will help you create
            engaging content optimized for multiple social media platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => handleCreatePost()}>
              🎨 Start Creating
            </Button>
            <Button variant="outline" size="lg">
              📚 View History
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
