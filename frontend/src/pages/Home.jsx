import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Video, Users, BookOpen, Zap, Star, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home = () => {
  const { colors } = useTheme();
  
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Create comprehensive courses in seconds using advanced AI technology.',
    },
    {
      icon: Video,
      title: 'Interactive Videos',
      description: 'Engaging video content with interactive elements and progress tracking.',
    },
    {
      icon: BookOpen,
      title: 'Smart Quizzes',
      description: 'Auto-generated quizzes that adapt to your learning progress.',
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Connect with learners worldwide and share your knowledge.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Developer',
      content: 'LearnGenAI helped me master React in just two weeks. The AI-generated courses are incredibly comprehensive!',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Data Scientist',
      content: 'The interactive quizzes and progress tracking kept me motivated throughout my machine learning journey.',
      rating: 5,
    },
    {
      name: 'Emily Thompson',
      role: 'UX Designer',
      content: 'I love how the AI adapts the content to my learning style. Best educational platform I\'ve ever used!',
      rating: 5,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 dark:bg-white/10 bg-gray-900/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 dark:bg-white/5 bg-gray-900/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 dark:bg-white/20 bg-gray-900/20 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="dark:text-white text-gray-900">
                Learn
              </span>
              <span className="dark:text-gray-400 text-gray-600">Gen</span>
              <span className="dark:text-white text-gray-900">
                AI
              </span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl dark:text-gray-300 text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Transform any topic into a comprehensive, interactive course using the power of AI. 
              Learn faster, retain more, and achieve your goals with personalized education.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/generate">
                <Button size="lg" className="group">
                  <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Generate Your Course
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white text-gray-900">
              Powerful Features
            </h2>
            <p className="text-xl dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">
              Everything you need to create and consume world-class educational content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-8 text-center h-full">
                  <div className="p-4 dark:bg-white bg-gray-900 rounded-2xl w-fit mx-auto mb-6">
                    <feature.icon className="h-8 w-8 dark:text-black text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 dark:text-white text-gray-900">{feature.title}</h3>
                  <p className="dark:text-gray-400 text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white text-gray-900">
              What Learners Say
            </h2>
            <p className="text-xl dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">
              Join thousands of learners who've transformed their careers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 dark:fill-white dark:text-white fill-gray-900 text-gray-900" />
                    ))}
                  </div>
                  <p className="dark:text-gray-300 text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <h4 className="font-semibold dark:text-white text-gray-900">{testimonial.name}</h4>
                    <p className="dark:text-gray-400 text-gray-600">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Card gradient className="p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white text-gray-900">
                Ready to Start Learning?
              </h2>
              <p className="text-xl dark:text-gray-300 text-gray-700 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already using AI to accelerate their education.
                Generate your first course in less than a minute.
              </p>
              <Link to="/generate">
                <Button size="lg" className="group">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;