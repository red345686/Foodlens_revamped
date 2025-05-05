import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 40, 
  color = "#294c25", 
  secondaryColor = "#f3f4f6",
  thickness = 4,
  speed = 1.5,
  ...props 
}) => {
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: speed,
  };

  // Circle path animation
  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.3 }
      }
    }
  };

  // Container animation
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: spinTransition
    }
  };

  return (
    <div className="flex items-center justify-center" {...props}>
      <motion.div
        animate="animate"
        variants={containerVariants}
        style={{ width: size, height: size }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 50 50"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Background circle */}
          <motion.circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={secondaryColor}
            strokeWidth={thickness}
          />
          
          {/* Animated spinner circle */}
          <motion.circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={circleVariants}
            style={{ 
              pathLength: 0.8,
              rotate: -90,
              transformOrigin: "center"
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

// Pulse loading dots animation
export const LoadingDots = ({ color = "#294c25", size = 8, gap = 6, ...props }) => {
  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.6 },
    animate: (i) => ({
      scale: [0.8, 1.2, 0.8],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "loop",
        delay: i * 0.15
      }
    })
  };

  return (
    <div className="flex items-center justify-center" style={{ gap: `${gap}px` }} {...props}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color
          }}
          initial="initial"
          animate="animate"
          variants={dotVariants}
          custom={i}
        />
      ))}
    </div>
  );
};

// Loading text that animates letter by letter
export const LoadingText = ({ text = "Loading", color = "#294c25", ...props }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        repeatType: "loop",
        repeat: Infinity,
        duration: 1.5
      }
    }
  };
  
  const child = {
    hidden: { opacity: 0.2, y: 0 },
    visible: {
      opacity: 1,
      y: [0, -4, 0],
      transition: { 
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };
  
  return (
    <motion.div
      style={{ display: "flex", color }}
      variants={container}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} style={{ display: "inline-block" }}>
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default LoadingSpinner; 