import React from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GoogleIcon from "@mui/icons-material/Google";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = React.useState("");
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="relative">
      {/* Slanted background */}
      <div className="absolute w-full h-16 bg-[#294c25] transform rotate-3 translate-y-6 -z-10"></div>

      {/* Main footer */}
      <footer className="bg-[#294c25] pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo and social */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex flex-col items-center md:items-start">
                <img
                  src="logo.png"
                  alt="FoodLens Logo"
                  className="h-20 w-20 sm:h-24 sm:w-24"
                />
                <h1 className="text-3xl text-white font-serif mt-3 mb-4">
                  FoodLens
                </h1>
              </div>
              <div className="flex space-x-4 mb-4">
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <GoogleIcon fontSize="large" />
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <GitHubIcon fontSize="large" />
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-discord" viewBox="0 0 16 16">
  <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
</svg>
                </a>
              </div>
              <button className="bg-white text-[#294c25] py-2 px-8 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                Contact Us
              </button>
            </div>

            {/* Product links */}
            <div className="text-center md:text-left">
              <h2 className="text-white text-xl font-medium mb-4">Product</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/products"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Know your Food
                  </Link>
                </li>
                <li>
                  <Link
                    to="/community"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Community Forum
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blogs"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/report"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Report
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company links */}
            <div className="text-center md:text-left">
              <h2 className="text-white text-xl font-medium mb-4">Company</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faqs"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/team"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Teams
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Subscribe section */}
            <div className="text-center md:text-left">
              <h2 className="text-white text-xl font-medium mb-4">Subscribe</h2>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to stay tuned for latest food updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  className="flex-grow px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="bg-white text-[#294c25] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-600 my-8"></div>

          {/* Bottom footer */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 FoodLens. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
              <Link to="/sales" className="hover:text-white transition-colors">
                Sales and Refund
              </Link>
              <Link to="/legal" className="hover:text-white transition-colors">
                Legal
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-white transition-colors"
              >
                Site Map
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
