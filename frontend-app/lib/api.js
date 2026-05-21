/**
 * API Service for communicating with FastAPI backend
 * Place this file in: lib/api.js or services/api.js
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // CRITICAL: Include cookies in requests
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Authentication API calls
 */
export const authAPI = {
  /**
   * Passwordless Login - Send OTP to email
   * @param {string} email - User email
   * @returns {Promise} API response
   */
  async login(email) {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify OTP code
   * @param {string} otpCode - 6-digit OTP code
   * @returns {Promise} API response
   */
  async verifyOTP(otpCode) {
    return fetchAPI(`/auth/otp/verify?otp_code=${otpCode}`, {
      method: 'POST',
    });
  },

  /**
   * Resend OTP code
   * @returns {Promise} API response
   */
  async resendOTP() {
    return fetchAPI('/auth/otp/resend', {
      method: 'GET',
    });
  },

  /**
   * Refresh access token
   * @returns {Promise} API response
   */
  async refreshToken() {
    return fetchAPI('/auth/token/refresh', {
      method: 'GET',
    });
  },
};

/**
 * User API calls
 */
export const userAPI = {
  /**
   * Get current user information
   * @returns {Promise} User data
   */
  async getMe() {
    return fetchAPI('/user/me', {
      method: 'GET',
    });
  },

  /**
   * Update user information
   * @param {Object} userData - User data to update
   * @returns {Promise} API response
   */
  async updateMe(userData) {
    return fetchAPI('/user/me/update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user account
   * @returns {Promise} API response
   */
  async deleteMe() {
    return fetchAPI('/user/me', {
      method: 'DELETE',
    });
  },
};