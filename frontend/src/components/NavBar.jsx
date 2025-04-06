import { CgProfile } from "react-icons/cg";
import { FaSignOutAlt } from "react-icons/fa";
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

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
  ];

  return (
    <header className={`w-full ${page === 'home' ? 'bg-transparent' : 'bg-[#294c25]'} backdrop-filter fixed top-0 z-50 ${page === 'home' ? 'backdrop-blur' : ''}`}>
      <nav className="container mx-auto px-4 sm:px-6 py-2">
        <div className={`flex items-center ${page === 'home' ? 'justify-end' : 'justify-between'}`}>
          <Link to='/' className={`flex items-center ${page === 'home' ? 'absolute left-6' : ''}`}>
            <img className="w-8 sm:w-10 rounded-lg" src="logo.png" alt="FoodLens Logo" />
            <span className='mx-2 text-xl sm:text-2xl text-white'>FoodLens</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10 font-sans text-base lg:text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                className={`${(page === link.page || page === 'home') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'
                  }`}
                to={link.path}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="relative flex items-center justify-center">
                <button
                  onClick={toggleProfile}
                  className="flex items-center justify-center text-white hover:text-gray-200"
                >
                  <CgProfile className="w-10 h-10" />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-[#1a3317] transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
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
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
        >
          <div className="py-2 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                className={`block px-4 py-2 rounded-lg ${(page === link.page)
                  ? 'text-white bg-[#1a3317]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a3317] transition-colors'
                  }`}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a3317] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a3317] transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
