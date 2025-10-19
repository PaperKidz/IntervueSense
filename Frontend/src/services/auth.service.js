// src/services/auth.service.js
import API_CONFIG from "../config/api.config";

const authService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      }

      // Handle error response
      throw {
        statusCode: response.status,
        message: data.message || 'Login failed',
        data: data,
      };
    } catch (error) {
      // Handle network errors
      if (error.name === 'TimeoutError') {
        throw {
          statusCode: 408,
          message: 'Request timeout. Please try again.',
        };
      }
      
      if (error.statusCode) {
        throw error;
      }

      throw {
        statusCode: 0,
        message: 'Network error. Please check your internet connection.',
        error: error,
      };
    }
  },

  /**
   * Signup new user
   */
  async signup(name, email, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      }

      // Handle error response
      throw {
        statusCode: response.status,
        message: data.message || 'Signup failed',
        data: data,
      };
    } catch (error) {
      // Handle network errors
      if (error.name === 'TimeoutError') {
        throw {
          statusCode: 408,
          message: 'Request timeout. Please try again.',
        };
      }
      
      if (error.statusCode) {
        throw error;
      }

      throw {
        statusCode: 0,
        message: 'Network error. Please check your internet connection.',
        error: error,
      };
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get stored user
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Get user profile
   */
  async getUserProfile() {
    const token = this.getToken();
    if (!token) {
      throw {
        statusCode: 401,
        message: 'No authentication token found',
      };
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || 'Failed to fetch profile',
      };
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw {
          statusCode: 408,
          message: 'Request timeout. Please try again.',
        };
      }
      
      if (error.statusCode) {
        throw error;
      }

      throw {
        statusCode: 0,
        message: 'Network error. Please check your internet connection.',
      };
    }
  }
};

export default authService;