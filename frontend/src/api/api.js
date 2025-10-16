import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'http://localhost:8000' // Production backend URL
    : 'http://localhost:8000', // Development backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Posts API functions
export const postsApi = {
  create: async (postData) => {
    const response = await api.post('/posts/create', postData);
    return response.data;
  },

  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  update: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  delete: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  getUserPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/user?page=${page}&limit=${limit}`);
    return response.data;
  }
};

// Trends API functions
export const trendsApi = {
  getCurrentTrends: async (platform = 'all', category = 'all') => {
    const response = await api.get(`/trends/get_trends?platform=${platform}&category=${category}`);
    return response.data;
  },

  searchTrends: async (query, platform = 'all') => {
    const response = await api.get(`/trends/search?q=${encodeURIComponent(query)}&platform=${platform}`);
    return response.data;
  },

  getTrendsByCategory: async (category, date = null) => {
    let url = `/trends/category/${category}`;
    if (date) url += `?date=${date}`;
    const response = await api.get(url);
    return response.data;
  }
};

// Individual post functions
export const generateSummary = async (topic, description) => {
  const response = await api.post('/posts/generate-summary', { topic, description });
  return response.data;
};

export const approveSummary = async (summaryId, summary) => {
  const response = await api.post('/posts/approve-summary', { summary_id: summaryId, summary_text: summary });
  return response.data;
};

export const generateContent = async (summaryId, platforms) => {
  const response = await api.post('/posts/generate-content', { summary_id: summaryId, platforms });
  return response.data;
};

export const approveContent = async (platformId, postText, imageUrl) => {
  const response = await api.post('/posts/approve-content', { platform_id: platformId, post_text: postText, image_url: imageUrl });
  return response.data;
};

export const publishPost = async (platformId) => {
  const response = await api.post(`/posts/publish`, { platform_id: platformId });
  return response.data;
};

export const getUserPostsHistory = async () => {
  const response = await api.get('/posts/history');
  return response.data;
};

export const regenerateText = async (summaryId, platformId, contentType, suggestions) => {
  const payload = {};
  if (summaryId) payload.summary_id = summaryId;
  if (platformId && contentType !== "summary") payload.platform_id = platformId; // Only for post regeneration
  payload.content_type = contentType;
  payload.suggestions = suggestions || "";

  const response = await api.post('/posts/regenerate-text', payload);
  return response.data;
};

export const regenerateImage = async (summaryId, platformId, suggestions) => {
  const payload = {};
  if (summaryId) payload.summary_id = summaryId;
  if (platformId) payload.platform_id = platformId;
  payload.suggestions = suggestions || "";

  const response = await api.post('/posts/regenerate-image', payload);
  return response.data;
};

// Individual trends functions
export const getTrendingTopics = async () => {
  const response = await api.get('/trends/suggestions');
  return response.data;
};

export default api;
