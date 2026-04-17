/**
 * API Service for communicating with FastAPI backend
 * Place this file in: lib/api.js or services/api.js
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

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

  // preserve original body so we can retry requests after refresh
  const originalBody = config.body;

  // low-level refresh helper (avoid using fetchAPI to prevent recursion)
  async function tryRefresh() {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
        method: 'GET',
        credentials: 'include',
      });
      return { ok: refreshRes.ok, status: refreshRes.status };
    } catch (err) {
      return { ok: false, status: 0 };
    }
  }

  try {
    let response = await fetch(url, config);

    // If backend signals that access token is missing/needs refresh via 205
    if (response.status === 205) {
      const refreshed = await tryRefresh();
      if (refreshed.ok) {
        // retry the original request once (cookies should now be set)
        const retryConfig = { ...config, body: originalBody };
        response = await fetch(url, retryConfig);
      } else {
        // Refresh failed -> redirect user to the main dashboard page
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
          throw new Error('Session expired, redirecting to dashboard');
        }
        throw new Error('Session expired');
      }
    }

    // Parse response body safely (may be empty)
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { raw: text };
    }

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
   * @param {string} password - User password
   * @returns {Promise} API response
   */
  async login(email, password) {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Signup - Create a new user and send OTP
   * @param {Object} payload - Signup data
   * @param {string} payload.email
   * @param {string} payload.password
   * @param {string} [payload.first_name]
   * @param {string} [payload.last_name]
   * @param {string} [payload.role] - 'buyer' or 'seller'
   * @param {string} [payload.phone_number]
   * @returns {Promise} API response
   */
   async signup(payload) {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
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

/**
 * Apartments API
 */
export const apartmentsAPI = {
  async list() {
    return fetchAPI('/apartments', { method: 'GET' });
  },

  async create(payload) {
    return fetchAPI('/apartments', { method: 'POST', body: JSON.stringify(payload) });
  },
};