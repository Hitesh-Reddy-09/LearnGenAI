const axios = require('axios');
const youtubeService = require('./youtubeService');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';

/** 
 * Helper: Sanitize content by removing unwanted characters and trimming whitespace
 * @param {string} text
 * @returns {string}
 */
function sanitizeContent(text) {
  if (!text) return '';
  // Convert to string if it's not already
  const textStr = String(text);
  return textStr.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Helper: Extract keywords from content (simple split, can be improved)
 * @param {string} content
 * @returns {string[]}
 */
function extractKeywords(content) {
  if (!content) return [];
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
 * Helper: Extract JSON from markdown code blocks
 * @param {string} text
 * @returns {string|null}
 */
function extractJsonFromMarkdown(text) {
  if (!text) return null;
  
  // Match triple backtick code block with optional "json" language tag
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // Fallback: try to find JSON array or object
  // Look for array first: [...]
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  
  // Then look for object: {...}
  const objectMatch = text.match(/{[\s\S]*}/);
  if (objectMatch) {
    return objectMatch[0];
  }
  
  return null;
}

/**
 * Helper: Validate and parse JSON from LLM response
 * @param {string} text
 * @returns {object|null}
 */
function validateGroqResponse(text) {
  try {
    // First try to parse as direct JSON
    if (typeof text === 'string') {
      try {
        return JSON.parse(text);
      } catch (e) {
        // If direct parsing fails, try to extract from markdown
        const jsonString = extractJsonFromMarkdown(text);
        if (jsonString) {
          console.log('Extracted JSON string:', jsonString);
          return JSON.parse(jsonString);
        }
      }
    }
    return text;
  } catch (err) {
    console.error('JSON parsing error:', err.message);
    return null;
  }
}

/**
 * Call Groq API with a system prompt and user prompt
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {number} max_tokens
 * @returns {Promise<string>} response text
 */
async function callGroq(systemPrompt, userPrompt, max_tokens = 1024) {
  const response = await axios.post(
    GROQ_API_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}

/**
 * Generate a structured course with 4-6 lessons
 * @param {string} prompt
 * @returns {Promise<object>}
 */
async function generateCourse(prompt) {
  const systemPrompt = `You are an expert course designer. Generate a JSON object for a course on: "${prompt}". The course should have:\n- title\n- description\n- difficulty (beginner/intermediate/advanced)\n- lessons: array of as many lessons as needed to cover the topic in depth, each with:\n  - title\n  - description\n  - objectives (array)\n  - searchKeywords (array)\nReturn only valid JSON.`;
  try {
    const text = await callGroq(systemPrompt, '', 2048);
    console.log('Groq raw response (generateCourse):', text);
    const data = validateGroqResponse(text);
    if (!data || !data.lessons) throw new Error('Invalid AI response');
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
    console.error('Groq generateCourse error:', err);
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
 * @param {string} lessonContent
 * @param {string} lessonTitle
 * @returns {Promise<object>}
 */
async function generateQuiz(lessonContent, lessonTitle) {
  const systemPrompt = `You are an expert educator. Generate a JSON array of 4-6 quiz questions for the lesson titled "${lessonTitle}". Use the following lesson content:\n"""\n${lessonContent}\n"""\nEach question should be one of: MCQ (multiple choice, 4 options) or True/False. For each question, include:\n- type ("MCQ" or "True/False")\n- question\n- options (array, for MCQ: 4 options; for True/False: ["True", "False"])\n- correct (the index of the correct option: 0-based for MCQ, 0 for "True", 1 for "False" in True/False)\nDo NOT include any short answer or open-ended questions. Return only valid JSON.`;
  try {
    const text = await callGroq(systemPrompt, '', 2048);
    console.log('Groq raw response (generateQuiz):', text);
    const data = validateGroqResponse(text);
    if (!data || !Array.isArray(data)) throw new Error('Invalid AI response');
    return {
      questions: data.map(q => ({
        ...q,
        question: sanitizeContent(q.question),
        options: q.options ? q.options.map(sanitizeContent) : undefined,
        correct: typeof q.correct === 'number' ? q.correct : (typeof q.answer === 'number' ? q.answer : undefined)
      }))
    };
  } catch (err) {
    console.error('Groq generateQuiz error:', err);
    return { questions: [] };
  }
}

/**
 * Generate a comprehensive final test for a course
 * @param {object} courseData
 * @returns {Promise<object>}
 */
async function generateFinalTest(courseData) {
  const systemPrompt = `You are an expert educator. Generate a JSON array of 10-15 comprehensive test questions for the following course:\n${JSON.stringify(courseData)}\nMix question types (MCQ, True/False, Short Answer, Scenario-based). For each question, include:\n- type\n- question\n- options (if MCQ)\n- answer\nReturn only valid JSON.`;
  try {
    const text = await callGroq(systemPrompt, '', 2048);
    console.log('Groq raw response (generateFinalTest):', text);
    const data = validateGroqResponse(text);
    if (!data || !Array.isArray(data)) throw new Error('Invalid AI response');
    return {
      questions: data.map(q => ({
        ...q,
        question: sanitizeContent(q.question),
        options: q.options ? q.options.map(sanitizeContent) : undefined,
        answer: sanitizeContent(q.answer)
      }))
    };
  } catch (err) {
    console.error('Groq generateFinalTest error:', err);
    return { questions: [] };
  }
}

/**
 * Evaluate a short answer using AI
 * @param {string} question
 * @param {string} userAnswer
 * @param {string[]} keywords
 * @returns {Promise<object>}
 */
async function evaluateShortAnswer(question, userAnswer, keywords) {
  const systemPrompt = `You are an expert educator. Evaluate the following short answer. Question: \"${question}\". User's answer: \"${userAnswer}\". Expected keywords: ${JSON.stringify(keywords)}.\nReturn a JSON object with:\n- score (0-1)\n- feedback (string)\n- suggestions (array of strings for improvement)\nReturn only valid JSON.`;
  try {
    const text = await callGroq(systemPrompt, '', 1024);
    console.log('Groq raw response (evaluateShortAnswer):', text);
    const data = validateGroqResponse(text);
    if (!data || typeof data.score !== 'number') throw new Error('Invalid AI response');
    return {
      score: data.score,
      feedback: sanitizeContent(data.feedback),
      suggestions: (data.suggestions || []).map(sanitizeContent)
    };
  } catch (err) {
    console.error('Groq evaluateShortAnswer error:', err);
    return {
      score: 0,
      feedback: 'Could not evaluate answer. Please try again later.',
      suggestions: []
    };
  }
}

/**
 * Generate a course and fetch YouTube video recommendations for each lesson
 * @param {string} prompt
 * @param {object} options - Options for YouTube search (e.g., videosPerLesson, duration)
 * @returns {Promise<object>}
 */
async function generateCourseWithVideos(prompt, options = {}) {
  const course = await generateCourse(prompt);
  if (!course || !course.lessons || course.lessons.length === 0) return course;
  const videoResources = await youtubeService.getVideosForCourse(course, options);
  return { ...course, videoResources };
}

module.exports = {
  generateCourse,
  generateCourseWithVideos,
  generateQuiz,
  generateFinalTest,
  evaluateShortAnswer,
  validateGroqResponse,
  sanitizeContent,
  extractKeywords,
  extractJsonFromMarkdown
}; 