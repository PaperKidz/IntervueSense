const API_CONFIG = {
  // ✅ Single entry point through Nginx
  BASE_URL: 'http://localhost',
  
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    // Authentication (Node.js via Nginx)
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/user/profile',
      REFRESH_TOKEN: '/api/auth/refresh',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    
    // Interview Analysis (Flask via Nginx)
    INTERVIEW: {
      ANALYZE_EMOTION: '/api/analyze-emotion',
      ANALYZE_FACE: '/api/analyze_face',
      ANALYZE_VOICE: '/api/analyze-voice-comprehensive',
      ANALYZE_AUDIO: '/api/analyze_audio',
      TRANSCRIBE_AUDIO: '/api/transcribe-audio',
      TRANSCRIBE: '/api/transcribe',
      EVALUATE_ANSWER: '/api/evaluate-answer',
      FEEDBACK: '/api/feedback',
    },

    // Progress (Node.js via Nginx)
    PROGRESS: {
      MY: '/api/progress/my',
      COMPLETE: '/api/progress/complete',
      MODULE: (id) => `/api/progress/module/${id}`,
    },
  },
};

export default API_CONFIG;