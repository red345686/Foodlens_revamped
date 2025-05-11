import React, { useEffect, useState } from 'react'
import Footer from './Footer'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import NavBar from './components/NavBar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [current, setCurrent] = useState(8);
  const formatDate = dateStr => new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).replace(/,/g, '');

  useEffect(() => {
    console.log(BACKEND_URL)
    fetch(`${BACKEND_URL}/allnews`)
      .then(response => response.json())
      .then(data => {
        console.log(data.articles);
        setBlogs(data.articles);
      })
  }, []);

  const loadMoreNews = () => {
    setCurrent(prevCount => Math.min(prevCount + 3, blogs.length));
  };
  useEffect(() => { ; }, [current]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#d9f8da]">
      <NavBar page='blogs' />
      <div className="bg-[#b7f7b0]" style={{ marginTop: '56px', paddingBottom: '2rem', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 65%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className='flex flex-row justify-between items-center'>
            <h1 className="text-3xl md:text-4xl font-serif text-[#005b2f]">THE LATEST</h1>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to='/contribute'
                target='_blank'
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#294c25] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#013a1e] transition-colors duration-300"
              >
                <AddIcon className="text-white" />
                <span className="font-medium">Contribute</span>
              </Link>
            </motion.div>
          </div>
          <p className="text-base md:text-lg text-[#11500c]">Stay up to date with latest food news and facts</p>
        </div>
      </div>

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Featured Articles */}
          <div className="space-y-4 mb-12">
            {blogs.slice(0, 2).map((item, index) => (
              <Link
                to={item.url}
                target='_blank'
                rel="noopener noreferrer"
                key={`featured-${index}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  <img
                    className="w-full sm:w-64 h-48 sm:h-auto object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                    src={item.urlToImage}
                    alt={item.title || 'Article image'}
                  />
                  <div className="p-6 flex flex-col justify-center flex-grow">
                    <h2 className="text-xl sm:text-2xl font-medium text-[#005b2f] mb-3">{item.title}</h2>
                    <p className="text-sm text-[#005b2f]">{formatDate(item.publishedAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* More Section */}
          <h2 className="text-3xl md:text-4xl text-[#005b2f] font-serif mb-6">More →</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {blogs.slice(2, current).map((item, index) => (
              <Link to={item.url} key={`more-${index}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                // Replace direct image URL usage with:
                <img
                  className="w-full sm:w-64 h-48 sm:h-auto object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                  src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,h_500,w_500,f_auto/${item.urlToImage}`}
                  alt={item.title || 'Article image'}
                />
                <div className="p-6">
                  <h3 className="text-lg font-medium text-[#005b2f] mb-3 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-[#005b2f]">{formatDate(item.publishedAt)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Get More Button - Only show if there are more articles to load */}
          {current < blogs.length && (
            <div className="flex justify-end -mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-[#294c25] text-white px-6 py-3 rounded-full shadow-md hover:bg-[#013a1e] transition-colors duration-300"
                onClick={loadMoreNews}
              >
                <span className="font-medium">Get More</span>
                <ArrowForwardIosIcon fontSize="small" />
              </motion.button>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Blogs;
