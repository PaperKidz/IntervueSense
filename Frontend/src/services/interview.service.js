import apiService from './api.service';
import API_CONFIG from '../config/api.config';

class InterviewService {
  async analyzeFace(imageData) {
    return await apiService.post(
      API_CONFIG.ENDPOINTS.INTERVIEW.ANALYZE_FACE,
      { image: imageData }
    );
  }

  async analyzeAudio(audioData) {
    return await apiService.post(
      API_CONFIG.ENDPOINTS.INTERVIEW.ANALYZE_AUDIO,
      { audio: audioData }
    );
  }

  async transcribe(audioData) {
    return await apiService.post(
      API_CONFIG.ENDPOINTS.INTERVIEW.TRANSCRIBE,
      { audio: audioData }
    );
  }

  async getFeedback(performanceData) {
    return await apiService.post(
      API_CONFIG.ENDPOINTS.INTERVIEW.FEEDBACK,
      performanceData
    );
  }
}

const interviewService = new InterviewService();
export default interviewService;