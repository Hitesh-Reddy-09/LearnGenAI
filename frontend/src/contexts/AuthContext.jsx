import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token by getting current user
          const response = await authAPI.getMe();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear storage
            apiUtils.clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        apiUtils.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        
        // Store auth data
        apiUtils.setAuthData(token, refreshToken, user);
        setUser(user);
        
        return { success: true, user };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        
        // Store auth data
        apiUtils.setAuthData(token, refreshToken, user);
        setUser(user);
        
        return { success: true, user };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Call logout endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      apiUtils.clearAuthData();
      setUser(null);
      setError(null);
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      
      if (response.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Password change failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Password reset request failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      
      if (response.success) {
        const { user, token: newToken, refreshToken } = response.data;
        
        // Store new auth data
        apiUtils.setAuthData(newToken, refreshToken, user);
        setUser(user);
        
        return { success: true, user };
      } else {
        setError(response.message || 'Password reset failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      
      if (response.success) {
        // Update user's email verification status
        if (user) {
          setUser(prev => ({ ...prev, isEmailVerified: true }));
        }
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Email verification failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  const resendVerification = async () => {
    try {
      const response = await authAPI.resendVerification();
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Verification email resend failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  const getUserStats = async () => {
    try {
      const response = await authAPI.getUserStats();
      
      if (response.success) {
        return { success: true, stats: response.data.stats };
      } else {
        setError(response.message || 'Failed to get user stats');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    getUserStats,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};