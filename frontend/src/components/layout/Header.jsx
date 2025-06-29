import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import UserMenu from '../auth/UserMenu';
import AuthModal from '../auth/AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const location = useLocation();
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/generate', label: 'Generate' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md dark:bg-black/80 bg-white/90 dark:border-white/10 border-gray-200 border-b transition-colors duration-300"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-xl dark:bg-white bg-gray-900">
                <Brain className="h-6 w-6 dark:text-black text-white" />
              </div>
              <span className="text-xl font-bold dark:text-white text-gray-900">
                LearnGenAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'dark:text-white text-gray-900 dark:bg-white/10 bg-gray-100'
                      : 'dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 dark:bg-white/10 bg-gray-100 rounded-lg dark:border-white/20 border-gray-300 border"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal('signin')}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => openAuthModal('signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 dark:text-white text-gray-900" />
                ) : (
                  <Menu className="h-5 w-5 dark:text-white text-gray-900" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <motion.nav
            initial={false}
            animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'dark:text-white text-gray-900 dark:bg-white/10 bg-gray-100'
                      : 'dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAuthModal('signin');
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAuthModal('signup');
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.nav>
        </div>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;