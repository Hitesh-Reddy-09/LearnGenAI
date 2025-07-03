import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { signIn, signUp, forgotPassword, changePassword, isLoading, error, clearError } = useAuth();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setErrors({});
    setShowPassword(false);
    setShowNewPassword(false);
    clearError();
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (mode === 'signin' || mode === 'signup') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (mode === 'changePassword') {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(formData.newPassword)) {
        newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let result;
    if (mode === 'signup') {
      result = await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
    } else if (mode === 'signin') {
      result = await signIn({
        email: formData.email,
        password: formData.password
      });
    } else if (mode === 'forgotPassword') {
      result = await forgotPassword(formData.email);
    } else if (mode === 'changePassword') {
      result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      });
    }

    if (result.success) {
      if (mode === 'signin' || mode === 'signup') {
        onClose();
      } else if (mode === 'forgotPassword') {
        setMode('forgotPasswordSuccess');
      } else if (mode === 'changePassword') {
        setMode('changePasswordSuccess');
      }
      resetForm();
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const renderForm = () => {
    switch (mode) {
      case 'signup':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.name 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.password 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.confirmPassword 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        );

      case 'signin':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.password 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        );

      case 'forgotPassword':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">
                Reset Password
              </h3>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        );

      case 'forgotPasswordSuccess':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white text-gray-900">
              Check Your Email
            </h3>
            <p className="text-sm dark:text-gray-400 text-gray-600">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <Button
              onClick={() => handleModeChange('signin')}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        );

      case 'changePassword':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.currentPassword 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.newPassword 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.confirmNewPassword}
                  onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.confirmNewPassword 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmNewPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmNewPassword}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        );

      case 'changePasswordSuccess':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white text-gray-900">
              Password Updated
            </h3>
            <p className="text-sm dark:text-gray-400 text-gray-600">
              Your password has been successfully updated.
            </p>
            <Button
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {(mode === 'forgotPassword' || mode === 'changePassword') && (
                  <button
                    onClick={() => handleModeChange('signin')}
                    className="p-2 rounded-lg dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 dark:text-white text-gray-900" />
                  </button>
                )}
                <h2 className="text-2xl font-bold dark:text-white text-gray-900">
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'forgotPassword' && 'Reset Password'}
                  {mode === 'changePassword' && 'Change Password'}
                  {mode === 'forgotPasswordSuccess' && 'Check Email'}
                  {mode === 'changePasswordSuccess' && 'Success'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 dark:text-white text-gray-900" />
              </button>
            </div>

            {renderForm()}

            {/* Mode switching links */}
            {mode === 'signin' && (
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => handleModeChange('signup')}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  <button
                    onClick={() => handleModeChange('forgotPassword')}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </p>
              </div>
            )}

            {mode === 'signup' && (
              <div className="mt-6 text-center">
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => handleModeChange('signin')}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}

            {mode === 'forgotPassword' && (
              <div className="mt-6 text-center">
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Remember your password?{' '}
                  <button
                    onClick={() => handleModeChange('signin')}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;