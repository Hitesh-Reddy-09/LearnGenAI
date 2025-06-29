import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Award, BookOpen, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 transition-colors"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium dark:text-white text-gray-900">
            {user.name}
          </p>
          <p className="text-xs dark:text-gray-400 text-gray-600">
            {user.email}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 dark:text-white text-gray-900 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 dark:bg-white/10 bg-white backdrop-blur-xl dark:border-white/20 border-gray-200 border rounded-xl shadow-2xl z-50"
            >
              {/* User Info */}
              <div className="p-4 dark:border-white/10 border-gray-200 border-b">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium dark:text-white text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-sm dark:text-gray-400 text-gray-600">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg dark:hover:bg-white/10 hover:bg-gray-100 transition-colors group"
                >
                  <BookOpen className="w-5 h-5 dark:text-gray-400 text-gray-600 group-hover:dark:text-white group-hover:text-gray-900" />
                  <span className="dark:text-white text-gray-900">Dashboard</span>
                </Link>

                <button className="flex items-center space-x-3 w-full p-3 rounded-lg dark:hover:bg-white/10 hover:bg-gray-100 transition-colors group">
                  <User className="w-5 h-5 dark:text-gray-400 text-gray-600 group-hover:dark:text-white group-hover:text-gray-900" />
                  <span className="dark:text-white text-gray-900">Profile</span>
                </button>

                <button className="flex items-center space-x-3 w-full p-3 rounded-lg dark:hover:bg-white/10 hover:bg-gray-100 transition-colors group">
                  <Award className="w-5 h-5 dark:text-gray-400 text-gray-600 group-hover:dark:text-white group-hover:text-gray-900" />
                  <span className="dark:text-white text-gray-900">Certificates</span>
                </button>

                <button className="flex items-center space-x-3 w-full p-3 rounded-lg dark:hover:bg-white/10 hover:bg-gray-100 transition-colors group">
                  <Settings className="w-5 h-5 dark:text-gray-400 text-gray-600 group-hover:dark:text-white group-hover:text-gray-900" />
                  <span className="dark:text-white text-gray-900">Settings</span>
                </button>

                <div className="my-2 dark:border-white/10 border-gray-200 border-t" />

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg dark:hover:bg-red-500/20 hover:bg-red-50 transition-colors group"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-red-500">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;