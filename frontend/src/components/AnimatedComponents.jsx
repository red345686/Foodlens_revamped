import React from 'react';
import { motion } from 'framer-motion';
import * as animations from './animations';

// Animated container with various animation options
export const AnimatedContainer = ({ 
  children, 
  animation = "fadeIn", 
  delay = 0,
  className = "",
  ...props 
}) => {
  // Select the appropriate animation variant
  const getVariant = () => {
    switch (animation) {
      case "fadeIn": return animations.fadeIn;
      case "slideUp": return animations.slideUp;
      case "slideInLeft": return animations.slideInLeft;
      case "slideInRight": return animations.slideInRight;
      case "scaleUp": return animations.scaleUp;
      case "staggerContainer": return animations.staggerContainer;
      case "pageTransition": return animations.pageTransition;
      default: return animations.fadeIn;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={getVariant()}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated staggered list that animates children with a delay
export const AnimatedList = ({ children, className = "", ...props }) => {
  return (
    <motion.div
      variants={animations.staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          variants={animations.slideUp}
          key={index}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Animated item for list items, cards, etc.
export const AnimatedItem = ({ children, animation = "fadeIn", className = "", ...props }) => {
  const getVariant = () => {
    switch (animation) {
      case "fadeIn": return animations.fadeIn;
      case "slideUp": return animations.slideUp;
      case "slideInLeft": return animations.slideInLeft;
      case "slideInRight": return animations.slideInRight;
      case "scaleUp": return animations.scaleUp;
      default: return animations.fadeIn;
    }
  };

  return (
    <motion.div
      variants={getVariant()}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated button with hover and tap effects
export const AnimatedButton = ({ children, className = "", ...props }) => {
  return (
    <motion.button
      whileHover={animations.buttonHover}
      whileTap={animations.buttonTap}
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Animated card with hover effect
export const AnimatedCard = ({ children, className = "", ...props }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations.fadeIn}
      whileHover={animations.cardHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Loading spinner with pulse animation
export const LoadingSpinner = ({ size = 50, color = "#4f46e5", className = "", ...props }) => {
  return (
    <motion.div
      animate={animations.pulse}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
      }}
      className={className}
      {...props}
    />
  );
};

// Text that reveals character by character
export const AnimatedText = ({ text, className = "", ...props }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.04
      }
    }
  };
  
  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}; 