import React from 'react'
import Footer from './Footer'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NavBar from './components/NavBar';
import { Link } from 'react-router-dom';

const Blogs = () => {
  const tempData = [
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'February 29 2024',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'MSG - a vegan pantry essential - makes a comeback',
      date: 'February 25 2024',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Dr. Bronner\'s jumped to B Corp certification. Now what?',
      date: 'February 21 2024',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'What social-media cuts to SNAP benefits mean for food justice and for all of us?',
      date: 'February 19 2024',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Can climate-friendly food labels promote environmentalism?',
      date: 'February 18 2024',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'How to fight household food waste? Start by organizing your pantry',
      date: 'February 17 2024',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Finding a pet food that aligns with your values',
      date: 'February 13 2024',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'How refrigeration changed our plates and our supply chain',
      date: 'February 10 2024',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#d9f8da]">
      <NavBar page='blogs' />
      <div className="bg-[#b7f7b0]" style={{ marginTop: '56px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-serif text-[#005b2f]">THE LATEST</h1>
          <p className="text-base md:text-lg text-[#11500c]">Stay up to date with latest food news and facts</p>
        </div>
      </div>
      {/* Triangle aa gya wapas */}
      <div className='w-full h-6 md:h-12 -mt-[1px]' style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        backgroundColor: '#b7f7b0',
      }}></div>

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Featured Articles */}
          <div className="space-y-4 mb-12">
            {tempData.slice(0, 2).map((item, index) => (
              <Link to={`/blog/${index}`} key={index} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  <img 
                    className="w-full sm:w-64 h-48 sm:h-auto object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" 
                    src={item.img} 
                    alt={item.text}
                  />
                  <div className="p-6 flex flex-col justify-center flex-grow">
                    <h2 className="text-xl sm:text-2xl font-medium text-[#005b2f] mb-3">{item.text}</h2>
                    <p className="text-sm text-[#005b2f]">{item.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* More Section */}
          <h2 className="text-3xl md:text-4xl text-[#005b2f] font-serif mb-6">More →</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tempData.slice(2, 8).map((item, index) => (
              <Link to={`/blog/${index + 2}`} key={index} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img 
                  className="w-full h-48 object-cover rounded-t-lg" 
                  src={item.img} 
                  alt={item.text}
                />
                <div className="p-6">
                  <h3 className="text-lg font-medium text-[#005b2f] mb-3 line-clamp-2">{item.text}</h3>
                  <p className="text-sm text-[#005b2f]">{item.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Blogs;
