import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update document class for Tailwind dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Background colors
      background: {
        primary: isDarkMode ? 'from-black via-gray-900 to-gray-800' : 'from-gray-50 via-white to-gray-100',
        secondary: isDarkMode ? 'bg-black/50' : 'bg-white/80',
        card: isDarkMode ? 'bg-white/5' : 'bg-white/90',
        cardGradient: isDarkMode 
          ? 'from-white/20 via-white/10 to-white/5' 
          : 'from-gray-100/80 via-white/90 to-gray-50/80',
        header: isDarkMode ? 'bg-black/80' : 'bg-white/90',
      },
      // Text colors
      text: {
        primary: isDarkMode ? 'text-white' : 'text-gray-900',
        secondary: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        accent: isDarkMode ? 'text-white' : 'text-gray-900',
        muted: isDarkMode ? 'text-gray-500' : 'text-gray-500',
      },
      // Border colors
      border: {
        primary: isDarkMode ? 'border-white/10' : 'border-gray-200',
        secondary: isDarkMode ? 'border-white/20' : 'border-gray-300',
        focus: isDarkMode ? 'border-white/50' : 'border-gray-400',
      },
      // Button colors
      button: {
        primary: isDarkMode 
          ? 'bg-white text-black hover:bg-gray-100' 
          : 'bg-gray-900 text-white hover:bg-gray-800',
        secondary: isDarkMode 
          ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
        ghost: isDarkMode 
          ? 'hover:bg-white/10 text-gray-300 hover:text-white' 
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
      },
      // Progress bar colors
      progress: isDarkMode ? 'bg-white' : 'bg-gray-900',
      progressBg: isDarkMode ? 'bg-white/20' : 'bg-gray-200',
      // Icon colors
      icon: {
        primary: isDarkMode ? 'text-black' : 'text-white',
        secondary: isDarkMode ? 'text-white' : 'text-gray-900',
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};