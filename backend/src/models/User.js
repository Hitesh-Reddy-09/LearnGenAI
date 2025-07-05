const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../utils/constants');

// User preferences schema
const preferencesSchema = new mongoose.Schema({
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  topics: [{
    type: String,
    trim: true
  }],
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    reminders: {
      type: Boolean,
      default: true
    }
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, { _id: false });

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'teacher', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Learning progress
  coursesEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  coursesCompleted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  // Continue learning tracking
  continueLearning: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    lastLessonIndex: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  totalLearningTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // Engagement tracking
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  
  // Preferences
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastActiveDate: -1 });
userSchema.index({ 'preferences.difficulty': 1 });
userSchema.index({ coursesEnrolled: 1 });
userSchema.index({ coursesCompleted: 1 });

// Virtual for completion rate
userSchema.virtual('completionRate').get(function() {
  if (this.coursesEnrolled.length === 0) return 0;
  return Math.round((this.coursesCompleted.length / this.coursesEnrolled.length) * 100);
});

// Virtual for learning time in hours
userSchema.virtual('totalLearningHours').get(function() {
  return Math.round((this.totalLearningTime / 60) * 100) / 100;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update lastActiveDate
userSchema.pre('save', function(next) {
  if (this.isModified('lastActiveDate')) {
    this.lastActiveDate = new Date();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    name: this.name
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Instance method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.lastActiveDate);
  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Consecutive day
    this.streak += 1;
  } else if (diffDays > 1) {
    // Streak broken
    this.streak = 1;
  }
  
  this.lastActiveDate = today;
  return this.save();
};

// Instance method to enroll in course
userSchema.methods.enrollInCourse = function(courseId) {
  if (!this.coursesEnrolled.includes(courseId)) {
    this.coursesEnrolled.push(courseId);
  }
  return this.save();
};

// Instance method to complete course
userSchema.methods.completeCourse = function(courseId) {
  if (!this.coursesCompleted.includes(courseId)) {
    this.coursesCompleted.push(courseId);
  }
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get learning statistics
userSchema.statics.getLearningStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalLearningTime: { $sum: '$totalLearningTime' },
        avgStreak: { $avg: '$streak' },
        totalCompletedCourses: { $sum: { $size: '$coursesCompleted' } }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema); 