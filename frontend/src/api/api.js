import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Posts API - Updated for new backend structure
export const postsAPI = {
  // Generate summary (doesn't save to DB)
  generateSummary: (summaryData) => api.post('/posts/generate-summary', summaryData),

  // Approve and save summary to DB
  approveSummary: (summaryData) => api.post('/posts/approve-summary', summaryData),

  // Generate platform content (doesn't save to DB)
  generateContent: (summaryId, platforms) => api.post('/posts/generate-content', {
    summary_id: summaryId,
    platforms: platforms
  }),

  // Approve and save platform content to DB
  approveContent: (platformData) => api.post('/posts/approve-content', platformData),

  // Publish single platform
  publishPost: (platformId) => api.post(`/posts/publish?platform_id=${platformId}`),

  // Publish multiple platforms
  publishMultiple: (platformIds) => api.post('/posts/publish-multiple', {
    platform_ids: platformIds
  }),

  // Get user posts history
  getHistory: () => api.get('/posts/history'),

  // Get specific post with platforms
  getPostWithPlatforms: (summaryId) => api.get(`/posts/summary/${summaryId}`),
};

// Trends API
export const trendsAPI = {
  getSuggestions: () => api.get('/trends/suggestions'),
};

export default api;
