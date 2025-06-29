import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Trophy, TrendingUp, Play, Star, Users, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';

const Dashboard = () => {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 min-h-screen flex items-center justify-center"
      >
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">
            Access Restricted
          </h2>
          <p className="dark:text-gray-400 text-gray-600 mb-6">
            Please sign in to access your dashboard.
          </p>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </Card>
      </motion.div>
    );
  }
  
  const stats = [
    {
      icon: BookOpen,
      label: 'Courses Completed',
      value: user.stats?.coursesCompleted || 0,
      change: '+3 this month',
      color: 'dark:bg-white bg-gray-900',
    },
    {
      icon: Clock,
      label: 'Hours Learned',
      value: user.stats?.hoursLearned || 0,
      change: '+12 this week',
      color: 'dark:bg-white bg-gray-900',
    },
    {
      icon: Trophy,
      label: 'Certificates Earned',
      value: user.stats?.certificatesEarned || 0,
      change: '+2 this month',
      color: 'dark:bg-white bg-gray-900',
    },
    {
      icon: TrendingUp,
      label: 'Learning Streak',
      value: user.stats?.learningStreak || 0,
      change: 'days in a row',
      color: 'dark:bg-white bg-gray-900',
    },
  ];

  const recentCourses = [
    {
      id: 1,
      title: 'React Hooks & State Management',
      instructor: 'AI Learning Assistant',
      progress: 75,
      thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '4.5 hours',
      rating: 4.9,
    },
    {
      id: 2,
      title: 'Python Data Structures & Algorithms',
      instructor: 'AI Learning Assistant',
      progress: 45,
      thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '6.2 hours',
      rating: 4.8,
    },
    {
      id: 3,
      title: 'Machine Learning Fundamentals',
      instructor: 'AI Learning Assistant',
      progress: 20,
      thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '8.1 hours',
      rating: 4.9,
    },
  ];

  const achievements = [
    {
      title: 'Quick Learner',
      description: 'Completed 5 courses in one month',
      icon: TrendingUp,
      earned: true,
    },
    {
      title: 'Consistent Student',
      description: 'Maintained a 7-day learning streak',
      icon: Trophy,
      earned: true,
    },
    {
      title: 'Tech Explorer',
      description: 'Learned 3 different programming languages',
      icon: Award,
      earned: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 min-h-screen"
    >
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl dark:text-gray-400 text-gray-600">
            Continue your learning journey and achieve your goals.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 dark:text-black text-white" />
                  </div>
                  <span className="text-3xl font-bold dark:text-white text-gray-900">
                    {stat.value}
                  </span>
                </div>
                <h3 className="font-medium dark:text-gray-300 text-gray-700 mb-1">{stat.label}</h3>
                <p className="text-sm dark:text-white text-gray-900">{stat.change}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold dark:text-white text-gray-900">Continue Learning</h2>
                <Link to="/generate">
                  <Button size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    New Course
                  </Button>
                </Link>
              </div>

              <div className="space-y-6">
                {recentCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card hover className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full md:w-48 h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-1">
                                {course.title}
                              </h3>
                              <p className="dark:text-gray-400 text-gray-600">{course.instructor}</p>
                            </div>
                            <div className="flex items-center dark:text-white text-gray-900">
                              <Star className="w-4 h-4 fill-current mr-1" />
                              <span className="text-sm">{course.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm dark:text-gray-400 text-gray-600 mb-4">
                            <Clock className="w-4 h-4 mr-2" />
                            {course.duration}
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm dark:text-gray-400 text-gray-600">Progress</span>
                              <span className="text-sm dark:text-white text-gray-900">{course.progress}% complete</span>
                            </div>
                            <ProgressBar progress={course.progress} />
                          </div>
                          
                          <Link to={`/course/${course.id}`}>
                            <Button size="sm">
                              Continue Learning
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Achievements */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">Achievements</h2>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <Card key={achievement.title} className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        achievement.earned 
                          ? 'dark:bg-white bg-gray-900' 
                          : 'bg-gray-600'
                      }`}>
                        <achievement.icon className={`h-5 w-5 ${
                          achievement.earned ? 'dark:text-black text-white' : 'text-white'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.earned ? 'dark:text-white text-gray-900' : 'dark:text-gray-400 text-gray-600'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className="text-sm dark:text-gray-400 text-gray-600">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <Trophy className="h-5 w-5 dark:text-white text-gray-900" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Quick Actions */}
              <Card className="p-6 mt-8">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/generate" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-3" />
                      Generate New Course
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-3" />
                    Join Study Group
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-3" />
                    View Certificates
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;