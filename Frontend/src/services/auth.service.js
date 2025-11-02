// src/services/auth.service.js
import API_CONFIG from "../config/api.config";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const authService = {
  

  async login(email, password) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || "Login failed",
        data,
      };
    } catch (error) {
      if (error.name === "TimeoutError") {
        throw { statusCode: 408, message: "Request timeout. Please try again." };
      }

      if (error.statusCode) throw error;

      throw {
        statusCode: 0,
        message: "Network error. Please check your connection.",
        error,
      };
    }
  },

  /**
   * Signup user
   */
  async signup(name, email, password) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNUP}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || "Signup failed",
        data,
      };
    } catch (error) {
      if (error.name === "TimeoutError") {
        throw { statusCode: 408, message: "Request timeout. Please try again." };
      }

      if (error.statusCode) throw error;

      throw {
        statusCode: 0,
        message: "Network error. Please check your connection.",
        error,
      };
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  getCurrentUser() {
  return this.getUser();
},
  /**
   * Decode JWT (to check expiry)
   */
  decodeToken(token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  },

  /**
   * Check if token is still valid (not expired)
   */
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    return Date.now() < decoded.exp * 1000;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.isTokenValid();
  },

  /**
   * Get user profile
   */
  async getUserProfile() {
    const token = this.getToken();
    if (!token) {
      throw { statusCode: 401, message: "No authentication token found" };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/auth/user/profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) return data;

      throw {
        statusCode: response.status,
        message: data.message || "Failed to fetch profile",
      };
    } catch (error) {
      if (error.name === "TimeoutError") {
        throw { statusCode: 408, message: "Request timeout. Please try again." };
      }

      if (error.statusCode) throw error;

      throw {
        statusCode: 0,
        message: "Network error. Please check your internet connection.",
      };
    }
  },
};

export default authService;
