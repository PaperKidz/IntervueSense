// src/services/auth.service.js

import apiService from './api.service';
import API_CONFIG from '../config/api.config';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * User login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data and token
   */
  async login(email, password) {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      // Store token and user data if login successful
      if (response.success && response.token) {
        this.setAuthData(response.token, response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * User signup
   * @param {string} name - User full name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data and token
   */
  async signup(name, email, password) {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.SIGNUP,
        { name, email, password }
      );

      // Store token and user data if signup successful
      if (response.success && response.token) {
        this.setAuthData(response.token, response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * User logout
   */
  async logout() {
    try {
      // Call logout endpoint if you have one
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local data regardless of API call result
      this.clearAuthData();
    }
  }

  /**
   * Forgot password
   * @param {string} email - User email
   */
  async forgotPassword(email) {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, newPassword }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN
      );

      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Store authentication data
   */
  setAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get authentication token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

// Create and export a single instance
const authService = new AuthService();
export default authService;