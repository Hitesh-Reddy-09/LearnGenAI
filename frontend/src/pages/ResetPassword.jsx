import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('form'); // 'form', 'success', 'error'

  // Check if token is valid on component mount
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrors({ token: 'Invalid reset link' });
    }
  }, [token]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await resetPassword(token, formData.password);
      
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setStatus('error');
      setErrors({ submit: 'An error occurred while resetting your password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">
              Password Reset Successful
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button
              onClick={handleBackToLogin}
              className="w-full"
            >
              Sign In
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === 'error' && errors.token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">
              Invalid Reset Link
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The password reset link is invalid or has expired. Please request a new password reset.
            </p>
            <Button
              onClick={handleBackToLogin}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                New Password
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
                  placeholder="Enter new password"
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
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg dark:bg-white/10 bg-gray-50 border ${
                    errors.confirmPassword 
                      ? 'border-red-500' 
                      : 'dark:border-white/20 border-gray-300'
                  } dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 transition-colors`}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                <p className="text-sm text-red-500">{errors.submit}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm dark:text-gray-400 text-gray-600">
              Remember your password?{' '}
              <button
                onClick={handleBackToLogin}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 