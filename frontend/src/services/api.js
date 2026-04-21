import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  me: () => api.get('/auth/me')
};

export const threatsAPI = {
  getAll: (page = 1, limit = 10, filters = {}) =>
    api.get('/threats', { params: { page, limit, ...filters } }),
  getById: (id) => api.get(`/threats/${id}`),
  scan: (url) => api.post('/threats/scan', { url }),
  create: (data) => api.post('/threats', data)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export default api;