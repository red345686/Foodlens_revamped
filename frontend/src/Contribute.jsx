import React, { useState } from 'react';
import NavBar from './components/NavBar';
import Footer from './Footer';
import { motion } from 'framer-motion';

const Contribute = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-b from-gray-50 to-white">
      <NavBar page='contribute' />
      <main className="flex-grow w-full">
        <div className="pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Contribute to FoodLens</h1>
              <p className="text-lg sm:text-xl text-gray-600">Share your insights, ideas, or images to improve our platform</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              
              {/* Image Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload an Image *</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Contribution Subject */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="Briefly describe your contribution"
                />
              </div>

              {/* Description */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="Provide detailed information about your contribution..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-[#294c25] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#1a3317] transition-colors shadow-lg hover:shadow-xl"
                >
                  Submit Contribution
                </motion.button>
              </div>
            </form>

            {/* Additional Information */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">Need help?</h3>
              <p className="text-gray-600">
                Contact us at {" "}
                <a href="mailto:support@foodlens.com" className="text-[#294c25] hover:text-[#1a3317] font-medium">
                  support@foodlens.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contribute;
