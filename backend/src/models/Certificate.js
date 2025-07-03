const mongoose = require('mongoose');
const crypto = require('crypto');

// Certificate schema
const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  certificateId: {
    type: String,
    required: [true, 'Certificate ID is required'],
    unique: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  verificationHash: {
    type: String,
    required: [true, 'Verification hash is required'],
    unique: true
  },
  pdfUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  
  // Certificate metadata
  courseTitle: {
    type: String,
    required: [true, 'Course title is required']
  },
  userName: {
    type: String,
    required: [true, 'User name is required']
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required']
  },
  
  // Certificate details
  certificateNumber: {
    type: String,
    required: [true, 'Certificate number is required'],
    unique: true
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  lessonsCompleted: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  
  // Certificate design and branding
  template: {
    type: String,
    default: 'default',
    enum: ['default', 'premium', 'corporate', 'academic']
  },
  logo: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  issuerName: {
    type: String,
    default: 'LearnGenAI'
  },
  issuerTitle: {
    type: String,
    default: 'Chief Learning Officer'
  },
  
  // Verification and security
  expiresAt: {
    type: Date,
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  revocationReason: {
    type: String,
    default: null
  },
  
  // Additional metadata
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
certificateSchema.index({ userId: 1 });
certificateSchema.index({ courseId: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ issuedDate: -1 });
certificateSchema.index({ completionDate: -1 });
certificateSchema.index({ expiresAt: 1 });

// Compound indexes
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ status: 1, issuedDate: -1 });

// Virtual for completion percentage
certificateSchema.virtual('completionPercentage').get(function() {
  if (this.totalLessons === 0) return 0;
  return Math.round((this.lessonsCompleted / this.totalLessons) * 100);
});

// Virtual for duration in hours
certificateSchema.virtual('durationHours').get(function() {
  return Math.round((this.totalDuration / 60) * 100) / 100;
});

// Virtual for verification URL
certificateSchema.virtual('verificationUrl').get(function() {
  return `/verify/${this.verificationHash}`;
});

// Virtual for is expired
certificateSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for is revoked
certificateSchema.virtual('isRevoked').get(function() {
  return this.status === 'revoked';
});

// Virtual for is valid
certificateSchema.virtual('isValid').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Pre-save middleware to generate certificate ID and verification hash
certificateSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate certificate ID
    if (!this.certificateId) {
      this.certificateId = this.generateCertificateId();
    }
    
    // Generate certificate number
    if (!this.certificateNumber) {
      this.certificateNumber = this.generateCertificateNumber();
    }
    
    // Generate verification hash
    if (!this.verificationHash) {
      this.verificationHash = this.generateVerificationHash();
    }
  }
  next();
});

// Pre-save middleware to update status based on expiration
certificateSchema.pre('save', function(next) {
  if (this.expiresAt && new Date() > this.expiresAt && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Instance method to generate certificate ID
certificateSchema.methods.generateCertificateId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CERT-${timestamp}-${random}`.toUpperCase();
};

// Instance method to generate certificate number
certificateSchema.methods.generateCertificateNumber = function() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `LG-${year}-${random}`;
};

// Instance method to generate verification hash
certificateSchema.methods.generateVerificationHash = function() {
  const data = `${this.userId}-${this.courseId}-${this.certificateId}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Instance method to verify certificate
certificateSchema.methods.verify = function() {
  if (this.status !== 'active') {
    return {
      valid: false,
      reason: this.status === 'revoked' ? 'Certificate has been revoked' : 'Certificate has expired'
    };
  }
  
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.status = 'expired';
    this.save();
    return {
      valid: false,
      reason: 'Certificate has expired'
    };
  }
  
  return {
    valid: true,
    certificate: {
      id: this.certificateId,
      number: this.certificateNumber,
      user: this.userName,
      course: this.courseTitle,
      issuedDate: this.issuedDate,
      score: this.score,
      status: this.status
    }
  };
};

// Instance method to revoke certificate
certificateSchema.methods.revoke = function(revokedBy, reason = 'Certificate revoked by administrator') {
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revocationReason = reason;
  
  return this.save();
};

// Instance method to renew certificate
certificateSchema.methods.renew = function(newExpiryDate) {
  if (this.status === 'revoked') {
    throw new Error('Cannot renew a revoked certificate');
  }
  
  this.status = 'active';
  this.expiresAt = newExpiryDate;
  this.revokedAt = null;
  this.revokedBy = null;
  this.revocationReason = null;
  
  return this.save();
};

// Instance method to generate PDF URL
certificateSchema.methods.generatePdfUrl = function() {
  // This would typically integrate with a PDF generation service
  this.pdfUrl = `/certificates/${this.certificateId}/pdf`;
  return this.save();
};

// Static method to find certificates by user
certificateSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('courseId', 'title category')
    .sort({ issuedDate: -1 });
};

// Static method to find certificates by course
certificateSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId })
    .populate('userId', 'name email')
    .sort({ issuedDate: -1 });
};

// Static method to find active certificates
certificateSchema.statics.findActive = function() {
  return this.find({ status: 'active' })
    .populate('userId', 'name email')
    .populate('courseId', 'title category')
    .sort({ issuedDate: -1 });
};

// Static method to find expired certificates
certificateSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    expiresAt: { $lt: new Date() }
  })
    .populate('userId', 'name email')
    .populate('courseId', 'title category');
};

// Static method to verify certificate by hash
certificateSchema.statics.verifyByHash = function(hash) {
  return this.findOne({ verificationHash: hash })
    .populate('userId', 'name email')
    .populate('courseId', 'title category');
};

// Static method to verify certificate by ID
certificateSchema.statics.verifyById = function(certificateId) {
  return this.findOne({ certificateId })
    .populate('userId', 'name email')
    .populate('courseId', 'title category');
};

// Static method to get certificate statistics
certificateSchema.statics.getCertificateStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalCertificates: { $sum: 1 },
        activeCertificates: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        revokedCertificates: {
          $sum: {
            $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0]
          }
        },
        expiredCertificates: {
          $sum: {
            $cond: [{ $eq: ['$status', 'expired'] }, 1, 0]
          }
        },
        averageScore: { $avg: '$score' }
      }
    }
  ]);
};

// Static method to get certificates by date range
certificateSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    issuedDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .populate('userId', 'name email')
    .populate('courseId', 'title category')
    .sort({ issuedDate: -1 });
};

// Static method to get top performing certificates
certificateSchema.statics.findTopPerformers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ score: -1, issuedDate: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .populate('courseId', 'title category');
};

module.exports = mongoose.model('Certificate', certificateSchema); 