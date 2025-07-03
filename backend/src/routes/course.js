const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const router = express.Router();

// Create a new course (with lessons as documents)
router.post('/', verifyToken, async (req, res) => {
  try {
    let lessons = req.body.lessons || [];
    // Remove lessons from body for now
    delete req.body.lessons;
    // Create the course first (without lessons)
    const course = await Course.create(req.body);
    // Now create each lesson, linking to this course
    const lessonDocs = await Promise.all(lessons.map((lesson, idx) => {
      return Lesson.create({
        ...lesson,
        order: idx + 1,
        estimatedDuration: lesson.estimatedDuration || 10,
        courseId: course._id,
        content: lesson.description || lesson.title, // fallback if no content
        isPublished: true,
        aiGenerated: true
      });
    }));
    // Update course.lessons with the new lesson ObjectIds
    course.lessons = lessonDocs.map(l => l._id);
    await course.save();
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get a course by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('lessons');
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router; 