const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../utils/constants');
const logger = require('../utils/logger');
const { User } = require('../models');
const { AppError } = require('./errorHandler');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new AppError('Access token required', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('User account is deactivated', 401));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired', 401));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 401));
    }
    
    return next(new AppError('Token verification failed', 500));
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Log error but don't fail the request
    logger.warn('Optional auth failed:', error);
    next();
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole(['admin']);

// Check if user is teacher or admin
const requireTeacher = requireRole(['teacher', 'admin']);

// Check if user is premium or admin
const requirePremium = requireRole(['premium', 'admin']);

// Token refresh middleware
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers['x-refresh-token'];
    
    if (!refreshToken) {
      return next(new AppError('Refresh token required', 401));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Attach new token to response
    res.setHeader('X-New-Token', newToken);
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token refresh failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Refresh token has expired', 401));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid refresh token', 401));
    }
    
    return next(new AppError('Token refresh failed', 500));
  }
};

// Check if user owns the resource or is admin
const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // User can only access their own resources
    if (req.user._id.toString() !== resourceUserId) {
      return next(new AppError('Access denied to this resource', 403));
    }

    next();
  };
};

// Check if user is enrolled in course
const requireCourseEnrollment = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const courseId = req.params.courseId || req.body.courseId;
    
    if (!courseId) {
      return next(new AppError('Course ID required', 400));
    }

    // Check if user is enrolled
    const isEnrolled = req.user.coursesEnrolled.includes(courseId);
    
    if (!isEnrolled && req.user.role !== 'admin') {
      return next(new AppError('You must be enrolled in this course', 403));
    }

    next();
  } catch (error) {
    logger.error('Course enrollment check failed:', error);
    return next(new AppError('Course enrollment verification failed', 500));
  }
};

// Check if user has completed course
const requireCourseCompletion = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const courseId = req.params.courseId || req.body.courseId;
    
    if (!courseId) {
      return next(new AppError('Course ID required', 400));
    }

    // Check if user has completed the course
    const isCompleted = req.user.coursesCompleted.includes(courseId);
    
    if (!isCompleted && req.user.role !== 'admin') {
      return next(new AppError('You must complete this course first', 403));
    }

    next();
  } catch (error) {
    logger.error('Course completion check failed:', error);
    return next(new AppError('Course completion verification failed', 500));
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many login attempts',
        message: 'Too many login attempts, please try again later.',
        retryAfter: 900 // 15 minutes in seconds
      });
    }
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: 'Too many registration attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many registration attempts',
        message: 'Too many registration attempts, please try again later.',
        retryAfter: 3600 // 1 hour in seconds
      });
    }
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // 2 attempts per hour
    message: 'Too many password reset attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many password reset attempts',
        message: 'Too many password reset attempts, please try again later.',
        retryAfter: 3600 // 1 hour in seconds
      });
    }
  }
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireTeacher,
  requirePremium,
  refreshToken,
  requireOwnership,
  requireCourseEnrollment,
  requireCourseCompletion,
  authRateLimit,
}; 