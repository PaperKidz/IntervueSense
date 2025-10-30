import axios from 'axios';
import authService from './auth.service';

// ✅ Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('Request Data:', config.data);
    console.log('Auth Token:', token ? 'Present' : 'Missing');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Handle auth errors CAREFULLY
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // ✅ Only redirect to login if:
    // 1. We get a 401 error
    // 2. We're NOT already on login/signup page
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/signup';
      
      if (!isAuthPage) {
        console.error('Authentication failed - redirecting to login');
        authService.logout();
        window.location.href = '/login';
      } else {
        console.log('Already on auth page, not redirecting');
      }
    }
    
    return Promise.reject(error);
  }
);

const progressService = {
  getUserProgress: async () => {
    try {
      const response = await api.get('/progress/my');
      return response.data;
    } catch (error) {
      console.error('getUserProgress error:', error);
      throw error;
    }
  },

  completeTheory: async (moduleId, sectionId, data = {}) => {
    try {
      const response = await api.post('/progress/complete', {
        moduleId: String(moduleId),
        sectionId: String(sectionId),
        type: 'theory',
        data
      });
      return response.data;
    } catch (error) {
      console.error('completeTheory error:', error);
      throw error;
    }
  },

  completePractice: async (moduleId, sectionId, practiceId, sessionData = {}) => {
    try {
      console.log('completePractice called with:', { moduleId, sectionId, practiceId, sessionData });
      
      const response = await api.post('/progress/complete', {
        moduleId: String(moduleId),
        sectionId: String(sectionId),
        type: 'practice',
        data: {
          practiceId: String(practiceId),
          ...sessionData
        }
      });
      
      console.log('completePractice response:', response.data);
      return response.data;
    } catch (error) {
      console.error('completePractice error:', error);
      throw error;
    }
  },

  getModuleProgress: async (moduleId) => {
    try {
      const response = await api.get(`/progress/module/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('getModuleProgress error:', error);
      throw error;
    }
  }
};

export default progressService;