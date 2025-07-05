import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Trophy, TrendingUp, Play, Star, Users, Award, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';

const Dashboard = () => {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [courseHistory, setCourseHistory] = useState({ enrolled: [], completed: [] });
  const [continueLearning, setContinueLearning] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course history
        const historyRes = await fetch('/api/auth/history', {
          headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
        });
        const historyData = await historyRes.json();
        console.log('Dashboard: /api/auth/history response:', historyData);
        if (historyData.success) setCourseHistory(historyData.data);
        else console.error('Dashboard: /api/auth/history error:', historyData);

        // Fetch continue learning data
        const continueRes = await fetch('/api/auth/continue-learning', {
          headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
        });
        const continueData = await continueRes.json();
        console.log('Dashboard: /api/auth/continue-learning response:', continueData);
        if (continueData.success) setContinueLearning(continueData.data);
        else console.error('Dashboard: /api/auth/continue-learning error:', continueData);
      } catch (err) {
        console.error('Dashboard: fetch error:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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
  
  // Stats
  const stats = [
    {
      icon: BookOpen,
      label: 'Courses Completed',
      value: courseHistory.completed.length,
      change: '',
      color: 'dark:bg-white bg-gray-900',
    },
    {
      icon: Clock,
      label: 'Hours Learned',
      value: user.totalLearningHours || 0,
      change: '',
      color: 'dark:bg-white bg-gray-900',
    },
    {
      icon: Trophy,
      label: 'Certificates Earned',
      value: user.certificates?.length || 0,
      change: '',
      color: 'dark:bg-white bg-gray-900',
    },
    {
      icon: TrendingUp,
      label: 'Learning Streak',
      value: user.streak || 0,
      change: 'days in a row',
      color: 'dark:bg-white bg-gray-900',
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
                {loading ? <div>Loading...</div> :
                  continueLearning.length === 0 ? 
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No courses in progress. Start learning!</p>
                      <Link to="/generate">
                        <Button className="mt-4">Generate Your First Course</Button>
                      </Link>
                    </div> :
                  continueLearning.map((entry, index) => (
                    <motion.div
                      key={entry.course._id}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Card hover className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="relative">
                            <img src={entry.course.thumbnail} alt={entry.course.title} className="w-40 h-28 object-cover rounded-xl" />
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Lesson {entry.lastLessonIndex + 1} of {entry.totalLessons}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">{entry.course.title}</h3>
                            <div className="flex items-center text-sm mb-2">
                              <span className="mr-4">{entry.course.category}</span>
                              <span>{entry.course.estimatedDuration} min</span>
                              <span className="ml-4 text-gray-500">
                                Last accessed: {new Date(entry.lastAccessed).toLocaleDateString()}
                              </span>
                            </div>
                            <ProgressBar progress={entry.progress || 0} showPercentage size="sm" className="mb-2" />
                            <div className="flex items-center gap-2">
                              <Button as={Link} to={`/course/${entry.course._id}?lesson=${entry.lastLessonIndex}`} size="sm">
                                <Play className="w-4 h-4 mr-2" />
                                Continue Learning
                              </Button>
                              <Button variant="ghost" as={Link} to={`/course/${entry.course._id}`} size="sm">
                                <ArrowRight className="w-4 h-4 mr-2" />
                                View Course
                              </Button>
                              {entry.progress === 100 && <span className="text-green-600 font-semibold ml-2">Completed</span>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* Completed Courses */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Completed Courses</h2>
              {loading ? <div>Loading...</div> :
                courseHistory.completed.length === 0 ? <div>No completed courses yet.</div> :
                courseHistory.completed.map(course => (
                  <div key={course._id} className="mb-4">
                    <div className="flex items-center gap-3">
                      <img src={course.thumbnail} alt={course.title} className="w-16 h-12 object-cover rounded-lg" />
                      <div>
                        <div className="font-semibold dark:text-white text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500">{course.category} • {course.estimatedDuration} min</div>
                      </div>
                    </div>
                  </div>
                ))}
            </Card>
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