const API_CONFIG = {
  // Using Nginx reverse proxy
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost',
  
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      REFRESH_TOKEN: '/api/auth/refresh',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    INTERVIEW: {
      ANALYZE_FACE: '/api/analyze_face',
      ANALYZE_AUDIO: '/api/analyze_audio',
      TRANSCRIBE: '/api/transcribe',
      FEEDBACK: '/api/feedback',
    },
  }
};

export default API_CONFIG;