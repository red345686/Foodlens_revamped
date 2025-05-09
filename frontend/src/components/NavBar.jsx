import { CgProfile } from "react-icons/cg";
import { FaSignOutAlt } from "react-icons/fa";
import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { motion, AnimatePresence } from 'framer-motion';
import { buttonHover, buttonTap } from './animations';
import logo from '../assets/logo.png';

function NavBar({ page }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const navLinks = [
    { path: '/products', label: 'Products', page: 'products' },
    { path: '/blogs', label: 'Blog', page: 'blogs' },
    { path: '/community', label: 'Community', page: 'community' },
    { path: '/about', label: 'About', page: 'about' },
    { path: '/report', label: 'Report', page: 'report' },
    { path: '/contact', label: 'Contact', page: 'contact' },
  ];

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren"
      }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  // Memoize the profile button to prevent flickering
  const profileButton = useMemo(() => {
    if (!user) return null;

    return (
      <motion.div
        className="relative flex items-center justify-center"
        variants={linkVariants}
      >
        <motion.button
          onClick={toggleProfile}
          className="flex items-center justify-center text-white hover:text-gray-200"
          whileHover={buttonHover}
          whileTap={buttonTap}
        >
          <CgProfile className="w-10 h-10" />
        </motion.button>
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dropdownVariants}
            >
              <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                <Link
                  to="/Profile"
                  className="block px-4 py-2 text-sm text-gray-700"
                  onClick={() => setIsProfileOpen(false)}
                >
                  My Profile
                </Link>
              </motion.div>
              <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700"
                >
                  Sign Out
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [user, isProfileOpen, toggleProfile, handleLogout, buttonHover, buttonTap, linkVariants, dropdownVariants]);

  return (
    <motion.header
      className={`w-full ${page === 'home' ? 'bg-transparent' : 'bg-[#294c25]'} backdrop-filter fixed top-0 z-50 ${page === 'home' ? 'backdrop-blur' : ''}`}
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <nav className="container mx-auto px-4 sm:px-6 py-2">
        <div className={`flex items-center ${page === 'home' ? 'justify-end' : 'justify-between'}`}>
          <motion.div variants={logoVariants}>
            <Link to='/' className={`flex items-center ${page === 'home' ? 'absolute left-6' : ''}`}>
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 sm:w-10 rounded-lg"
                src={logo}
                alt="FoodLens Logo"
              />
              <motion.span
                className='mx-2 text-xl sm:text-2xl text-white'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                FoodLens
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10 font-sans text-base lg:text-lg">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                variants={linkVariants}
                custom={index}
                whileHover={{ y: -2 }}
              >
                <Link
                  className={`${(page === link.page || page === 'home') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'
                    }`}
                  to={link.path}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            {profileButton}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white p-2 rounded-lg hover:bg-[#1a3317] transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
            >
              <div className="py-2 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    variants={linkVariants}
                    custom={index}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      className={`block px-4 py-2 rounded-lg ${(page === link.page)
                        ? 'text-white bg-[#1a3317]'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a3317] transition-colors'
                        }`}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {user && (
                  <>
                    <motion.div
                      variants={linkVariants}
                      whileHover={{ x: 5 }}
                    >
                      <Link
                        to="/Profile"
                        className="block px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a3317] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                    </motion.div>
                    <motion.div
                      variants={linkVariants}
                      whileHover={{ x: 5 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a3317] transition-colors"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

export default React.memo(NavBar);
