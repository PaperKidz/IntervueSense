import axios from 'axios';

// ✅ Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // This will go through Vite proxy or Nginx
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor (optional - for debugging)
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('Request Data:', config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor (optional - for error handling)
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const progressService = {
  // Get user's progress
  getUserProgress: async () => {
    try {
      const response = await api.get('/progress/my');
      return response.data;
    } catch (error) {
      console.error('getUserProgress error:', error);
      throw error;
    }
  },

  // Complete a theory section
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

  // ✅ FIXED: Complete a practice section with practiceId parameter
  completePractice: async (moduleId, sectionId, practiceId, sessionData = {}) => {
    try {
      console.log('completePractice called with:', { moduleId, sectionId, practiceId, sessionData });
      
      const response = await api.post('/progress/complete', {
        moduleId: String(moduleId),
        sectionId: String(sectionId),
        type: 'practice',
        data: {
          practiceId: String(practiceId), // ✅ Include practiceId in data
          ...sessionData // ✅ Spread session data (scores, duration, etc.)
        }
      });
      
      console.log('completePractice response:', response.data);
      return response.data;
    } catch (error) {
      console.error('completePractice error:', error);
      throw error;
    }
  },

  // Get progress for a specific module
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