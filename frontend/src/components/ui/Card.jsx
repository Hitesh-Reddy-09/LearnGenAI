import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  gradient = false 
}) => {
  const { colors } = useTheme();
  
  const baseClasses = gradient
    ? 'backdrop-blur-xl dark:bg-gradient-to-br dark:from-white/20 dark:via-white/10 dark:to-white/5 bg-gradient-to-br from-gray-100/80 via-white/90 to-gray-50/80 dark:border-white/20 border-gray-200 border rounded-2xl shadow-2xl'
    : 'backdrop-blur-xl dark:bg-white/5 bg-white/90 dark:border-white/10 border-gray-200 border rounded-2xl shadow-2xl';

  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${baseClasses} ${className} transition-colors duration-300`}
    >
      {children}
    </motion.div>
  );
};

export default Card;