import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Play, CheckCircle, Circle, ChevronLeft, ChevronRight, Volume2, Maximize, MoreHorizontal, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { youtubeAPI } from '../services/api';

const Course = () => {
  const { id } = useParams();
  const location = useLocation();
  // Use course data from navigation state, fallback to mock if not present
  const courseData = location.state?.course || {
    title: "Complete React Hooks & State Management",
    progress: 0,
    lessons: [
      {
        id: 1,
        title: "Introduction to React Hooks",
        duration: "15 min",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        description: "Learn the fundamentals of React Hooks and why they were introduced",
        isActive: true,
        hasQuiz: true,
        quizQuestions: [
          {
            question: "What problem do React Hooks solve?",
            options: [
              "They make components faster",
              "They allow state and lifecycle in functional components",
              "They replace Redux",
              "They improve SEO"
            ],
            correct: 1,
          },
          {
            question: "Which version of React introduced Hooks?",
            options: [
              "React 15",
              "React 16.8",
              "React 17",
              "React 18"
            ],
            correct: 1,
          }
        ]
      },
      {
        id: 2,
        title: "useState Hook Deep Dive",  
        duration: "25 min",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        description: "Master the useState hook with practical examples and best practices.",
        hasQuiz: true,
        quizQuestions: [
          {
            question: "What does useState return?",
            options: [
              "Just the state value",
              "Just the setter function",
              "An array with state value and setter function",
              "An object with state and setState"
            ],
            correct: 2,
          },
          {
            question: "How do you update state that depends on the previous state?",
            options: [
              "setState(prevState + 1)",
              "setState(prev => prev + 1)",
              "setState.update(prev => prev + 1)",
              "Both A and B are correct"
            ],
            correct: 1,
          }
        ]
      },
      {
        id: 3,
        title: "useEffect and Side Effects",
        duration: "30 min",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        description: "Understand useEffect for handling side effects and lifecycle methods.",
        hasQuiz: true,
        quizQuestions: [
          {
            question: "When does useEffect run by default?",
            options: [
              "Only on mount",
              "Only on unmount",
              "After every render",
              "Only when dependencies change"
            ],
            correct: 2,
          },
          {
            question: "How do you make useEffect run only once?",
            options: [
              "Don't provide a dependency array",
              "Provide an empty dependency array []",
              "Provide [0] as dependency",
              "Use useEffectOnce instead"
            ],
            correct: 1,
          }
        ]
      },
      {
        id: 4,
        title: "Custom Hooks Creation",
        duration: "20 min",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        description: "Build reusable custom hooks to share logic between components.",
        hasQuiz: true,
        quizQuestions: [
          {
            question: "What must custom hook names start with?",
            options: [
              "hook",
              "use",
              "custom",
              "my"
            ],
            correct: 1,
          },
          {
            question: "Can custom hooks call other hooks?",
            options: [
              "No, never",
              "Yes, but only built-in hooks",
              "Yes, any hooks including other custom hooks",
              "Only if they're in the same file"
            ],
            correct: 2,
          }
        ]
      },
      {
        id: 5,
        title: "Context API & useContext",
        duration: "25 min",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        description: "Implement global state management using Context API and useContext hook.",
        hasQuiz: true,
        quizQuestions: [
          {
            question: "What is the Context API used for?",
            options: [
              "Making API calls",
              "Sharing state across components without prop drilling",
              "Styling components",
              "Routing between pages"
            ],
            correct: 1,
          },
          {
            question: "How do you consume context in a functional component?",
            options: [
              "useContext(MyContext)",
              "Context.Consumer",
              "this.context",
              "Both A and B"
            ],
            correct: 3,
          }
        ]
      },
    ],
  };

  // Extract videoResources from courseData if present
  const videoResources = courseData.videoResources;

  // Helper to get recommended videos for a lesson
  const getLessonVideos = (lessonTitle) => {
    if (!videoResources || !videoResources.lessonVideos) return [];
    const lessonObj = videoResources.lessonVideos.find(lv => lv.lessonTitle === lessonTitle);
    return lessonObj ? lessonObj.recommendedVideos : [];
  };

  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const { colors } = useTheme();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    const currentLessonData = courseData.lessons[currentLesson];
    if (currentLessonData.hasQuiz) {
      setTimeout(() => {
        setShowQuiz(true);
      }, 1000);
    } else {
      handleLessonComplete(currentLesson);
    }
  };

  const handleLessonComplete = (lessonIndex) => {
    if (!completedLessons.includes(lessonIndex)) {
      setCompletedLessons([...completedLessons, lessonIndex]);
    }
    setVideoEnded(false);
  };

  const handleQuizAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const currentLessonData = courseData.lessons[currentLesson];
    const isCorrect = answerIndex === currentLessonData.quizQuestions[currentQuestion].correct;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < currentLessonData.quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setQuizCompleted(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setQuizScore(0);
  };

  const handleQuizComplete = () => {
    handleLessonComplete(currentLesson);
    setShowQuiz(false);
    resetQuiz();
    
    // Auto-advance to next lesson if available
    if (currentLesson < courseData.lessons.length - 1) {
      setTimeout(() => {
        setCurrentLesson(currentLesson + 1);
      }, 500);
    }
  };

  const currentLessonData = courseData.lessons[currentLesson];
  const currentQuizQuestions = currentLessonData.quizQuestions || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 min-h-screen bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-gray-800 from-white via-gray-50 to-gray-100 transition-colors duration-300"
    >
      <div className="flex h-screen">
        {/* Left Sidebar - Course Content */}
        <div className="w-80 bg-gradient-to-b dark:from-gray-900/50 dark:to-black/50 from-gray-100/80 to-white/80 backdrop-blur-xl dark:border-white/10 border-gray-200 border-r">
          <div className="p-6">
            {/* Course Title */}
            <div className="mb-6">
              <h1 className="text-xl font-bold dark:text-white text-gray-900 mb-2">
                {courseData.title}
              </h1>
              <div className="flex items-center text-sm dark:text-gray-400 text-gray-600">
                <span>{Math.round((completedLessons.length / courseData.lessons.length) * 100)}% Complete</span>
              </div>
              <div className="w-full dark:bg-white/20 bg-gray-300 rounded-full h-2 mt-2">
                <div 
                  className="dark:bg-white bg-gray-900 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedLessons.length / courseData.lessons.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              {courseData.lessons.map((lesson, index) => (
                <motion.button
                  key={lesson.id || index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (index > 0 && !completedLessons.includes(index - 1)) return; // Prevent skipping ahead
                    setCurrentLesson(index);
                    setVideoEnded(false);
                    resetQuiz();
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all group ${
                    currentLesson === index
                      ? 'dark:bg-white/20 bg-gray-200 dark:border-white/30 border-gray-400 border'
                      : 'dark:bg-white/5 bg-white/70 dark:hover:bg-white/10 hover:bg-gray-100 border-transparent border'
                  } ${index > 0 && !completedLessons.includes(index - 1) ? 'opacity-50 pointer-events-none' : ''}`}
                  disabled={index > 0 && !completedLessons.includes(index - 1)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      {completedLessons.includes(index) ? (
                        <div className="w-8 h-8 rounded-lg dark:bg-white/20 bg-gray-300 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 dark:text-white text-gray-900" />
                        </div>
                      ) : currentLesson === index ? (
                        <div className="w-8 h-8 rounded-lg dark:bg-white/20 bg-gray-300 flex items-center justify-center">
                          <Play className="w-4 h-4 dark:text-white text-gray-900" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg dark:bg-gray-500/20 bg-gray-400 flex items-center justify-center">
                          <Circle className="w-4 h-4 dark:text-gray-500 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium dark:text-white text-gray-900 text-sm mb-1 truncate">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs dark:text-gray-400 text-gray-600">
                          {lesson.duration}
                        </p>
                        {lesson.hasQuiz && (
                          <div className="flex items-center">
                            <BookOpen className="w-3 h-3 dark:text-white text-gray-900 mr-1" />
                            <span className="text-xs dark:text-white text-gray-900">Quiz</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
            {courseData.description && <p className="mb-6">{courseData.description}</p>}
            {/* Only show the current lesson in the main content area */}
            {courseData.lessons && (
              <Card className="mb-6 p-4">
                <h2 className="text-xl font-semibold mb-2">{currentLessonData.title}</h2>
                {currentLessonData.description && <p className="mb-2">{currentLessonData.description}</p>}
                {currentLessonData.videoUrl && (
                  <div className="mb-4">
                    <ReactPlayer url={currentLessonData.videoUrl} controls width="100%" />
                  </div>
                )}
                {/* YouTube Recommendations from backend for current lesson only */}
                {getLessonVideos(currentLessonData.title).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Recommended YouTube Videos</h4>
                    <div className="flex justify-center">
                      {getLessonVideos(currentLessonData.title).map(video => (
                        <div key={video.id} className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden mb-4">
                          <div className="relative" style={{ paddingTop: '56.25%' }}>
                            <ReactPlayer
                              url={video.embedUrl}
                              controls
                              width="100%"
                              height="100%"
                              style={{ position: 'absolute', top: 0, left: 0 }}
                            />
                          </div>
                          <div className="p-2">
                            <div className="font-medium">{video.title}</div>
                            <div className="text-xs text-gray-600">{video.channelTitle}</div>
                            <div className="text-xs text-gray-500">{video.duration} • {video.viewCount}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {currentLessonData.quizQuestions && currentLessonData.quizQuestions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Quiz</h3>
                    {currentLessonData.quizQuestions.map((q, qi) => (
                      <div key={qi} className="mb-2">
                        <p>{q.question}</p>
                        <ul className="list-disc ml-6">
                          {q.options.map((opt, oi) => (
                            <li key={oi}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="bg-gradient-to-br dark:from-white/20 dark:to-white/10 from-white/95 to-gray-100/95 backdrop-blur-xl dark:border-white/20 border-gray-300 border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {!quizCompleted ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold dark:text-white text-gray-900">
                    Quiz: {currentLessonData.title}
                  </h3>
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="p-2 rounded-lg dark:bg-white/10 bg-gray-200 dark:hover:bg-white/20 hover:bg-gray-300 transition-colors dark:text-white text-gray-900"
                  >
                    ✕
                  </button>
                </div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm dark:text-gray-400 text-gray-600">Progress</span>
                    <span className="text-sm dark:text-white text-gray-900">
                      {currentQuestion + 1} of {currentQuizQuestions.length}
                    </span>
                  </div>
                  <div className="w-full dark:bg-white/20 bg-gray-300 rounded-full h-2">
                    <div 
                      className="dark:bg-white bg-gray-900 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / currentQuizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>
                <h4 className="text-lg dark:text-white text-gray-900 mb-6">
                  {currentQuizQuestions[currentQuestion]?.question}
                </h4>
                <div className="space-y-3 mb-8">
                  {currentQuizQuestions[currentQuestion]?.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuizAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedAnswer === index
                          ? index === currentQuizQuestions[currentQuestion].correct
                            ? 'bg-green-500/20 border border-green-500/50'
                            : 'bg-red-500/20 border border-red-500/50'
                          : selectedAnswer !== null && index === currentQuizQuestions[currentQuestion].correct
                          ? 'bg-green-500/20 border border-green-500/50'
                          : 'dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 dark:border-white/20 border-gray-300 border'
                      }`}
                    >
                      <span className="dark:text-white text-gray-900">{option}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-16 h-16 dark:bg-white bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-8 h-8 dark:text-black text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">Quiz Completed!</h3>
                <p className="dark:text-gray-300 text-gray-700 mb-2">
                  You scored {quizScore} out of {currentQuizQuestions.length}
                </p>
                <p className="dark:text-white text-gray-900 mb-8">
                  {quizScore === currentQuizQuestions.length ? 'Perfect score! 🎉' : 
                   quizScore >= currentQuizQuestions.length * 0.7 ? 'Great job! 👏' : 
                   'Keep practicing! 💪'}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="secondary" onClick={() => {
                    setShowQuiz(false);
                    resetQuiz();
                  }}>
                    Retake Quiz
                  </Button>
                  <Button onClick={handleQuizComplete}>
                    Continue Learning
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Course;