/**
 * Gemini AI Service for Course Generation
 * Uses GoogleGenerativeAI (gemini-1.5-pro) for content generation
 *
 * @module geminiService
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GOOGLE_AI_API_KEY } = require('../utils/constants');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
const MODEL_NAME = 'gemini-1.5-pro';

/**
 * Helper: Sanitize content by removing unwanted characters and trimming whitespace
 * @param {string} text
 * @returns {string}
 */
function sanitizeContent(text) {
  if (!text) return '';
  return text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Helper: Extract keywords from content (simple split, can be improved)
 * @param {string} content
 * @returns {string[]}
 */
function extractKeywords(content) {
  if (!content) return [];
  // Simple keyword extraction: split by space, remove stopwords, dedupe
  const stopwords = ['the', 'and', 'of', 'to', 'in', 'a', 'is', 'for', 'on', 'with', 'as', 'by', 'an', 'at', 'from', 'that', 'this', 'it', 'be', 'are', 'or'];
  return Array.from(new Set(
    content
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(' ')
      .filter(word => word && !stopwords.includes(word))
  ));
}

/**
 * Helper: Validate Gemini response and parse JSON
 * @param {any} response
 * @returns {object|null}
 */
function validateGeminiResponse(response) {
  if (!response || !response.candidates || !response.candidates[0]?.content?.parts) return null;
  const text = response.candidates[0].content.parts[0].text || response.candidates[0].content.parts[0];
  try {
    const json = typeof text === 'string' ? JSON.parse(text) : text;
    return json;
  } catch (err) {
    return null;
  }
}

/**
 * Generate a structured course with 4-6 lessons
 * @param {string} prompt - Course topic or requirements
 * @returns {Promise<object>} - { title, description, difficulty, lessons: [ ... ] }
 * @example
 * const course = await geminiService.generateCourse('Introduction to Machine Learning');
 */
async function generateCourse(prompt) {
  try {
    const aiPrompt = `Generate a JSON object for a course on: "${prompt}". The course should have:
- title
- description
- difficulty (beginner/intermediate/advanced)
- lessons: array of 4-6 lessons, each with:
  - title
  - description
  - objectives (array)
  - searchKeywords (array)
Return only valid JSON.`;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const response = await model.generateContent(aiPrompt);
    const data = validateGeminiResponse(response);
    if (!data || !data.lessons) throw new Error('Invalid AI response');
    // Sanitize and enrich
    data.title = sanitizeContent(data.title);
    data.description = sanitizeContent(data.description);
    data.lessons = data.lessons.map(lesson => ({
      ...lesson,
      title: sanitizeContent(lesson.title),
      description: sanitizeContent(lesson.description),
      objectives: (lesson.objectives || []).map(sanitizeContent),
      searchKeywords: lesson.searchKeywords || extractKeywords(lesson.description)
    }));
    return data;
  } catch (err) {
    if (err.message && err.message.includes('rate limit')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    }
    // Fallback response
    return {
      title: 'Sample Course',
      description: 'This is a fallback course description.',
      difficulty: 'beginner',
      lessons: []
    };
  }
}

/**
 * Generate a quiz for a lesson
 * @param {string} lessonContent - The lesson content
 * @param {string} lessonTitle - The lesson title
 * @returns {Promise<object>} - { questions: [ { type, question, options, correct } ] }
 * @example
 * const quiz = await geminiService.generateQuiz('Lesson content...', 'Lesson Title');
 */
async function generateQuiz(lessonContent, lessonTitle) {
  try {
    const aiPrompt = `Generate a JSON array of 4-6 quiz questions for the lesson titled "${lessonTitle}". Use the following lesson content:\n"""\n${lessonContent}\n"""\nEach question should be one of: MCQ (multiple choice, 4 options) or True/False. For each question, include:\n- type ("MCQ" or "True/False")\n- question\n- options (array, for MCQ: 4 options; for True/False: ["True", "False"])\n- correct (the index of the correct option: 0-based for MCQ, 0 for "True", 1 for "False" in True/False)\nDo NOT include any short answer or open-ended questions. Return only valid JSON.`;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const response = await model.generateContent(aiPrompt);
    // Debug: log the raw response
    console.log('Gemini raw response (generateQuiz):', JSON.stringify(response, null, 2));
    const data = validateGeminiResponse(response);
    if (!data || !Array.isArray(data)) {
      console.error('Gemini response could not be parsed as array:', data);
      throw new Error('Invalid AI response');
    }
    // Sanitize
    return {
      questions: data.map(q => ({
        ...q,
        question: sanitizeContent(q.question),
        options: q.options ? q.options.map(sanitizeContent) : undefined,
        correct: typeof q.correct === 'number' ? q.correct : (typeof q.answer === 'number' ? q.answer : undefined)
      }))
    };
  } catch (err) {
    console.error('Gemini generateQuiz error:', err);
    if (err.message && err.message.includes('rate limit')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    }
    // Fallback
    return { questions: [] };
  }
}

/**
 * Generate a comprehensive final test for a course
 * @param {object} courseData - The full course data
 * @returns {Promise<object>} - { questions: [ ... ] }
 * @example
 * const test = await geminiService.generateFinalTest(courseData);
 */
async function generateFinalTest(courseData) {
  try {
    const aiPrompt = `Generate a JSON array of 10-15 comprehensive test questions for the following course:
${JSON.stringify(courseData)}
Mix question types (MCQ, True/False, Short Answer, Scenario-based). For each question, include:
- type
- question
- options (if MCQ)
- answer
Return only valid JSON.`;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const response = await model.generateContent(aiPrompt);
    const data = validateGeminiResponse(response);
    if (!data || !Array.isArray(data)) throw new Error('Invalid AI response');
    // Sanitize
    return {
      questions: data.map(q => ({
        ...q,
        question: sanitizeContent(q.question),
        options: q.options ? q.options.map(sanitizeContent) : undefined,
        answer: sanitizeContent(q.answer)
      }))
    };
  } catch (err) {
    if (err.message && err.message.includes('rate limit')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    }
    // Fallback
    return { questions: [] };
  }
}

/**
 * Evaluate a short answer using AI
 * @param {string} question - The question
 * @param {string} userAnswer - The user's answer
 * @param {string[]} keywords - Keywords expected in the answer
 * @returns {Promise<object>} - { score: number, feedback: string, suggestions: string[] }
 * @example
 * const result = await geminiService.evaluateShortAnswer('What is AI?', 'AI is...', ['intelligence', 'machine']);
 */
async function evaluateShortAnswer(question, userAnswer, keywords) {
  try {
    const aiPrompt = `Evaluate the following short answer. Question: "${question}". User's answer: "${userAnswer}". Expected keywords: ${JSON.stringify(keywords)}.
Return a JSON object with:
- score (0-1)
- feedback (string)
- suggestions (array of strings for improvement)
Return only valid JSON.`;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const response = await model.generateContent(aiPrompt);
    const data = validateGeminiResponse(response);
    if (!data || typeof data.score !== 'number') throw new Error('Invalid AI response');
    // Sanitize
    return {
      score: data.score,
      feedback: sanitizeContent(data.feedback),
      suggestions: (data.suggestions || []).map(sanitizeContent)
    };
  } catch (err) {
    if (err.message && err.message.includes('rate limit')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    }
    // Fallback
    return {
      score: 0,
      feedback: 'Could not evaluate answer. Please try again later.',
      suggestions: []
    };
  }
}

module.exports = {
  generateCourse,
  generateQuiz,
  generateFinalTest,
  evaluateShortAnswer,
  validateGeminiResponse,
  sanitizeContent,
  extractKeywords
};

/**
 * Example usage:
 *
 * const geminiService = require('./geminiService');
 *
 * // Generate a course
 * geminiService.generateCourse('Intro to AI').then(console.log);
 *
 * // Generate a quiz
 * geminiService.generateQuiz('Lesson content...', 'Lesson Title').then(console.log);
 *
 * // Generate a final test
 * geminiService.generateFinalTest(courseData).then(console.log);
 *
 * // Evaluate a short answer
 * geminiService.evaluateShortAnswer('What is AI?', 'AI is...', ['intelligence', 'machine']).then(console.log);
 */ 