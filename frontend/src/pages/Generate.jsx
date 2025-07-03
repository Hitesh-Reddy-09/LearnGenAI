import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, BookOpen, Users, ChevronRight, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { aiAPI } from '../services/api';

const Generate = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { colors } = useTheme();

  const samplePrompts = [
    "I want to learn React hooks and state management with practical examples",
    "Teach me Python data structures and algorithms for technical interviews",
    "Create a course on machine learning basics with hands-on projects",
    "I need to understand JavaScript async programming and Promises",
    "Help me learn UI/UX design principles and best practices",
    "Teach me Docker containerization from beginner to advanced"
  ];

  const steps = [
    "Analyzing your learning goals...",
    "Structuring course content...",
    "Generating video materials...",
    "Creating interactive quizzes...",
    "Finalizing your personalized course..."
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress(0);
    setError('');
    setResult(null);

    // Simulate progress bar and steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      for (let j = 0; j <= 20; j++) {
        setProgress((i * 20) + j);
        await new Promise(resolve => setTimeout(resolve, 60));
      }
    }

    // Call backend API
    try {
      const data = await aiAPI.generateCourse(prompt);
      setResult(data.data || data.result || data);
      navigate('/course', { state: { course: data.data || data.result || data } });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to generate course.');
    }
    setIsGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 min-h-screen"
    >
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 dark:text-white text-gray-900">
            Generate Your Course
          </h1>
          <p className="text-xl dark:text-gray-400 text-gray-600 max-w-3xl mx-auto">
            Describe what you want to learn, and our AI will create a comprehensive, 
            interactive course tailored specifically for you.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-lg font-medium dark:text-white text-gray-900 mb-3">
                What would you like to learn?
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="I want to learn..."
                className="w-full h-32 p-4 dark:bg-white/10 bg-gray-50 dark:border-white/20 border-gray-300 border rounded-xl dark:text-white text-gray-900 dark:placeholder-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-gray-400 focus:border-transparent resize-none backdrop-blur-sm transition-colors duration-300"
                disabled={isGenerating}
              />
            </div>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="dark:text-white text-gray-900 font-medium">{currentStep}</span>
                  <span className="dark:text-gray-400 text-gray-600">{Math.round(progress)}%</span>
                </div>
                <ProgressBar progress={progress} />
              </motion.div>
            )}

            <Button
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={!prompt.trim() || isGenerating}
              size="lg"
              className="w-full"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating Your Course...' : 'Generate Course'}
            </Button>

            {error && (
              <div className="mt-4 text-red-600 dark:text-red-400 text-center">{error}</div>
            )}

            {result && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">Generated Course</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto text-left">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </Card>

          {!isGenerating && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 dark:text-white text-gray-900" />
                  Sample Prompts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {samplePrompts.map((sample, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPrompt(sample)}
                      className="text-left p-4 dark:bg-white/5 bg-gray-50 dark:hover:bg-white/10 hover:bg-gray-100 dark:border-white/10 border-gray-200 dark:hover:border-white/20 hover:border-gray-300 border rounded-lg transition-all group"
                    >
                      <span className="dark:text-gray-300 text-gray-700 dark:group-hover:text-white group-hover:text-gray-900 transition-colors">
                        {sample}
                      </span>
                      <ChevronRight className="w-4 h-4 mt-2 dark:text-white text-gray-900 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">What You'll Get</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 text-center">
                    <Clock className="w-8 h-8 dark:text-white text-gray-900 mx-auto mb-4" />
                    <h4 className="font-semibold dark:text-white text-gray-900 mb-2">Quick Generation</h4>
                    <p className="dark:text-gray-400 text-gray-600 text-sm">Your course ready in under 2 minutes</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <BookOpen className="w-8 h-8 dark:text-white text-gray-900 mx-auto mb-4" />
                    <h4 className="font-semibold dark:text-white text-gray-900 mb-2">Comprehensive Content</h4>
                    <p className="dark:text-gray-400 text-gray-600 text-sm">Structured lessons with videos and quizzes</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <Users className="w-8 h-8 dark:text-white text-gray-900 mx-auto mb-4" />
                    <h4 className="font-semibold dark:text-white text-gray-900 mb-2">Personalized Learning</h4>
                    <p className="dark:text-gray-400 text-gray-600 text-sm">Adapted to your skill level and goals</p>
                  </Card>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Generate;