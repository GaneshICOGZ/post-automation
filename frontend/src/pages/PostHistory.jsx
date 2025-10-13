import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../api/api';
import Card from '../components/Card';
import Button from '../components/Button';

const PostHistory = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, published

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsAPI.getHistory();
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !post.summary.summary_approved;
    if (filter === 'published') {
      return post.platforms.some(p => p.published);
    }
    return true;
  });

  const getStatusColor = (post) => {
    if (post.platforms.some(p => p.published)) {
      return 'bg-green-100 text-green-800';
    }
    if (post.summary.summary_approved) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (post) => {
    if (post.platforms.some(p => p.published)) {
      return 'Published';
    }
    if (post.summary.summary_approved) {
      return 'Approved';
    }
    return 'Pending';
  };

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'instagram', name: 'Instagram', icon: '📷' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading post history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post History</h1>
            <p className="text-gray-600 mt-1">View and manage all your content</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {['all', 'pending', 'published'].map((filterType) => (
              <Button
                key={filterType}
                onClick={() => setFilter(filterType)}
                variant={filter === filterType ? 'primary' : 'secondary'}
                size="sm"
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No posts found for the selected filter.</p>
            <Link to="/create-post">
              <Button>Create your first post</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <Card key={post.summary.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{post.summary.topic}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post)}`}>
                        {getStatusText(post)}
                      </span>
                    </div>

                    {post.summary.description && (
                      <p className="text-gray-600 mb-3">{post.summary.description}</p>
                    )}

                    {post.summary.summary_text && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">AI Summary:</h4>
                        <p className="text-blue-800 text-sm">{post.summary.summary_text}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Status */}
                {post.platforms.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Platform Status:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {post.platforms.map((platform, index) => {
                        const platformInfo = platforms.find(p => p.id === platform.platform_name);
                        return (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <span className="text-lg">{platformInfo?.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{platformInfo?.name}</div>
                              <div className={`text-xs ${platform.published ? 'text-green-600' : 'text-gray-500'}`}>
                                {platform.published ? 'Published' : platform.approved ? 'Approved' : 'Pending'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <span>Created: {new Date(post.summary.created_at).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <Link
                      to={`/create-post?summary_id=${post.summary.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit Post →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostHistory;
