const express = require('express');
const { verifyToken } = require('../middleware/auth');
const groqService = require('../services/groqService');

const router = express.Router();

// Generate a course using Groq AI
router.post('/generate-course', verifyToken, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, message: 'Prompt is required.' });
  }
  try {
    const course = await groqService.generateCourseWithVideos(prompt, { videosPerLesson: 3, duration: 'medium' });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate course.' });
  }
});

// Generate a quiz for a lesson using Groq AI
router.post('/generate-quiz', verifyToken, async (req, res) => {
  const { lessonContent, lessonTitle } = req.body;
  if (!lessonContent || !lessonTitle) {
    return res.status(400).json({ success: false, message: 'lessonContent and lessonTitle are required.' });
  }
  try {
    const quiz = await groqService.generateQuiz(lessonContent, lessonTitle);
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate quiz.' });
  }
});

// Generate a final test for a course using Groq AI
router.post('/generate-final-test', verifyToken, async (req, res) => {
  const { courseData } = req.body;
  if (!courseData) {
    return res.status(400).json({ success: false, message: 'courseData is required.' });
  }
  try {
    const test = await groqService.generateFinalTest(courseData);
    res.json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate final test.' });
  }
});

// Evaluate a short answer using Groq AI
router.post('/evaluate-short-answer', verifyToken, async (req, res) => {
  const { question, userAnswer, keywords } = req.body;
  if (!question || !userAnswer || !Array.isArray(keywords)) {
    return res.status(400).json({ success: false, message: 'question, userAnswer, and keywords are required.' });
  }
  try {
    const result = await groqService.evaluateShortAnswer(question, userAnswer, keywords);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to evaluate answer.' });
  }
});

module.exports = router; 