import React from 'react'
import Footer from './Footer'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NavBar from './components/NavBar';

const Blogs = () => {
  const tempData = [
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
    {
      img: 'BlogPageTempPhoto.png',
      text: 'Americans love olive oil. Why doesn\'t the U.S. produce more of it?',
      date: 'September 21, 2023',
    },
  ]
  return (
    <>
      <NavBar page='blogs' />
      <div style={{ backgroundColor: '#d9f8da', zIndex: '-10', position: 'absolute', overflowX: 'hidden' }}>
        <div className='w-screen flex flex-col'>
          <header className='w-screen bg-[#b7f7b0] mb-32'>
            <h1 className='px-[10vw] text-xl md:text-3xl lg:text-5xl text-[#005b2f] font-serif pt-10'>THE LATEST</h1>
            <p className='px-[10vw] font-semibold text-xs md:text-base lg:text-xl text-[#11500c]'>Stay up to date with latest food news and facts</p>
            <div style={{ width: '110vw', marginLeft: '-5vw', translate: '0 -8vw', zIndex: '-1' }} className='absolute bg-[#b7f7b0] rotate-3 h-12 sm:h-[15vh] md:h-[20vh] lg:h-[30vh]' ></div>
          </header>
          <div className='flex flex-col items-center justify-center -mt-16 md:mt-0 lg:mt-10'>
            {tempData.slice(0, 3).map((item, index) => (
              <div key={index} className='bg-white rounded-lg shadow-lg mb-[3vw] w-[90vw] lg:w-[80vw] flex p-4'>
                <img className='h-[30vw] lg:h-48 rounded' src={item.img} alt="" />
                <div className='px-3 md:px-6 lg:px-10 '>
                  <h1 className='text-xs lg:text-3xl font-medium text-[#005b2f]'>{item.text}</h1>
                  <p className='text-[#005b2f] font-semibold text-xs lg:text-lg pt-2 md:pt-3 lg:pt-6'>-{item.date}</p>
                </div>
              </div>
            ))}
          </div>
          <h1 className='px-[10vw] text-5xl text-[#005b2f] font-serif'>More →</h1>
          <div className='px-[10vw] grid grid-flow-cols grid-rows-5 lg:grid-flow-rows lg:grid-cols-5 gap-3 mt-5 justify-between'>
            {tempData.slice(3, 7).map((item, index) => (
              <div key={index} className='bg-white rounded-lg shadow-lg mb-10 flex flex-col'>
                <img className='p-[10%] rounded-sm h-full' src={item.img} alt="" />
                <div className='px-10 py-5'>
                  <h1 className='text-xl font-medium text-[#005b2f]'>{item.text}</h1>
                  <p className='text-[#005b2f] font-semibold pt-6'>{item.date}</p>
                </div>
              </div>
            ))}
            <button className='flex justify-center items-center p-5 flex-col text-green-950 text-3xl'>
              <ArrowForwardIosIcon />
              <h1 className='mt-4'>More</h1>
            </button>
          </div>
          <Footer />
        </div>
      </div>
    </>
  )
}

export default Blogs
