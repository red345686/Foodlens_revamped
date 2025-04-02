import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';
import NavBar from './components/NavBar';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "What is FoodLens?",
      answer: "FoodLens is an AI-powered platform that helps you identify food items, understand their nutritional content, and make informed decisions about your diet. Our technology can analyze food images and provide detailed information about ingredients, calories, and nutritional value."
    },
    {
      question: "How does the food recognition feature work?",
      answer: "Our food recognition feature uses advanced AI technology to analyze images of food. Simply upload a photo of your food, and our system will identify the items, provide nutritional information, and suggest similar alternatives if available."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All your personal information and food data are encrypted and stored securely. We never share your information with third parties without your explicit consent."
    },
    {
      question: "Can I track my daily nutrition?",
      answer: "Yes! FoodLens allows you to track your daily nutrition by logging your meals. You can view your nutritional intake, set goals, and monitor your progress over time."
    },
    {
      question: "How accurate is the nutritional information?",
      answer: "Our nutritional information is sourced from reliable databases and regularly updated. While we strive for accuracy, we recommend using this information as a general guide and consulting with healthcare professionals for specific dietary needs."
    },
    {
      question: "Can I contribute to the community?",
      answer: "Absolutely! We encourage users to share their experiences, recipes, and tips in our community section. You can also report issues with food recognition or suggest improvements to help make FoodLens better for everyone."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <NavBar page='faqs' />
      <main className="flex-grow bg-gray-50 w-full">
        <div className="pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Frequently Asked Questions</h1>
              <p className="text-base sm:text-lg text-gray-600">Find answers to common questions about FoodLens</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    className="w-full px-4 sm:px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="text-lg font-medium text-gray-900 pr-4">{faq.question}</span>
                    <span className="text-gray-500 text-xl flex-shrink-0">
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 sm:px-6 pb-4"
                      >
                        <p className="text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Still have questions? Contact our support team at{" "}
                <a href="mailto:support@foodlens.com" className="text-blue-600 hover:text-blue-800">
                  support@foodlens.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs; 