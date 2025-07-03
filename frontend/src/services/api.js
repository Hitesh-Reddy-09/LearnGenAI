import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5051/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Check for new token in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', {
            refreshToken: refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/me', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/auth/stats');
    return response.data;
  }
};

// Course API methods (for future use)
export const courseAPI = {
  // Get all courses
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get single course
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  // Complete course
  completeCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/complete`);
    return response.data;
  }
};

// AI Generation API methods (for future use)
export const aiAPI = {
  // Generate course content
  generateCourse: async (prompt, options = {}) => {
    const response = await api.post('/ai/generate-course', { prompt, ...options });
    return response.data;
  },

  // Generate quiz questions
  generateQuiz: async (courseId, lessonId, options = {}) => {
    const response = await api.post('/ai/generate-quiz', { courseId, lessonId, ...options });
    return response.data;
  },

  // Generate lesson content
  generateLesson: async (courseId, topic, options = {}) => {
    const response = await api.post('/ai/generate-lesson', { courseId, topic, ...options });
    return response.data;
  }
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;
      return {
        message: data.error?.message || data.message || 'An error occurred',
        status,
        details: data.error?.details || data.details
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Set auth data
  setAuthData: (token, refreshToken, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const youtubeAPI = {
  search: async (query, maxResults = 1, educationalOnly = true) => {
    const response = await api.post('/youtube/search', { query, maxResults, educationalOnly });
    return response.data;
  }
};

export default api; 