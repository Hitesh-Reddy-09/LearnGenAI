import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const ProgressBar = ({
  progress,
  className = '',
  showPercentage = false,
  size = 'md',
  gradient = true,
}) => {
  const { colors } = useTheme();
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const progressClasses = gradient
    ? 'dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700'
    : 'dark:bg-white bg-gray-900';

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full dark:bg-white/20 bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className={`h-full rounded-full ${progressClasses}`}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-right">
          <span className="text-sm dark:text-gray-400 text-gray-600">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;