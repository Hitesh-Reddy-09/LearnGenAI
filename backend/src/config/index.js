const { NODE_ENV } = require('../utils/constants');

// Database configuration
const database = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/learngen',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

// JWT configuration
const jwt = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: '30d',
};

// Email configuration
const email = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: process.env.FROM_EMAIL || 'noreply@learngen.com',
};

// Google AI configuration
const googleAI = {
  apiKey: process.env.GOOGLE_AI_API_KEY,
  model: 'gemini-pro',
  maxTokens: 2048,
  temperature: 0.7,
};

// Security configuration
const security = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
  },
};

// File upload configuration
const upload = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ],
  uploadDir: 'uploads',
};

// Pagination configuration
const pagination = {
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100,
};

// Logging configuration
const logging = {
  level: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'warn' : 'debug'),
  filename: 'logs/app.log',
  maxSize: '20m',
  maxFiles: '14d',
};

module.exports = {
  database,
  jwt,
  email,
  googleAI,
  security,
  upload,
  pagination,
  logging,
}; 