import React, { useState, useEffect } from 'react';
import { getUserPostsHistory } from '../api/api';
import Card from '../components/Card';
import Button from '../components/Button';

const PostHistory = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);

  useEffect(() => {
    fetchPostHistory();
  }, []);

  const fetchPostHistory = async () => {
    try {
      setLoading(true);
      const response = await getUserPostsHistory();
      setPosts(response || []);
    } catch (err) {
      console.error('Error fetching post history:', err);
      setError('Unable to load post history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platformName) => {
    const icons = {
      facebook: '📘',
      twitter: '🐦',
      linkedin: '💼',
      instagram: '📷'
    };
    return icons[platformName?.toLowerCase()] || '📱';
  };

  const getStatusColor = (approved, published) => {
    if (published) return 'bg-green-100 text-green-800';
    if (approved) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (approved, published) => {
    if (published) return 'Published';
    if (approved) return 'Approved';
    return 'Draft';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your content history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📚 Content History
            </h1>
            <p className="text-gray-600 text-lg">
              Track all your published and drafted content across platforms
            </p>
          </div>
          <Button
            onClick={fetchPostHistory}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-center text-red-700">
              <svg className="h-5 w-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{posts.length}</div>
              <div className="text-sm text-blue-700 font-medium">Total Posts</div>
            </div>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {posts.reduce((acc, post) => acc + post.platforms.filter(p => p.published).length, 0)}
              </div>
              <div className="text-sm text-green-700 font-medium">Published</div>
            </div>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {posts.reduce((acc, post) => acc + post.platforms.filter(p => p.approved && !p.published).length, 0)}
              </div>
              <div className="text-sm text-orange-700 font-medium">Approved</div>
            </div>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {posts.reduce((acc, post) => acc + post.platforms.length, 0)}
              </div>
              <div className="text-sm text-purple-700 font-medium">Total Platforms</div>
            </div>
          </Card>
        </div>
      )}

      {/* Post List */}
      {posts.length === 0 && !loading ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-600 mb-6">
              Start creating amazing content for your social media platforms. Your published posts will appear here.
            </p>
            <Button href="/create-post" className="bg-blue-600 hover:bg-blue-700">
              🎨 Create Your First Post
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <Card key={post.summary.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Post Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{post.summary.topic}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {post.platforms.length} platform{post.platforms.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.summary.summary_text}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {formatDate(post.summary.created_at)}</span>
                      {post.summary.updated_at && post.summary.updated_at !== post.summary.created_at && (
                        <span>📝 Updated {formatDate(post.summary.updated_at)}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setExpandedPost(expandedPost === post.summary.id ? null : post.summary.id)}
                    variant="secondary"
                    size="sm"
                  >
                    {expandedPost === post.summary.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>
              </div>

              {/* Platform Cards */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {post.platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`p-4 rounded-lg border ${getStatusColor(platform.approved, platform.published)} border-current`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getPlatformIcon(platform.platform_name)}</span>
                          <span className="font-medium capitalize">{platform.platform_name}</span>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                          {getStatusText(platform.approved, platform.published)}
                        </span>
                      </div>

                      {platform.published && platform.published_at && (
                        <p className="text-xs text-gray-600">
                          📤 {formatDate(platform.published_at)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Expanded Details */}
                {expandedPost === post.summary.id && (
                  <div className="border-t border-gray-200 pt-6 mt-4">
                    <h4 className="text-lg font-semibold mb-4">Platform Details</h4>
                    <div className="space-y-6">
                      {post.platforms.map((platform) => (
                        <div key={platform.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <span className="text-2xl mr-2">{getPlatformIcon(platform.platform_name)}</span>
                            <h5 className="text-lg font-medium capitalize">{platform.platform_name}</h5>
                            <span className={`ml-auto px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(platform.approved, platform.published)}`}>
                              {getStatusText(platform.approved, platform.published)}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {platform.image_url && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                <img
                                  src={platform.image_url}
                                  alt={`${platform.platform_name} content`}
                                  className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-300"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                              <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                                {platform.post_text || 'No content available'}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Created: {formatDate(platform.created_at)}</span>
                              {platform.updated_at && platform.updated_at !== platform.created_at && (
                                <span>Updated: {formatDate(platform.updated_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostHistory;
