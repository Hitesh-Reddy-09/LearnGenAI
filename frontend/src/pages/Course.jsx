import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Play, CheckCircle, XCircle, Circle, ChevronLeft, ChevronRight, Volume2, Maximize, MoreHorizontal, BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { youtubeAPI } from '../services/api';
import axios from 'axios';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../contexts/AuthContext';

const Course = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  
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

  // Initialize currentLesson based on URL parameter or default to 0
  const initialLesson = lessonParam ? parseInt(lessonParam) : 0;
  const [currentLesson, setCurrentLesson] = useState(initialLesson);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const { colors } = useTheme();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [videoProgress, setVideoProgress] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [dynamicQuiz, setDynamicQuiz] = useState(null);
  const [dynamicQuizScore, setDynamicQuizScore] = useState(0);
  const [dynamicQuizCompleted, setDynamicQuizCompleted] = useState(false);

  const { user } = useAuth();

  // Track video progress
  const handleVideoProgress = (state) => {
    setVideoProgress(state.played * 100);
  };

  // Fetch quiz from backend after video ends
  const handleVideoEnd = async () => {
    setVideoEnded(true);
    setQuizLoading(true);
    setShowQuiz(true);
    setDynamicQuiz(null);
    setDynamicQuizScore(0);
    setDynamicQuizCompleted(false);
    try {
      console.log('Generating quiz for:', currentLessonData.title, currentLessonData.description);
      const res = await axios.post('http://localhost:5051/api/ai/generate-quiz', {
        lessonContent: currentLessonData.description,
        lessonTitle: currentLessonData.title
      }, {
        headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
      });
      console.log('Quiz response:', res.data);
      setDynamicQuiz(
        (res.data.data.questions || [])
          .filter(q => {
            const t = (q.type || '').toLowerCase();
            return t === 'mcq' || t === 'true/false';
          })
          .map(q => {
            let options = q.options || q.choices || q.answers;
            if (!options || options.length === 0) {
              if ((q.type && q.type.toLowerCase() === 'true/false') ||
                  (q.question && q.question.toLowerCase().includes('true or false'))) {
                options = ['True', 'False'];
              } else {
                options = [];
              }
            }
            return {
              ...q,
              options
            };
          })
      );
    } catch (err) {
      console.error('Quiz API error:', err);
      setDynamicQuiz([]);
    } finally {
      setQuizLoading(false);
    }
  };

  // Handle dynamic quiz answer
  const handleDynamicQuizAnswer = (answerIndex) => {
    if (!dynamicQuiz || dynamicQuizCompleted || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === dynamicQuiz[currentQuestion].correct;
    if (isCorrect) {
      setDynamicQuizScore(prev => prev + 1);
    }
    // Do not auto-advance; wait for user to click 'Next Question' or 'See Results'
  };

  // After quiz completion, check score and auto-advance if >= 60%
  useEffect(() => {
    if (dynamicQuizCompleted && dynamicQuiz) {
      const percent = (dynamicQuizScore / dynamicQuiz.length) * 100;
      if (percent >= 60) {
        handleLessonComplete(currentLesson);
        setShowQuiz(false);
        resetQuiz();
        if (currentLesson < courseData.lessons.length - 1) {
          setTimeout(() => {
            setCurrentLesson(currentLesson + 1);
          }, 1000);
        }
      }
    }
    // eslint-disable-next-line
  }, [dynamicQuizCompleted]);

  // Helper to get lesson ObjectId by index
  const getLessonId = (idx) => {
    if (!courseData.lessons || !courseData.lessons[idx]) return null;
    return courseData.lessons[idx]._id || courseData.lessons[idx];
  };

  const handleLessonComplete = async (lessonIndex) => {
    const lessonId = getLessonId(lessonIndex);
    if (!lessonId) return;
    if (!completedLessons.includes(lessonId)) {
      const updatedCompleted = [...completedLessons, lessonId];
      setCompletedLessons(updatedCompleted);
      // Calculate progress percentage
      const progress = Math.round((updatedCompleted.length / courseData.lessons.length) * 100);
      const completed = updatedCompleted.length === courseData.lessons.length;
      try {
        await axios.post('/api/auth/progress', {
          courseId: courseData._id,
          progress,
          completedLessonIds: updatedCompleted, // always ObjectIds
          completed,
          currentLessonIndex: currentLesson
        }, {
          headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
        });
      } catch (err) {
        // Optionally handle error
      }
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

  useEffect(() => {
    // If courseData._id is not present, save the course to backend
    if (!courseData._id && user && user._id) {
      (async () => {
        try {
          // Ensure all required fields are present
          const payload = {
            title: courseData.title || 'Untitled Course',
            description: courseData.description || 'No description provided.',
            prompt: courseData.prompt || courseData.description || 'N/A',
            difficulty: courseData.difficulty || 'beginner',
            estimatedDuration: courseData.estimatedDuration || 60,
            category: courseData.category || 'General',
            createdBy: user._id,
            // Optionally include thumbnail, tags, etc.
            thumbnail: courseData.thumbnail || '',
            tags: courseData.tags || [],
            lessons: (courseData.lessons || []).map(lesson => ({
              title: lesson.title,
              description: lesson.description,
              objectives: lesson.objectives || [],
              searchKeywords: lesson.searchKeywords || [],
            })),
          };
          console.log('Course.jsx: /api/course payload:', payload);
          const res = await axios.post('/api/course', payload, {
            headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
          });
          console.log('Course.jsx: /api/course response:', res.data);
          if (res.data.success && res.data.data && res.data.data._id) {
            // Fetch the full course from backend to get lesson ObjectIds
            const courseRes = await axios.get(`/api/course/${res.data.data._id}`, {
              headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
            });
            if (courseRes.data.success && courseRes.data.data) {
              Object.assign(courseData, courseRes.data.data);
            } else {
              courseData._id = res.data.data._id;
            }
          }
        } catch (err) {
          if (err.response) {
            console.error('Course.jsx: /api/course error:', err.response.data);
          } else {
            console.error('Course.jsx: /api/course error:', err);
          }
        }
      })();
    }
    // Always enroll the user (or update progress) when the course is loaded
    if (courseData._id) {
      (async () => {
        try {
          const enrollRes = await axios.post('/api/auth/progress', {
            courseId: courseData._id,
            progress: 0,
            completedLessonIds: [],
            completed: false,
            currentLessonIndex: currentLesson
          }, {
            headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
          });
          console.log('Course.jsx: /api/auth/progress response:', enrollRes.data);
        } catch (err) {
          console.error('Course.jsx: /api/auth/progress error:', err);
        }
      })();
    }
  }, [courseData._id, user]);

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
              {(courseData.lessons || []).map((lesson, index) => (
                <motion.button
                  key={lesson.id || index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (index > 0 && !completedLessons.includes(getLessonId(index - 1))) return; // Prevent skipping ahead
                    setCurrentLesson(index);
                    setVideoEnded(false);
                    resetQuiz();
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all group ${
                    currentLesson === index
                      ? 'dark:bg-white/20 bg-gray-200 dark:border-white/30 border-gray-400 border'
                      : 'dark:bg-white/5 bg-white/70 dark:hover:bg-white/10 hover:bg-gray-100 border-transparent border'
                  } ${index > 0 && !completedLessons.includes(getLessonId(index - 1)) ? 'opacity-50 pointer-events-none' : ''}`}
                  disabled={index > 0 && !completedLessons.includes(getLessonId(index - 1))}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      {completedLessons.includes(getLessonId(index)) ? (
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
                    <ReactPlayer
                      url={currentLessonData.videoUrl}
                      controls
                      width="100%"
                      onProgress={handleVideoProgress}
                      onEnded={handleVideoEnd}
                    />
                    <div className="text-xs text-gray-500 mt-1">Watched: {videoProgress.toFixed(0)}%</div>
                  </div>
                )}
                {/* YouTube Recommendations from backend for current lesson only */}
                {(getLessonVideos(currentLessonData.title) || []).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Recommended YouTube Videos</h4>
                    <div className="flex justify-center">
                      {(getLessonVideos(currentLessonData.title) || []).map(video => (
                        <div key={video.id} className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden mb-4">
                          <div className="relative" style={{ paddingTop: '56.25%' }}>
                            <ReactPlayer
                              url={video.embedUrl}
                              controls
                              width="100%"
                              height="100%"
                              style={{ position: 'absolute', top: 0, left: 0 }}
                              onEnded={handleVideoEnd}
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
                    {(currentLessonData.quizQuestions || []).map((q, qi) => (
                      <div key={qi} className="mb-2">
                        <p>{q.question}</p>
                        <ul className="list-disc ml-6">
                          {(q.options || []).map((opt, oi) => (
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

      {/* Quiz Modal (AI-generated after video) */}
      {showQuiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <Card className="max-w-xl w-full p-8 relative">
            {quizLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-gray-500" />
                <div className="text-lg font-semibold">Generating quiz...</div>
              </div>
            ) : dynamicQuiz && dynamicQuiz.length > 0 ? (
              <div>
                {/* Progress Bar */}
                <div className="mb-6">
                  <ProgressBar progress={((currentQuestion + (dynamicQuizCompleted ? 1 : 0)) / dynamicQuiz.length) * 100} showPercentage={false} size="md" />
                  <div className="text-xs text-center mt-1 text-gray-500">
                    Question {Math.min(currentQuestion + 1, dynamicQuiz.length)} of {dynamicQuiz.length}
                  </div>
                </div>
                {/* Quiz Question */}
                {!dynamicQuizCompleted ? (
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                      <span className="mr-2">Q{currentQuestion + 1}.</span> {dynamicQuiz[currentQuestion].question}
                    </h3>
                    <div className="grid gap-3 mb-4">
                      {(dynamicQuiz[currentQuestion].options || []).map((opt, oi) => {
                        let btnVariant = 'secondary';
                        let btnClass = '';
                        let icon = null;
                        if (selectedAnswer !== null) {
                          if (oi === dynamicQuiz[currentQuestion].correct) {
                            btnVariant = 'primary';
                            btnClass = 'border-2 border-green-500';
                            icon = <CheckCircle className="w-5 h-5 text-green-600 ml-2" />;
                          } else if (oi === selectedAnswer) {
                            btnVariant = 'secondary';
                            btnClass = 'border-2 border-red-500';
                            icon = <XCircle className="w-5 h-5 text-red-600 ml-2" />;
                          }
                        } else if (oi === selectedAnswer) {
                          btnVariant = 'primary';
                        }
                        return (
                          <Button
                            key={oi}
                            onClick={() => handleDynamicQuizAnswer(oi)}
                            variant={btnVariant}
                            size="lg"
                            disabled={selectedAnswer !== null || dynamicQuizCompleted}
                            className={`w-full flex justify-between items-center text-left text-base ${btnClass}`}
                          >
                            <span>{opt}</span>
                            {icon}
                          </Button>
                        );
                      })}
                    </div>
                    {selectedAnswer !== null && (
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={() => {
                            if (currentQuestion + 1 < dynamicQuiz.length) {
                              setCurrentQuestion(currentQuestion + 1);
                              setSelectedAnswer(null);
                            } else {
                              setDynamicQuizCompleted(true);
                            }
                          }}
                          variant="primary"
                          size="md"
                        >
                          {currentQuestion + 1 < dynamicQuiz.length ? 'Next Question' : 'See Results'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-4">
                      <ProgressBar progress={(dynamicQuizScore / dynamicQuiz.length) * 100} showPercentage={true} size="lg" />
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      {(dynamicQuizScore / dynamicQuiz.length) * 100 >= 60 ? (
                        <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600 mr-2" />
                      )}
                      <span className="text-2xl font-bold">
                        Score: {dynamicQuizScore} / {dynamicQuiz.length}
                      </span>
                    </div>
                    {(dynamicQuizScore / dynamicQuiz.length) * 100 >= 60 ? (
                      <div className="text-green-600 font-semibold mb-4">Congratulations! You passed and will move to the next lesson.</div>
                    ) : (
                      <div className="text-red-600 font-semibold mb-4">Score at least 60% to proceed. Please try again.</div>
                    )}
                    <Button
                      onClick={() => {
                        setShowQuiz(false);
                        setDynamicQuizCompleted(false);
                        setCurrentQuestion(0);
                        setSelectedAnswer(null);
                        if ((dynamicQuizScore / dynamicQuiz.length) * 100 >= 60) {
                          handleLessonComplete(currentLesson);
                        }
                      }}
                      variant="primary"
                      size="lg"
                      className="mt-2"
                    >
                      {((dynamicQuizScore / dynamicQuiz.length) * 100 >= 60) ? 'Continue' : 'Retry Quiz'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <div className="text-lg font-semibold">No quiz available for this lesson.</div>
                <Button onClick={() => setShowQuiz(false)} variant="secondary" size="md" className="mt-4">Close</Button>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Course;