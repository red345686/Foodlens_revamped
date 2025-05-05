import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './components/NavBar'
import { useAuth } from './AuthContext'
import { motion } from 'framer-motion'
import { AnimatedText } from './components/AnimatedComponents'

const Home = () => {
  const { user } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 10,
        delay: 1.2
      }
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#e11d48",
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.5 }
    }
  };

  return (
    <>
      <NavBar page='home' />
      <motion.div 
        className="bg-[url('HomeBackground.png')] bg-cover bg-center fixed h-screen w-[100vw]"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      />
      <motion.div 
        className='fixed w-auto bg-transparent lg:p-10 ml-[10vw] mr-[10vw] sm:mr-[30vw] md:mr-[50vw] h-screen flex flex-col justify-center text-center'
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className='sm:w-auto text-center mt-[10vh] text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-10 text-white font-bold'
          variants={itemVariants}
        >
          <AnimatedText text="FoodLens" />
        </motion.div>
        
        <motion.div 
          className='sm:w-auto pr-[10vw] sm:pr-0 text-xl md:text-2xl lg:text-3xl text-white font-normal font-sans'
          variants={itemVariants}
        >
          FoodLens is your go-to platform for understanding the ingredients in your food. Empower yourself to eat smarter with FoodLens!
        </motion.div>
        
        <motion.div 
          className='flex flex-col sm:flex-row sm:justify-evenly mt-10'
          variants={containerVariants}
        >
          {!user && (
            <motion.div 
              className='sm:w-auto text-center text-lg sm:text-xl md:text-2xl my-2 lg:text-3xl text-white px-3 md:px-5 lg:px-8 py-2 md:py-3 lg:py-4 bg-red-600 rounded-2xl lg:rounded-3xl'
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link to='/login'>LOGIN</Link>
            </motion.div>
          )}
          <motion.div 
            className='sm:w-auto text-center text-lg sm:text-xl md:text-2xl my-2 lg:text-3xl text-white px-3 md:px-5 lg:px-8 py-2 md:py-3 lg:py-4 bg-red-600 rounded-2xl lg:rounded-3xl'
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link to='/explore'>EXPLORE</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}

export default Home
