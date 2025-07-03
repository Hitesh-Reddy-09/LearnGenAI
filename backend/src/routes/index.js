const express = require('express');
const router = express.Router();

console.log('Loading aiRoutes...');
const aiRoutes = require('./ai');
console.log('aiRoutes loaded.');

console.log('Loading authRoutes...');
const authRoutes = require('./auth');
console.log('authRoutes loaded.');

console.log('Loading youtubeRoutes...');
const youtubeRoutes = require('./youtube');
console.log('youtubeRoutes loaded.');

console.log('Loading courseRoutes...');
const courseRoutes = require('./course');
console.log('courseRoutes loaded.');

router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);
router.use('/youtube', youtubeRoutes);
router.use('/course', courseRoutes);

module.exports = router;