import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../api/api';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    published: 0
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsAPI.getHistory();
      const postsData = response.data;
      setPosts(postsData);

      // Calculate stats from new structure
      const total = postsData.length;
      const pending = postsData.filter(p => !p.summary.summary_approved).length;
      const published = postsData.reduce((acc, p) =>
        acc + p.platforms.filter(platform => platform.published).length, 0
      );

      setStats({
        total,
        pending,
        published
      });
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your AI-generated content</p>
          </div>
          <Link to="/create-post">
            <Button size="lg">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Post
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <div className="text-gray-600">Total Posts</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
            <div className="text-gray-600">Pending Approval</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.published}</div>
            <div className="text-gray-600">Published</div>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card title="Recent Posts">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500 mb-4">No posts yet</p>
              <Link to="/create-post">
                <Button>Create your first post</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map(post => (
                <div key={post.summary.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{post.summary.topic}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.summary.summary_approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.summary.summary_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.summary.description || 'No description provided'}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <span className="text-xs text-gray-500">
                        Platforms: {post.platforms.length}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        Published: {post.platforms.filter(p => p.published).length}
                      </span>
                    </div>
                    <Link
                      to={`/create-post?summary_id=${post.summary.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
