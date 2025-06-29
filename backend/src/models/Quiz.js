const mongoose = require('mongoose');

// Question schema
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'short-answer', 'essay'],
    required: [true, 'Question type is required']
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters long']
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, or array
    required: [true, 'Correct answer is required']
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Question must be worth at least 1 point']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { _id: true });

// Quiz attempt schema
const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
}, { _id: true });

// Quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    minlength: [3, 'Quiz title must be at least 3 characters long'],
    maxlength: [100, 'Quiz title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    trim: true,
    minlength: [10, 'Quiz description must be at least 10 characters long'],
    maxlength: [500, 'Quiz description cannot exceed 500 characters']
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: null,
    min: [1, 'Time limit must be at least 1 minute']
  },
  passingScore: {
    type: Number,
    required: [true, 'Passing score is required'],
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, 'Maximum attempts must be at least 1']
  },
  shuffleQuestions: {
    type: Boolean,
    default: true
  },
  showResults: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: false
  },
  
  // Relationships
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  
  // Quiz status and visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
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
  
  // Quiz statistics
  totalAttempts: {
    type: Number,
    default: 0
  },
  totalPasses: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  
  // User attempts
  attempts: [quizAttemptSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
quizSchema.index({ lessonId: 1 });
quizSchema.index({ courseId: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ isPublic: 1 });
quizSchema.index({ totalAttempts: -1 });
quizSchema.index({ averageScore: -1 });
quizSchema.index({ createdAt: -1 });

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, question) => sum + question.points, 0);
});

// Virtual for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Virtual for pass rate
quizSchema.virtual('passRate').get(function() {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.totalPasses / this.totalAttempts) * 100);
});

// Virtual for average time spent in minutes
quizSchema.virtual('averageTimeSpentMinutes').get(function() {
  return Math.round((this.averageTimeSpent / 60) * 100) / 100;
});

// Pre-save middleware to validate relationships
quizSchema.pre('save', function(next) {
  if (!this.lessonId && !this.courseId) {
    return next(new Error('Quiz must be associated with either a lesson or course'));
  }
  
  if (this.lessonId && this.courseId) {
    return next(new Error('Quiz cannot be associated with both lesson and course'));
  }
  
  next();
});

// Pre-save middleware to update statistics
quizSchema.pre('save', function(next) {
  if (this.isModified('attempts')) {
    this.updateStatistics();
  }
  next();
});

// Instance method to update quiz statistics
quizSchema.methods.updateStatistics = function() {
  if (this.attempts.length === 0) {
    this.totalAttempts = 0;
    this.totalPasses = 0;
    this.averageScore = 0;
    this.averageTimeSpent = 0;
    return;
  }
  
  this.totalAttempts = this.attempts.length;
  this.totalPasses = this.attempts.filter(attempt => attempt.passed).length;
  
  const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
  this.averageScore = Math.round((totalScore / this.attempts.length) * 100) / 100;
  
  const totalTime = this.attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
  this.averageTimeSpent = Math.round((totalTime / this.attempts.length) * 100) / 100;
};

// Instance method to submit attempt
quizSchema.methods.submitAttempt = function(userId, answers, timeSpent) {
  // Check if user has exceeded max attempts
  const userAttempts = this.attempts.filter(
    attempt => attempt.user.toString() === userId.toString()
  );
  
  if (userAttempts.length >= this.maxAttempts) {
    throw new Error('Maximum attempts exceeded');
  }
  
  // Calculate score
  let totalPoints = 0;
  let earnedPoints = 0;
  const gradedAnswers = [];
  
  this.questions.forEach((question, index) => {
    totalPoints += question.points;
    const userAnswer = answers[index];
    const isCorrect = this.checkAnswer(question, userAnswer);
    const pointsEarned = isCorrect ? question.points : 0;
    
    earnedPoints += pointsEarned;
    
    gradedAnswers.push({
      questionIndex: index,
      answer: userAnswer,
      isCorrect,
      pointsEarned,
      timeSpent: timeSpent / this.questions.length // Distribute time evenly
    });
  });
  
  const percentage = Math.round((earnedPoints / totalPoints) * 100);
  const passed = percentage >= this.passingScore;
  
  // Create attempt
  const attempt = {
    user: userId,
    score: earnedPoints,
    percentage,
    passed,
    answers: gradedAnswers,
    startedAt: new Date(),
    completedAt: new Date(),
    timeSpent
  };
  
  this.attempts.push(attempt);
  this.updateStatistics();
  
  return this.save().then(() => ({
    attempt,
    totalPoints,
    earnedPoints,
    percentage,
    passed
  }));
};

// Instance method to check answer
quizSchema.methods.checkAnswer = function(question, userAnswer) {
  switch (question.type) {
    case 'multiple-choice':
      return userAnswer === question.correctAnswer;
    
    case 'true-false':
      return userAnswer === question.correctAnswer;
    
    case 'fill-blank':
      return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    
    case 'short-answer':
      // Simple keyword matching for short answers
      const userKeywords = userAnswer.toLowerCase().split(/\s+/);
      const correctKeywords = question.correctAnswer.toLowerCase().split(/\s+/);
      const matchCount = userKeywords.filter(keyword => 
        correctKeywords.includes(keyword)
      ).length;
      return matchCount >= Math.ceil(correctKeywords.length * 0.7); // 70% match threshold
    
    case 'essay':
      // For essays, we'll need manual grading
      return null; // Requires manual review
    
    default:
      return false;
  }
};

// Instance method to get user's best attempt
quizSchema.methods.getUserBestAttempt = function(userId) {
  const userAttempts = this.attempts.filter(
    attempt => attempt.user.toString() === userId.toString()
  );
  
  if (userAttempts.length === 0) return null;
  
  return userAttempts.reduce((best, current) => 
    current.percentage > best.percentage ? current : best
  );
};

// Instance method to get user's attempts
quizSchema.methods.getUserAttempts = function(userId) {
  return this.attempts.filter(
    attempt => attempt.user.toString() === userId.toString()
  ).sort((a, b) => b.completedAt - a.completedAt);
};

// Static method to find quizzes by lesson
quizSchema.statics.findByLesson = function(lessonId) {
  return this.find({ lessonId, isActive: true });
};

// Static method to find quizzes by course
quizSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId, isActive: true });
};

// Static method to find popular quizzes
quizSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalAttempts: -1 })
    .limit(limit);
};

// Static method to get quiz statistics
quizSchema.statics.getQuizStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        totalAttempts: { $sum: '$totalAttempts' },
        totalPasses: { $sum: '$totalPasses' },
        averageScore: { $avg: '$averageScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('Quiz', quizSchema); 