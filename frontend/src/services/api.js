import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rewear_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('rewear_token');
      localStorage.removeItem('rewear_token');
      localStorage.removeItem('rewear_user');
      // Only redirect to login if the user was previously authenticated
      // (token expired/invalid). Guests hitting protected endpoints should not be redirected.
      if (hadToken && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth Services ─────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data, onUploadProgress) => api.put('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

// ─── Item Services ─────────────────────────────────────────────────────────
export const itemService = {
  getItems: (params) => api.get('/items', { params }),
  getItem: (id) => api.get(`/items/${id}`),
  getFeatured: () => api.get('/items/featured'),
  getMyItems: () => api.get('/items/user/my'),
  createItem: (formData, onUploadProgress) =>
    api.post('/items', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress 
    }),
  updateItem: (id, data, onUploadProgress) => api.put(`/items/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),
  deleteItem: (id) => api.delete(`/items/${id}`),
  updateStatus: (id, status) => api.patch(`/items/${id}/status`, { status }),
};

// ─── Swap Services ─────────────────────────────────────────────────────────
export const swapService = {
  createSwap: (data) => api.post('/swaps', data),
  getMySwaps: () => api.get('/swaps/my'),
  getMyPurchases: () => api.get('/swaps/my/purchases'),
  getSwap: (id) => api.get(`/swaps/${id}`),
  updateStatus: (id, status) => api.patch(`/swaps/${id}/status`, { status }),
  getAllSwaps: (params) => api.get('/swaps/admin/all', { params }),
};

// ─── Review Services ───────────────────────────────────────────────────────
export const reviewService = {
  getItemReviews: (itemId) => api.get(`/reviews/item/${itemId}`),
  createReview: (itemId, data) => api.post(`/reviews/item/${itemId}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// ─── Message Services ──────────────────────────────────────────────────────
export const messageService = {
  getMessages: (swapId) => api.get(`/messages/swap/${swapId}`),
  sendMessage: (swapId, content) => api.post(`/messages/swap/${swapId}`, { content }),
};

// ─── Notification Services ───────────────────────────────────────────────
export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markUnread: (id) => api.patch(`/notifications/${id}/unread`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ─── Public Stats Service ────────────────────────────────────────────────
export const statsService = {
  getSustainabilityStats: () => api.get('/items/stats/sustainability'),
};

// ─── Admin Services ────────────────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserActivity: (id) => api.get(`/admin/users/${id}/activity`),
  toggleBan: (id) => api.patch(`/admin/users/${id}/ban`),
  getAllSwaps: (params) => api.get('/swaps/admin/all', { params }),
  getItems: (params) => api.get('/admin/items', { params }),
  getDashboardStats: () => api.get('/admin/stats'),
  getPendingItems: () => api.get('/admin/items/pending'),
  approveItem: (id, status) => api.patch(`/admin/items/${id}/status`, { status }),
  getSustainabilityStats: () => api.get('/admin/sustainability'),
};

export default api;
