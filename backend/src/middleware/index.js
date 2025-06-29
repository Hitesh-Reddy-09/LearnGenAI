// Authentication middleware
const auth = require('./auth');
const validate = require('./validate');
const errorHandler = require('./errorHandler');
const rateLimiter = require('./rateLimiter');

module.exports = {
  auth,
  validate,
  errorHandler,
  rateLimiter,
}; 