const API_CONFIG = {
  // Using Nginx reverse proxy - all requests through port 80
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost',
  
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    // Authentication (Node.js backend - port 4000)
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/user/profile',
      REFRESH_TOKEN: '/api/auth/refresh',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    
    // Interview Analysis (Flask backend - port 5000)
    INTERVIEW: {
      // Emotion detection
      ANALYZE_EMOTION: '/api/analyze-emotion',
      ANALYZE_FACE: '/api/analyze_face',
      
      // Voice/Audio analysis
      ANALYZE_VOICE: '/api/analyze-voice-comprehensive',
      ANALYZE_AUDIO: '/api/analyze_audio',
      
      // Transcription
      TRANSCRIBE_AUDIO: '/api/transcribe-audio',
      TRANSCRIBE: '/api/transcribe',
      
      // Evaluation/Feedback
      EVALUATE_ANSWER: '/api/evaluate-answer',
      FEEDBACK: '/api/feedback',
    },
  }
};

export default API_CONFIG;