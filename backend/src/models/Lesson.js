const mongoose = require('mongoose');

// Resource schema
const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['document', 'video', 'link', 'image', 'audio'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  size: {
    type: Number // in bytes
  },
  duration: {
    type: Number // in seconds, for videos/audio
  }
}, { _id: true });

// Lesson schema
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    minlength: [3, 'Lesson title must be at least 3 characters long'],
    maxlength: [100, 'Lesson title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Lesson description is required'],
    trim: true,
    minlength: [10, 'Lesson description must be at least 10 characters long'],
    maxlength: [1000, 'Lesson description cannot exceed 1000 characters']
  },
  objectives: [{
    type: String,
    trim: true,
    required: true
  }],
  content: {
    type: String,
    required: [true, 'Lesson content is required'],
    trim: true
  },
  videoUrl: {
    type: String,
    default: null
  },
  videoDuration: {
    type: Number, // in seconds
    default: 0
  },
  videoThumbnail: {
    type: String,
    default: null
  },
  searchKeywords: [{
    type: String,
    trim: true
  }],
  resources: [resourceSchema],
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Lesson order must be at least 1']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [1, 'Lesson must be at least 1 minute long']
  },
  
  // Course relationship
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  
  // Lesson status and visibility
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
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
  
  // Lesson statistics
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
  },
  
  // User progress tracking
  userProgress: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number, // percentage (0-100)
      default: 0,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    quizScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ title: 'text', description: 'text', searchKeywords: 'text' });
lessonSchema.index({ isPublished: 1 });
lessonSchema.index({ isFree: 1 });
lessonSchema.index({ totalViews: -1 });
lessonSchema.index({ createdAt: -1 });

// Compound index for course lessons ordering
lessonSchema.index({ courseId: 1, order: 1, isPublished: 1 });

// Virtual for duration in minutes
lessonSchema.virtual('durationMinutes').get(function() {
  return Math.round((this.estimatedDuration / 60) * 100) / 100;
});

// Virtual for video duration in minutes
lessonSchema.virtual('videoDurationMinutes').get(function() {
  return Math.round((this.videoDuration / 60) * 100) / 100;
});

// Virtual for completion rate
lessonSchema.virtual('completionRate').get(function() {
  if (this.totalViews === 0) return 0;
  return Math.round((this.totalCompletions / this.totalViews) * 100);
});

// Virtual for average time spent
lessonSchema.virtual('averageTimeSpentMinutes').get(function() {
  if (this.userProgress.length === 0) return 0;
  const totalTime = this.userProgress.reduce((sum, progress) => sum + progress.timeSpent, 0);
  return Math.round((totalTime / this.userProgress.length / 60) * 100) / 100;
});

// Pre-save middleware to validate order uniqueness within course
lessonSchema.pre('save', async function(next) {
  if (this.isModified('order') || this.isModified('courseId')) {
    const existingLesson = await this.constructor.findOne({
      courseId: this.courseId,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingLesson) {
      return next(new Error('Lesson order must be unique within a course'));
    }
  }
  next();
});

// Instance method to update user progress
lessonSchema.methods.updateUserProgress = function(userId, progress, timeSpent = 0) {
  let userProgress = this.userProgress.find(
    up => up.user.toString() === userId.toString()
  );
  
  if (!userProgress) {
    userProgress = {
      user: userId,
      progress: 0,
      timeSpent: 0,
      completedAt: null,
      lastAccessed: new Date(),
      quizScore: null
    };
    this.userProgress.push(userProgress);
  }
  
  userProgress.progress = progress;
  userProgress.timeSpent += timeSpent;
  userProgress.lastAccessed = new Date();
  
  // Mark as completed if progress is 100%
  if (progress >= 100 && !userProgress.completedAt) {
    userProgress.completedAt = new Date();
    this.totalCompletions += 1;
  }
  
  return this.save();
};

// Instance method to complete lesson for user
lessonSchema.methods.completeForUser = function(userId, quizScore = null) {
  const userProgress = this.userProgress.find(
    up => up.user.toString() === userId.toString()
  );
  
  if (userProgress) {
    userProgress.progress = 100;
    userProgress.completedAt = new Date();
    userProgress.quizScore = quizScore;
    
    if (!userProgress.completedAt) {
      this.totalCompletions += 1;
    }
  }
  
  return this.save();
};

// Instance method to add resource
lessonSchema.methods.addResource = function(resource) {
  this.resources.push(resource);
  return this.save();
};

// Instance method to remove resource
lessonSchema.methods.removeResource = function(resourceId) {
  this.resources = this.resources.filter(
    resource => resource._id.toString() !== resourceId.toString()
  );
  return this.save();
};

// Instance method to increment view count
lessonSchema.methods.incrementView = function() {
  this.totalViews += 1;
  return this.save();
};

// Static method to find lessons by course
lessonSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { courseId, isPublished: true };
  
  if (options.includeFree !== undefined) {
    query.isFree = options.includeFree;
  }
  
  return this.find(query)
    .sort({ order: 1 })
    .populate('quiz', 'title description');
};

// Static method to find next lesson
lessonSchema.statics.findNextLesson = function(courseId, currentOrder) {
  return this.findOne({
    courseId,
    order: { $gt: currentOrder },
    isPublished: true
  }).sort({ order: 1 });
};

// Static method to find previous lesson
lessonSchema.statics.findPreviousLesson = function(courseId, currentOrder) {
  return this.findOne({
    courseId,
    order: { $lt: currentOrder },
    isPublished: true
  }).sort({ order: -1 });
};

// Static method to get lesson statistics
lessonSchema.statics.getLessonStats = function(courseId) {
  return this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalLessons: { $sum: 1 },
        totalDuration: { $sum: '$estimatedDuration' },
        totalViews: { $sum: '$totalViews' },
        totalCompletions: { $sum: '$totalCompletions' },
        averageCompletionTime: { $avg: '$averageCompletionTime' }
      }
    }
  ]);
};

// Static method to search lessons
lessonSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    isPublished: true
  };
  
  if (options.courseId) searchQuery.courseId = options.courseId;
  if (options.isFree !== undefined) searchQuery.isFree = options.isFree;
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } })
    .populate('courseId', 'title');
};

module.exports = mongoose.model('Lesson', lessonSchema); 