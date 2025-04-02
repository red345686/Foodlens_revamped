import React, { useState } from 'react'
import NavBar from './NavBar'
import Footer from '../Footer'
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { motion } from 'framer-motion';

const Report = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reportType: 'bug',
    title: '',
    description: '',
    attachment: null
  });

  const [selectedType, setSelectedType] = useState('bug');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      reportType: type
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  const reportTypes = [
    { id: 'bug', label: 'Bug Report', icon: <BugReportIcon className="w-6 h-6" />, description: 'Report technical issues or errors' },
    { id: 'feature', label: 'Feature Request', icon: <LightbulbIcon className="w-6 h-6" />, description: 'Suggest new features or improvements' },
    { id: 'improvement', label: 'Improvement', icon: <HelpOutlineIcon className="w-6 h-6" />, description: 'Suggest improvements to existing features' },
    { id: 'other', label: 'Other', icon: <PriorityHighIcon className="w-6 h-6" />, description: 'Other types of feedback or reports' }
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-b from-gray-50 to-white">
      <NavBar page='report' />
      <main className="flex-grow w-full">
        <div className="pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Submit a Report</h1>
              <p className="text-lg sm:text-xl text-gray-600">Help us improve FoodLens by reporting issues or suggesting improvements</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              {/* Report Type Selection */}
              <div className="mb-12">
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  What type of report would you like to submit?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reportTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedType === type.id
                          ? 'border-[#294c25] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${
                          selectedType === type.id ? 'text-[#294c25]' : 'text-gray-500'
                        }`}>
                          {type.icon}
                        </div>
                        <div className="text-left">
                          <h3 className={`font-medium ${
                            selectedType === type.id ? 'text-[#294c25]' : 'text-gray-900'
                          }`}>
                            {type.label}
                          </h3>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Report Title */}
              <div className="mb-8">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Brief description of your report"
                />
              </div>

              {/* Description */}
              <div className="mb-8">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Please provide detailed information about your report..."
                />
              </div>

              {/* Attachment */}
              <div className="mb-8">
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="attachment"
                        className="relative cursor-pointer rounded-md font-medium text-[#294c25] hover:text-[#1a3317] focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2"
                      >
                        <span>Upload a file</span>
                        <input
                          id="attachment"
                          name="attachment"
                          type="file"
                          onChange={handleChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-[#294c25] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#1a3317] transition-colors shadow-lg hover:shadow-xl"
                >
                  Submit Report
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Need immediate assistance?</h3>
              <p className="text-gray-600">
                For urgent issues, please contact our support team at{" "}
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

export default Report;
