import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTrendingTopics } from '../api/api';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

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
            topic: "Welcome to ContentCraft AI! 🎉",
            category: "getting-started",
            trend: "featured"
          },
          {
            topic: "Your journey to amazing content starts here",
            category: "getting-started",
            trend: "featured"
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Unable to fetch trending topics. Please try again later.');
      // Set default welcome topics on error
      setTrends([
        {
          topic: "Welcome to ContentCraft AI! 🎉",
          category: "getting-started",
          trend: "featured"
        },
        {
          topic: "Transform your content creation with AI",
          category: "getting-started",
          trend: "featured"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Ready to create amazing content with AI?
            </p>
          </div>
          <Link to="/create-post">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🚀 Create Content
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center p-6">
            <div className="p-3 bg-blue-600 rounded-full mr-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">AI-Powered Content</p>
              <p className="text-2xl font-bold text-blue-900">∞</p>
              <p className="text-xs text-blue-600">Unlimited possibilities</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center p-6">
            <div className="p-3 bg-purple-600 rounded-full mr-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Smart Suggestions</p>
              <p className="text-2xl font-bold text-purple-900">AI</p>
              <p className="text-xs text-purple-600">Always learning</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center p-6">
            <div className="p-3 bg-green-600 rounded-full mr-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Multiple Platforms</p>
              <p className="text-2xl font-bold text-green-900">5+</p>
              <p className="text-xs text-green-600">One-click publishing</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trending Topics Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📈 Trending Topics
            </h2>
            <p className="text-gray-600">
              Get inspired by the latest content trends across platforms
            </p>
          </div>
          <Button
            onClick={fetchTrendingTopics}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                Updating...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.slice(0, 6).map((trend, index) => (
            <Card
              key={`${trend.topic}-${index}`}
              className="hover:shadow-lg transition-all duration-200 border-l-4 hover:border-l-blue-500"
              style={{ borderLeftColor: trend.category === 'technology' ? '#3B82F6' : trend.category === 'business' ? '#10B981' : trend.category === 'marketing' ? '#8B5CF6' : '#F59E0B' }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                      {trend.topic}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trend.category === 'technology' ? 'bg-blue-100 text-blue-800' :
                        trend.category === 'business' ? 'bg-green-100 text-green-800' :
                        trend.category === 'marketing' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {trend.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trend.trend === 'rising' ? 'bg-red-100 text-red-800' :
                        trend.trend === 'top' ? 'bg-gray-100 text-gray-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {trend.trend}
                      </span>
                    </div>
                  </div>
                  {trend.trend === 'rising' && (
                    <div className="flex items-center text-red-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.751-13.027A.75.75 0 0010 5.25a.75.75 0 00-.751.723l.75 6.75a.75.75 0 001.5 0l.75-6.75a.75.75 0 00-.749-.723zM10 8a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 0110 8z" />
                      </svg>
                    </div>
                  )}
                </div>

                <Link
                  to="/create-post"
                  state={{ initialTopic: trend.topic }}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Use this topic →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to create amazing content?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose any trending topic above, or start with your own idea. Our AI will help you create
              engaging content optimized for multiple social media platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-post">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3"
                >
                  🎨 Start Creating
                </Button>
              </Link>
              <Link to="/history">
                <Button
                  size="lg"
                  className="bg-white hover:bg-gray-50 text-gray-950 border border-gray-300 px-8 py-3"
                >
                  📚 View History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
