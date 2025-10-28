import axios from 'axios';

// ✅ Create axios instance with relative baseURL for Nginx proxy
const api = axios.create({
  baseURL: '/api', // Relative URL - works with Nginx
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// ✅ Request interceptor - Add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging (can remove in production)
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message || error.response.data
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('⚠️ Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No Response from server:', error.request);
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;