const mongoose = require('mongoose');

// Review schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Review comment cannot exceed 500 characters']
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Course schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    minlength: [5, 'Course title must be at least 5 characters long'],
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    minlength: [20, 'Course description must be at least 20 characters long'],
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  prompt: {
    type: String,
    required: [true, 'AI generation prompt is required'],
    trim: true,
    maxlength: [1000, 'Prompt cannot exceed 1000 characters']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Course difficulty is required']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [5, 'Course must be at least 5 minutes long']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    default: null
  },
  
  // Content structure
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  finalQuiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  
  // Enrollment and completion tracking
  enrolledUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number, // percentage (0-100)
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  }],
  completedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Ratings and reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  reviews: [reviewSchema],
  
  // Course metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // AI generation metadata
  aiGenerated: {
    type: Boolean,
    default: false
  },
  generationPrompt: String,
  generationSettings: {
    model: {
      type: String,
      default: 'gemini-pro'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    },
    maxTokens: {
      type: Number,
      default: 2048
    }
  },
  
  // Course statistics
  totalViews: {
    type: Number,
    default: 0
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  averageCompletionTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isPublic: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ totalViews: -1 });
courseSchema.index({ createdAt: -1 });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledUsers.length;
});

// Virtual for completion count
courseSchema.virtual('completionCount').get(function() {
  return this.completedUsers.length;
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function() {
  if (this.enrolledUsers.length === 0) return 0;
  return Math.round((this.completedUsers.length / this.enrolledUsers.length) * 100);
});

// Virtual for lesson count
courseSchema.virtual('lessonCount').get(function() {
  return this.lessons.length;
});

// Virtual for duration in hours
courseSchema.virtual('durationHours').get(function() {
  return Math.round((this.estimatedDuration / 60) * 100) / 100;
});

// Pre-save middleware to update rating statistics
courseSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.updateRatingStats();
  }
  next();
});

// Instance method to update rating statistics
courseSchema.methods.updateRatingStats = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    this.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = Math.round((totalRating / this.reviews.length) * 100) / 100;
  this.rating.count = this.reviews.length;
  
  // Update rating distribution
  this.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  this.reviews.forEach(review => {
    this.rating.distribution[review.rating]++;
  });
};

// Instance method to enroll user
courseSchema.methods.enrollUser = function(userId) {
  const existingEnrollment = this.enrolledUsers.find(
    enrollment => enrollment.user.toString() === userId.toString()
  );
  
  if (!existingEnrollment) {
    this.enrolledUsers.push({
      user: userId,
      enrolledAt: new Date(),
      progress: 0,
      completedLessons: [],
      lastAccessed: new Date()
    });
  }
  
  return this.save();
};

// Instance method to update user progress
courseSchema.methods.updateUserProgress = function(userId, lessonId, progress) {
  const enrollment = this.enrolledUsers.find(
    enrollment => enrollment.user.toString() === userId.toString()
  );
  
  if (enrollment) {
    enrollment.progress = progress;
    enrollment.lastAccessed = new Date();
    
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }
  }
  
  return this.save();
};

// Instance method to complete course for user
courseSchema.methods.completeForUser = function(userId) {
  if (!this.completedUsers.includes(userId)) {
    this.completedUsers.push(userId);
    this.totalCompletions += 1;
  }
  
  return this.save();
};

// Instance method to add review
courseSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user has already reviewed
  const existingReview = this.reviews.find(
    review => review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.createdAt = new Date();
  } else {
    this.reviews.push({
      user: userId,
      rating,
      comment,
      helpful: [],
      createdAt: new Date()
    });
  }
  
  this.updateRatingStats();
  return this.save();
};

// Static method to find by category
courseSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: 'published', 
    isPublic: true 
  }).populate('createdBy', 'name');
};

// Static method to find by difficulty
courseSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ 
    difficulty, 
    status: 'published', 
    isPublic: true 
  }).populate('createdBy', 'name');
};

// Static method to find popular courses
courseSchema.statics.findPopular = function(limit = 10) {
  return this.find({ 
    status: 'published', 
    isPublic: true 
  })
  .sort({ totalViews: -1, 'rating.average': -1 })
  .limit(limit)
  .populate('createdBy', 'name');
};

// Static method to find trending courses
courseSchema.statics.findTrending = function(limit = 10) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({ 
    status: 'published', 
    isPublic: true,
    createdAt: { $gte: thirtyDaysAgo }
  })
  .sort({ totalViews: -1, 'rating.average': -1 })
  .limit(limit)
  .populate('createdBy', 'name');
};

// Static method to search courses
courseSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published',
    isPublic: true
  };
  
  if (options.category) searchQuery.category = options.category;
  if (options.difficulty) searchQuery.difficulty = options.difficulty;
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } })
    .populate('createdBy', 'name');
};

module.exports = mongoose.model('Course', courseSchema); 