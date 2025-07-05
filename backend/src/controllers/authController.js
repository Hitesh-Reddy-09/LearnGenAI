const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN, MESSAGES, STATUS_CODES } = require('../utils/constants');
const logger = require('../utils/logger');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const mongoose = require('mongoose');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
    data: {
      user,
      token,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, preferences } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError(MESSAGES.ERROR.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    preferences
  });

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  logger.info(`New user registered: ${email}`);

  sendTokenResponse(user, STATUS_CODES.CREATED, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', STATUS_CODES.BAD_REQUEST));
  }

  // Check if user exists && password is correct
  const user = await User.findByEmail(email).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError(MESSAGES.ERROR.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', STATUS_CODES.UNAUTHORIZED));
  }

  // Update last login and streak
  user.lastLogin = new Date();
  await user.updateStreak();

  logger.info(`User logged in: ${email}`);

  sendTokenResponse(user, STATUS_CODES.OK, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  // In a more advanced implementation, you might want to blacklist the token
  // For now, we'll just send a success response
  // The client should remove the token from storage

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: MESSAGES.SUCCESS.LOGOUT_SUCCESS
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, avatar, preferences } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  await user.save();

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: MESSAGES.SUCCESS.USER_UPDATED,
    data: {
      user
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', STATUS_CODES.BAD_REQUEST));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return next(new AppError('There is no user with that email', STATUS_CODES.NOT_FOUND));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiry (10 minutes)
  const passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetToken = passwordResetToken;
  user.passwordResetExpires = passwordResetExpires;
  await user.save();

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    logger.info(`Password reset email sent to: ${email}`);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.error('Error sending password reset email:', err);

    return next(new AppError('Email could not be sent', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const resetToken = req.params.token;

  // Get hashed token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', STATUS_CODES.BAD_REQUEST));
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset for user: ${user.email}`);

  sendTokenResponse(user, STATUS_CODES.OK, res);
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token', STATUS_CODES.BAD_REQUEST));
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logger.info(`Email verified for user: ${user.email}`);

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', STATUS_CODES.BAD_REQUEST));
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set token expiry (24 hours)
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpires = emailVerificationExpires;
  await user.save();

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email`;

  const message = `Please verify your email by making a POST request to: \n\n ${verificationUrl} with token: ${verificationToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email verification',
      message
    });

    logger.info(`Verification email resent to: ${user.email}`);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.error('Error sending verification email:', err);

    return next(new AppError('Email could not be sent', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', STATUS_CODES.BAD_REQUEST));
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return next(new AppError('Invalid refresh token', STATUS_CODES.UNAUTHORIZED));
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError('Invalid refresh token', STATUS_CODES.UNAUTHORIZED));
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', STATUS_CODES.UNAUTHORIZED));
  }
});

// @desc    Get user statistics
// @route   GET /api/auth/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const stats = {
    totalLearningTime: user.totalLearningTime,
    totalLearningHours: user.totalLearningHours,
    streak: user.streak,
    coursesEnrolled: user.coursesEnrolled.length,
    coursesCompleted: user.coursesCompleted.length,
    completionRate: user.completionRate,
    totalSessions: user.totalSessions,
    lastActiveDate: user.lastActiveDate
  };

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      stats
    }
  });
});

// @desc    Update course progress/completion
// @route   POST /api/auth/progress
// @access  Private
const updateCourseProgress = asyncHandler(async (req, res, next) => {
  const { courseId, progress, completedLessonIds, completed, currentLessonIndex } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  // Ensure courseId is an ObjectId
  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  // Add to coursesEnrolled if not already
  if (!user.coursesEnrolled.map(id => id.toString()).includes(courseObjectId.toString())) {
    user.coursesEnrolled.push(courseObjectId);
    console.log('[updateCourseProgress] Added course to coursesEnrolled:', { userId: user._id, courseId, coursesEnrolled: user.coursesEnrolled });
  } else {
    console.log('[updateCourseProgress] Course already in coursesEnrolled:', { userId: user._id, courseId, coursesEnrolled: user.coursesEnrolled });
  }
  
  // Add to coursesCompleted if completed
  if (completed && !user.coursesCompleted.map(id => id.toString()).includes(courseObjectId.toString())) {
    user.coursesCompleted.push(courseObjectId);
    console.log('[updateCourseProgress] Added course to coursesCompleted:', { userId: user._id, courseId, coursesCompleted: user.coursesCompleted });
  }

  // Update continue learning tracking
  let continueLearningEntry = user.continueLearning.find(entry => 
    entry.course.toString() === courseObjectId.toString()
  );
  
  if (!continueLearningEntry) {
    continueLearningEntry = {
      course: courseObjectId,
      lastLessonIndex: currentLessonIndex || 0,
      lastAccessed: new Date(),
      progress: progress || 0
    };
    user.continueLearning.push(continueLearningEntry);
  } else {
    continueLearningEntry.lastLessonIndex = currentLessonIndex || continueLearningEntry.lastLessonIndex;
    continueLearningEntry.lastAccessed = new Date();
    continueLearningEntry.progress = progress || continueLearningEntry.progress;
  }

  await user.save();
  console.log('[updateCourseProgress] User saved:', { userId: user._id, coursesEnrolled: user.coursesEnrolled });

  // Update Course.enrolledUsers progress
  const Course = require('../models/Course');
  const course = await Course.findById(courseId);
  if (course) {
    const enrolled = course.enrolledUsers.find(e => e.user.toString() === user._id.toString());
    if (enrolled) {
      if (typeof progress === 'number') enrolled.progress = progress;
      if (Array.isArray(completedLessonIds)) enrolled.completedLessons = completedLessonIds;
      enrolled.lastAccessed = new Date();
    } else {
      course.enrolledUsers.push({
        user: user._id,
        progress: progress || 0,
        completedLessons: completedLessonIds || [],
        lastAccessed: new Date()
      });
    }
    // Add to completedUsers if completed
    if (completed && !course.completedUsers.includes(user._id)) {
      course.completedUsers.push(user._id);
    }
    await course.save();
  }

  res.status(200).json({ success: true });
});

// @desc    Get user course history
// @route   GET /api/auth/history
// @access  Private
const getCourseHistory = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'coursesEnrolled',
      select: 'title thumbnail estimatedDuration category',
    })
    .populate({
      path: 'coursesCompleted',
      select: 'title thumbnail estimatedDuration category',
    });
  if (!user) return next(new AppError('User not found', 404));

  // Get progress for each enrolled course, skip if course is missing
  const Course = require('../models/Course');
  const enrolledProgress = await Promise.all(
    user.coursesEnrolled.map(async course => {
      try {
        const c = await Course.findById(course._id);
        if (!c) return null; // skip missing courses
        const enrolled = c.enrolledUsers.find(e => e.user.toString() === user._id.toString());
        return {
          ...course.toObject(),
          progress: enrolled ? enrolled.progress : 0,
          completedLessons: enrolled ? enrolled.completedLessons : [],
          lastAccessed: enrolled ? enrolled.lastAccessed : null
        };
      } catch (err) {
        return null; // skip on error
      }
    })
  );

  res.status(200).json({
    success: true,
    data: {
      enrolled: enrolledProgress.filter(Boolean),
      completed: user.coursesCompleted
    }
  });
});

// @desc    Get continue learning data
// @route   GET /api/auth/continue-learning
// @access  Private
const getContinueLearning = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'continueLearning.course',
      select: 'title thumbnail estimatedDuration category lessons',
    });
  
  if (!user) return next(new AppError('User not found', 404));

  // Sort by last accessed date (most recent first)
  const continueLearningData = user.continueLearning
    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    .map(entry => ({
      course: entry.course,
      lastLessonIndex: entry.lastLessonIndex,
      lastAccessed: entry.lastAccessed,
      progress: entry.progress,
      totalLessons: entry.course.lessons ? entry.course.lessons.length : 0
    }))
    .filter(entry => entry.course); // Filter out any null courses

  res.status(200).json({
    success: true,
    data: continueLearningData
  });
});

module.exports = {
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
}; 