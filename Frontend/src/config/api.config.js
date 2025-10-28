const API_CONFIG = {
  // Backend URLs - direct connection since Nginx isn't configured yet
  NODE_API_URL: import.meta.env.VITE_NODE_API_URL || 'http://localhost:4000',
  FLASK_API_URL: import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000',
  
  // Use direct connection instead of Nginx proxy for now
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  
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

    // Inside API_CONFIG object, add PROGRESS section:
    PROGRESS: {
      GET_ALL: '/api/progress',
      COMPLETE_PRACTICE: '/api/progress/practice/complete',
      COMPLETE_THEORY: '/api/progress/theory/complete',
      UPDATE_STATUS: '/api/progress/status',
    },
  },
  
  // Helper method to get the correct base URL for different services
  getServiceUrl(service = 'node') {
    if (service === 'flask') {
      return this.FLASK_API_URL;
    }
    return this.NODE_API_URL;
  }
};

export default API_CONFIG;