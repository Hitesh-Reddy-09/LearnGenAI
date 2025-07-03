// backend/server.js
console.log('🟢 Server script started');

require('dotenv').config();
console.log('✅ .env loaded');

let express, cors, helmet, compression, rateLimit, connectDatabase, logger, PORT, NODE_ENV, apiRoutes, errorHandler;

try {
  express = require('express');
  cors = require('cors');
  helmet = require('helmet');
  compression = require('compression');
  rateLimit = require('express-rate-limit');
  console.log('✅ Core packages loaded');
} catch (err) {
  console.error('❌ Failed to load core packages:', err);
  process.exit(1);
}

try {
  connectDatabase = require('./src/utils/database').connectDatabase;
  console.log('✅ Database utils loaded');
} catch (err) {
  console.error('❌ Failed to load database utils:', err);
  process.exit(1);
}

try {
  logger = require('./src/utils/logger');
  console.log('✅ Logger loaded');
} catch (err) {
  console.error('❌ Failed to load logger:', err);
  logger = console; // fallback
}

try {
  ({ PORT, NODE_ENV } = require('./src/utils/constants'));
  console.log('✅ Constants loaded:', { PORT, NODE_ENV });
} catch (err) {
  logger.error('❌ Failed to load constants:', err);
  process.exit(1);
}

try {
  apiRoutes = require('./src/routes');
  console.log('✅ Routes loaded');
} catch (err) {
  logger.error('❌ Failed to load routes:', err);
  process.exit(1);
}

try {
  errorHandler = require('./src/middleware/errorHandler').errorHandler;
  console.log('✅ Error handler loaded');
} catch (err) {
  logger.error('❌ Failed to load error handler:', err);
  process.exit(1);
}

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
console.log('✅ Helmet configured');

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
console.log('✅ CORS configured');

// Middleware
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}));
console.log('✅ Rate limiter configured');

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Middleware configured');

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'LearnGenAI Backend is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Test route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to LearnGenAI API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🔗 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

// Global crash handlers
process.on('unhandledRejection', (err) => {
  logger.error('💥 Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

startServer();
