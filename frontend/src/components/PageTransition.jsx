import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from './animations';

// This component wraps around page content to add consistent page transitions
const PageTransition = ({ children, className = "", ...props }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 