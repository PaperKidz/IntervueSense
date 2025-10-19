// src/services/api.service.js

import API_CONFIG from '../config/api.config';

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * API Client Service
 * Handles all HTTP requests with proper error handling and timeout
 */
class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Get authorization token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Get default headers
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Create a fetch request with timeout
   */
  fetchWithTimeout(url, options = {}) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), this.timeout)
      ),
    ]);
  }

  /**
   * Main request handler
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers),
    };

    try {
      const response = await this.fetchWithTimeout(url, config);

      // Check if response is ok (status in range 200-299)
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }

        throw new APIError(
          errorData.message || errorData.error || 'Request failed',
          response.status,
          errorData
        );
      }

      // Parse successful response
      const data = await response.json();
      return data;

    } catch (error) {
      // Handle different error types
      if (error instanceof APIError) {
        throw error;
      }

      if (error.message === 'Request timeout') {
        throw new APIError('Request timeout. Please check your connection.', 408);
      }

      if (error.message === 'Failed to fetch') {
        throw new APIError('Network error. Please check your internet connection.', 0);
      }

      // Generic error
      throw new APIError(error.message || 'An unexpected error occurred', 500);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async uploadFile(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...options.headers };
    
    // Add auth token if exists
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, browser will set it with boundary
    const config = {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    };

    try {
      const response = await this.fetchWithTimeout(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }

        throw new APIError(
          errorData.message || errorData.error || 'Upload failed',
          response.status,
          errorData
        );
      }

      return await response.json();

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(error.message || 'Upload failed', 500);
    }
  }
}

// Create and export a single instance
const apiService = new APIService();
export default apiService;