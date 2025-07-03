// Environment variables
const PORT = process.env.PORT || 5050;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learngen';

// JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Google AI
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Email
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@learngen.com';

// Frontend
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// File upload
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

// Pagination
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// API Response messages
const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    COURSE_CREATED: 'Course created successfully',
    COURSE_UPDATED: 'Course updated successfully',
    COURSE_DELETED: 'Course deleted successfully',
    CONTENT_GENERATED: 'Content generated successfully'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden access',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database error',
    AI_SERVICE_ERROR: 'AI service error'
  }
};

// HTTP Status codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

module.exports = {
  PORT,
  NODE_ENV,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  GOOGLE_AI_API_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  FRONTEND_URL,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MESSAGES,
  STATUS_CODES
}; 