import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function NavBar({ page }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const font = {
    fontFamily: "Zen Kaku Gothic Antique"
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { path: '/products', label: 'Products', page: 'products' },
    { path: '/blogs', label: 'Blog', page: 'blogs' },
    { path: '/community', label: 'Community', page: 'community' },
    { path: '/about', label: 'About', page: 'about' },
    { path: '/report', label: 'Report', page: 'report' },
  ];

  return (
    <header className={`w-full ${ page === 'home' ? 'bg-transparent' : 'bg-[#294c25]'} backdrop-filter fixed top-0 z-50 ${page === 'home' ? 'backdrop-blur' : ''}`}>
      <nav className="container mx-auto px-4 sm:px-6 py-2">
        <div className={`flex items-center justify-between ${ page === 'home' ? 'xl:mr-80' : ''}`}>
          <Link to='/' className='flex items-center'>
            <img className="w-8 sm:w-10 rounded-lg" src="logo.png" alt="FoodLens Logo" />
            <span className='mx-2 text-xl sm:text-2xl text-white'>FoodLens</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 lg:space-x-10 font-sans text-base lg:text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                className={`${
                  (page === link.page || page === 'home')? 'text-white' : 'text-gray-400 hover:text-white transition-colors'
                }`}
                to={link.path}
              >
                {link.label}
              </Link>
            ))}
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
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="py-2 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                className={`block px-4 py-2 rounded-lg ${
                  (page === link.page)
                    ? 'text-white bg-[#1a3317]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a3317] transition-colors'
                }`}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
