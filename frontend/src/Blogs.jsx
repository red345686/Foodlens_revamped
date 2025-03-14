import React from 'react'
import Footer from './Footer'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
    <div style={{ backgroundColor: '#d9f8da', zIndex: '-100', width: '99vw', position: 'absolute', overflowX: 'hidden' }} className='mt-12'>
      <div className='w-screen flex flex-col'>
        <header className='w-full bg-[#b7f7b0] mb-32'>
          <h1 className='px-[10vw] text-5xl text-[#005b2f] font-serif pt-10'>THE LATEST</h1>
          <p className='px-[10vw] font-semibold text-xl text-[#11500c]'>Stay up to date with latest food news and facts</p>
          <div style={{ width: '110vw', marginLeft: '-5vw', translate: '0 -8vw', zIndex: '-1', height: '30vh' }} className='absolute bg-[#b7f7b0] rotate-3' ></div>
        </header>
        <div className='flex flex-col items-center justify-center mt-5'>
          {tempData.slice(0, 3).map((item, index) => (
            <div key={index} className='bg-white rounded-lg shadow-lg mb-10 w-[80vw] flex p-4'>
              <img className='h-40' src={item.img} alt="" />
              <div className='px-10 py-5'>
                <h1 className='text-3xl font-medium text-[#005b2f]'>{item.text}</h1>
                <p className='text-[#005b2f] font-semibold pt-6'>{item.date}</p>
              </div>
            </div>
          ))}
        </div>
        <h1 className='px-[10vw] text-5xl text-[#005b2f] font-serif'>More →</h1>
        <div className='px-[10vw] grid grid-flow-rows grid-cols-5 gap-3 mt-5 justify-between'>
          {tempData.slice(3).map((item, index) => (
            <div key={index} className='bg-white rounded-lg shadow-lg mb-10 flex flex-col'>
              <img className='p-[10%] rounded-sm  h-full' src={item.img} alt="" />
              <div className='px-10 py-5'>
                <h1 className='text-xl font-medium text-[#005b2f]'>{item.text}</h1>
                <p className='text-[#005b2f] font-semibold pt-6'>{item.date}</p>
              </div>
            </div>
          ))}
          <button class='flex justify-center items-center p-5 flex-col text-green-950 text-3xl'>
            <ArrowForwardIosIcon />
            <h1 className='mt-4'>More</h1>
          </button>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Blogs
