// Frontend/src/services/user.service.js
import API_CONFIG from "../config/api.config";
import authService from "./auth.service";

const userService = {
  /**
   * Update user profile (name)
   */
  async updateProfile(name) {
    const token = authService.getToken();
    if (!token) {
      throw { statusCode: 401, message: "No authentication token found" };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local storage with new user data
        const currentUser = authService.getCurrentUser();
        const updatedUser = { 
          ...currentUser, 
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          createdAt: data.user.createdAt,
          id: data.user.id
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || "Failed to update profile",
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
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    const token = authService.getToken();
    if (!token) {
      throw { statusCode: 401, message: "No authentication token found" };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || "Failed to change password",
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
   * Delete user account
   */
  async deleteAccount(password) {
    const token = authService.getToken();
    if (!token) {
      throw { statusCode: 401, message: "No authentication token found" };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.DELETE_ACCOUNT}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear local storage
        authService.logout();
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || "Failed to delete account",
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
   * Upload avatar
   */
  async uploadAvatar(file) {
    const token = authService.getToken();
    if (!token) {
      throw { statusCode: 401, message: "No authentication token found" };
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.UPLOAD_AVATAR}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local storage with complete user data
        const currentUser = authService.getCurrentUser();
        const updatedUser = { 
          ...currentUser, 
          avatar: data.avatarUrl,
          name: data.user.name,
          email: data.user.email,
          createdAt: data.user.createdAt,
          id: data.user.id
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || "Failed to upload avatar",
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
   * Delete avatar
   */
  async deleteAvatar() {
    const token = authService.getToken();
    if (!token) {
      throw { statusCode: 401, message: "No authentication token found" };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.DELETE_AVATAR}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local storage to remove avatar
        const currentUser = authService.getCurrentUser();
        const updatedUser = { ...currentUser, avatar: null };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return data;
      }

      throw {
        statusCode: response.status,
        message: data.message || "Failed to delete avatar",
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
};

export default userService;