import React from 'react';
import NavBar from './components/NavBar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaLeaf, FaUsers, FaHandsHelping, FaShieldAlt, FaGlobeAmericas } from 'react-icons/fa';

const About = () => {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const values = [
    {
      icon: <FaLeaf className="w-10 h-10 text-green-600" />,
      title: "Sustainability",
      description: "We are committed to promoting sustainable food choices that benefit both personal health and the planet."
    },
    {
      icon: <FaUsers className="w-10 h-10 text-green-600" />,
      title: "Community",
      description: "We believe in building a supportive community where users can share knowledge and experiences about food."
    },
    {
      icon: <FaHandsHelping className="w-10 h-10 text-green-600" />,
      title: "Accessibility",
      description: "We strive to make food information accessible to everyone, regardless of background or knowledge level."
    },
    {
      icon: <FaShieldAlt className="w-10 h-10 text-green-600" />,
      title: "Transparency",
      description: "We are dedicated to providing transparent and accurate information about food ingredients and their effects."
    },
    {
      icon: <FaGlobeAmericas className="w-10 h-10 text-green-600" />,
      title: "Global Impact",
      description: "We aim to make a positive global impact by helping people make informed food choices worldwide."
    }
  ];

  const achievementData = [
    { number: "50K+", description: "Scanned Products" },
    { number: "10K+", description: "Active Users" },
    { number: "95%", description: "Accuracy Rate" },
    { number: "15+", description: "Food Categories" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar page="about" />
      
      {/* Hero Section */}
      <motion.section 
        className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#294c25] mb-6"
            variants={itemVariants}
          >
            About FoodLens
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Empowering you to make informed food choices through technology and community.
          </motion.p>
        </div>
      </motion.section>
      
      {/* Mission & Vision Section */}
      <motion.section 
        className="py-16 bg-gradient-to-br from-green-50 to-green-100"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={pageVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="order-2 md:order-1"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold text-[#294c25] mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                At FoodLens, our mission is to empower people with the knowledge they need to make informed food choices. We believe that understanding what goes into your food is the first step toward better health and well-being.
              </p>
              <p className="text-gray-600">
                We're dedicated to making food transparency accessible to everyone through innovative technology, reliable information, and a supportive community platform.
              </p>
            </motion.div>
            <motion.div 
              className="order-1 md:order-2 flex justify-center"
              variants={itemVariants}
            >
              <img 
                src="HomeBackground.png" 
                alt="FoodLens Mission" 
                className="rounded-xl shadow-xl max-w-full h-auto max-h-80 object-cover" 
              />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
            <motion.div 
              className="flex justify-center"
              variants={itemVariants}
            >
              <img 
                src="ProductSample.jpg" 
                alt="FoodLens Vision" 
                className="rounded-xl shadow-xl max-w-full h-auto max-h-80 object-cover" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold text-[#294c25] mb-6">Our Vision</h2>
              <p className="text-gray-600 mb-6">
                We envision a world where everyone has the power to make food choices that positively impact their health and the environment. A world where food transparency is the norm rather than the exception.
              </p>
              <p className="text-gray-600">
                Through FoodLens, we aim to create a global movement toward more conscious consumption, where consumers are equipped with the knowledge to demand better products and producers are motivated to provide them.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Our Values Section */}
      <motion.section 
        className="py-16 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={pageVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold text-[#294c25] mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at FoodLens, from product development to community engagement.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-green-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#294c25] mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* Our Journey Section */}
      <motion.section 
        className="py-16 bg-gradient-to-br from-green-100 to-green-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={pageVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold text-[#294c25] mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              FoodLens has evolved from a simple idea to a comprehensive platform dedicated to food transparency.
            </p>
          </motion.div>
          
          <motion.div 
            className="relative pl-8 sm:pl-32 py-6 group"
            variants={itemVariants}
          >
            <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-12 before:h-full before:px-px before:bg-green-300 sm:before:ml-0 before:ml-2 before:top-8 before:bottom-0">
              <div className="absolute left-0 sm:left-0 sm:ml-8 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-green-500 text-green-600 font-bold">1</div>
              <div className="sm:ml-8">
                <div className="flex flex-col sm:flex-row items-start mb-1">
                  <div className="bg-green-100 rounded-lg px-4 py-2 shadow-md">
                    <h3 className="text-xl font-bold text-green-800">The Beginning</h3>
                    <p className="text-gray-600">
                      FoodLens started as a student project at Indian Institute of Technology Patna, with the goal of creating a simple app to identify food ingredients.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative pl-8 sm:pl-32 py-6 group">
              <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-12 before:h-full before:px-px before:bg-green-300 sm:before:ml-0 before:ml-2 before:top-8 before:bottom-0">
                <div className="absolute left-0 sm:left-0 sm:ml-8 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-green-500 text-green-600 font-bold">2</div>
                <div className="sm:ml-8">
                  <div className="flex flex-col sm:flex-row items-start mb-1">
                    <div className="bg-green-100 rounded-lg px-4 py-2 shadow-md">
                      <h3 className="text-xl font-bold text-green-800">Growth & Development</h3>
                      <p className="text-gray-600">
                        As interest grew, we expanded our team and capabilities, building a comprehensive database of food products and ingredients.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative pl-8 sm:pl-32 py-6 group">
              <div className="flex flex-col sm:flex-row items-start mb-1">
                <div className="absolute left-0 sm:left-0 sm:ml-8 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-green-500 text-green-600 font-bold">3</div>
                <div className="sm:ml-8">
                  <div className="flex flex-col sm:flex-row items-start mb-1">
                    <div className="bg-green-100 rounded-lg px-4 py-2 shadow-md">
                      <h3 className="text-xl font-bold text-green-800">Today & Beyond</h3>
                      <p className="text-gray-600">
                        Today, FoodLens is a community-driven platform that combines technology, education, and social engagement to empower conscious food choices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Achievements Section */}
      <motion.section 
        className="py-16 bg-[#294c25] text-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={pageVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="max-w-3xl mx-auto text-green-100">
              Numbers that showcase our growing impact in the food transparency movement.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievementData.map((item, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{item.number}</div>
                <p className="text-green-200">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* Team Section Preview */}
      <motion.section 
        className="py-16 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={pageVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold text-[#294c25] mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              FoodLens is powered by a passionate team of developers, designers, and food enthusiasts dedicated to our mission.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex justify-center"
            variants={itemVariants}
          >
            <Link to="/teams">
              <motion.button 
                className="bg-[#294c25] text-white py-3 px-8 rounded-full font-medium shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05, backgroundColor: "#1a3317" }}
                whileTap={{ scale: 0.95 }}
              >
                View Our Team
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Join Us Section */}
      <motion.section 
        className="py-16 bg-gradient-to-r from-green-100 to-green-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={pageVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <motion.div 
              className="text-center mb-8"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold text-[#294c25] mb-4">Join Our Mission</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Be part of the food transparency movement. Together, we can build a healthier future.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-6"
              variants={itemVariants}
            >
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#294c25] mb-3">Explore Products</h3>
                <p className="text-gray-600 mb-4">Search our database of food products to learn more about what you're eating.</p>
                <Link to="/products">
                  <motion.button 
                    className="text-[#294c25] font-medium flex items-center"
                    whileHover={{ x: 5 }}
                  >
                    Learn More 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </Link>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#294c25] mb-3">Join Community</h3>
                <p className="text-gray-600 mb-4">Connect with like-minded individuals passionate about food transparency.</p>
                <Link to="/community">
                  <motion.button 
                    className="text-[#294c25] font-medium flex items-center"
                    whileHover={{ x: 5 }}
                  >
                    Learn More 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </Link>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#294c25] mb-3">Contribute</h3>
                <p className="text-gray-600 mb-4">Help us expand our database by contributing product information.</p>
                <Link to="/contribute">
                  <motion.button 
                    className="text-[#294c25] font-medium flex items-center"
                    whileHover={{ x: 5 }}
                  >
                    Learn More 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      <Footer />
    </div>
  );
};

export default About;
