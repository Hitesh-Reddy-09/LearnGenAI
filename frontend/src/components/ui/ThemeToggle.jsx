import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
          : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
      }`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDarkMode ? 0 : 180,
          scale: isDarkMode ? 1 : 0.8,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-5 h-5"
      >
        {isDarkMode ? (
          <Moon className="w-5 h-5 text-white absolute inset-0" />
        ) : (
          <Sun className="w-5 h-5 text-gray-900 absolute inset-0" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;