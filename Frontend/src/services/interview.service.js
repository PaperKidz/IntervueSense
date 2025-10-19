// src/services/interview.service.js
import API_CONFIG from '../config/api.config';

const interviewService = {
  /**
   * Analyze emotion from image
   */
  async analyzeEmotion(imageData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.ANALYZE_EMOTION}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Emotion analysis error:', error);
      throw error;
    }
  },

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(base64Audio) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.TRANSCRIBE_AUDIO}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  },

  /**
   * Analyze voice comprehensive
   */
  async analyzeVoice(base64Audio, transcript, duration) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.ANALYZE_VOICE}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Audio,
            transcript: transcript,
            duration: duration,
          }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Voice analysis error:', error);
      throw error;
    }
  },

  /**
   * Evaluate answer
   */
  async evaluateAnswer(question, answer) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.EVALUATE_ANSWER}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question,
            answer: answer,
          }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Answer evaluation error:', error);
      throw error;
    }
  },
};

export default interviewService;