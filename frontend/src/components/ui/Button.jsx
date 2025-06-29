import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}) => {
  const { colors } = useTheme();
  
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-white/50 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'dark:bg-white dark:text-black dark:hover:bg-gray-100 bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl',
    secondary: 'dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 border backdrop-blur-sm',
    ghost: 'dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 text-gray-600 hover:text-gray-900',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </motion.button>
  );
};

export default Button;