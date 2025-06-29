const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  getUserStats
} = require('../controllers/authController');

const {
  verifyToken,
  requireRole
} = require('../middleware/auth');

const {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  emailVerificationSchema,
  refreshTokenSchema,
  logoutSchema
} = require('../validations/authValidation');

const router = express.Router();

// Rate limiting configurations
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts',
    message: 'Too many login attempts, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    error: 'Too many registration attempts',
    message: 'Too many registration attempts, please try again later.',
    retryAfter: 3600 // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // 2 attempts per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: 3600 // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerLimiter, validate(registerSchema), register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, validate(loginSchema), login);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

// @route   POST /api/auth/verify-email
// @desc    Verify email
// @access  Public
router.post('/verify-email', validate(emailVerificationSchema), verifyEmail);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected routes
// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', verifyToken, validate(logoutSchema), logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, getMe);

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', verifyToken, validate(updateProfileSchema), updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', verifyToken, validate(changePasswordSchema), changePassword);

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post('/resend-verification', verifyToken, resendVerification);

// @route   GET /api/auth/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', verifyToken, getUserStats);

// Admin routes
// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', verifyToken, requireRole(['admin']), (req, res) => {
  // This would be implemented in a separate user controller
  res.status(200).json({
    success: true,
    message: 'Get all users - Admin only'
  });
});

// @route   PUT /api/auth/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/users/:id/role', verifyToken, requireRole(['admin']), (req, res) => {
  // This would be implemented in a separate user controller
  res.status(200).json({
    success: true,
    message: 'Update user role - Admin only'
  });
});

// @route   PUT /api/auth/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private/Admin
router.put('/users/:id/status', verifyToken, requireRole(['admin']), (req, res) => {
  // This would be implemented in a separate user controller
  res.status(200).json({
    success: true,
    message: 'Update user status - Admin only'
  });
});

module.exports = router; 