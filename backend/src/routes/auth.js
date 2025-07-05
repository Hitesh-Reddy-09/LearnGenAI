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
  getUserStats,
  updateCourseProgress,
  getCourseHistory,
  getContinueLearning
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
router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.post('/verify-email', validate(emailVerificationSchema), verifyEmail);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', verifyToken, validate(logoutSchema), logout);
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, validate(updateProfileSchema), updateProfile);
router.put('/change-password', verifyToken, validate(changePasswordSchema), changePassword);
router.post('/resend-verification', verifyToken, resendVerification);
router.get('/stats', verifyToken, getUserStats);
router.post('/progress', verifyToken, updateCourseProgress);
router.get('/history', verifyToken, getCourseHistory);
router.get('/continue-learning', verifyToken, getContinueLearning);

// Admin routes (stubs)
router.get('/users', verifyToken, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, message: 'Get all users - Admin only' });
});
router.put('/users/:id/role', verifyToken, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, message: 'Update user role - Admin only' });
});
router.put('/users/:id/status', verifyToken, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, message: 'Update user status - Admin only' });
});

module.exports = router; 