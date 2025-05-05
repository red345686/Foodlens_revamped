import React from 'react';
import { motion } from 'framer-motion';

// Modern animated button with ripple effect
const AnimatedButton = ({
  children,
  className = "",
  color = "primary",
  size = "md",
  disabled = false,
  onClick,
  ...props
}) => {
  // Base style classes
  const baseClasses = "relative overflow-hidden rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  // Color classes
  const colorClasses = {
    primary: "bg-[#294c25] text-white hover:bg-[#1a3317] focus:ring-[#294c25]",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    accent: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "bg-transparent border-2 border-[#294c25] text-[#294c25] hover:bg-[#294c25] hover:text-white focus:ring-[#294c25]",
  };
  
  // Disabled classes
  const disabledClasses = "opacity-50 cursor-not-allowed";
  
  // Combine classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${colorClasses[color]} 
    ${disabled ? disabledClasses : ""}
    ${className}
  `;

  // Animation variants
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.button
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;

// Floating action button with animations
export const FloatingActionButton = ({ 
  children, 
  onClick, 
  color = "#294c25",
  size = 56,
  bottom = 32,
  right = 32,
  ...props 
}) => {
  return (
    <motion.button
      className="fixed rounded-full shadow-lg flex items-center justify-center z-50"
      style={{
        bottom,
        right,
        width: size,
        height: size,
        backgroundColor: color,
      }}
      onClick={onClick}
      whileHover={{ 
        scale: 1.1, 
        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)" 
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Icon button with tooltip
export const IconButton = ({ 
  icon, 
  tooltip,
  onClick,
  color = "#294c25",
  size = 40,
  className = "",
  ...props 
}) => {
  return (
    <motion.div className="relative inline-block" {...props}>
      <motion.button
        className={`flex items-center justify-center rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: 'transparent',
          color: color
        }}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {icon}
      </motion.button>
      
      {tooltip && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 pointer-events-none"
          initial={{ opacity: 0, y: -5 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tooltip}
        </motion.div>
      )}
    </motion.div>
  );
}; 