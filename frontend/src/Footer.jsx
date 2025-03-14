import React from 'react'
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
  const [email, setEmail] = React.useState('');
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }
  return (
    <div>
      <div style={{ width: '110vw', marginLeft: '-5vw', translate: '0 3vw', zIndex: '-1', height: '13vh' }} className='relative bg-[#294c25] rotate-3' ></div>
      <footer className='bg-[#294c25]' style={{ zIndex: '2' }}>
        <div className='grid grid-flow-col'>
          <div className='flex justify-center items-center flex-col'>
            <img src="logo.png" alt="" />
            <h1 className='text-4xl text-white font-serif'>FoodLens</h1>
            <div className="flex">
              <div className='text-white mx-3'><InstagramIcon /></div>
              <div className='text-white mx-3'><GitHubIcon /></div>
              <div className='text-white mx-3'><LinkedInIcon /></div>
            </div>
            <button className='bg-white py-1 px-5 text-xl m-3 rounded-full'>Contact Us</button>
          </div>
          <div className='mt-5 mx-auto'>
            <h1 className='text-white text-3xl my-2'>Product</h1>
            <div className='text-white text-md'>
              <p>Know your Food</p>
              <p>Community Forum</p>
              <p>Blogs</p>
              <p>Contribute</p>
              <p>Report</p>
            </div>
          </div>
          <div className='mt-5 mx-auto'>
            <h1 className='text-white text-3xl my-2'>Company</h1>
            <div className='text-white text-md'>
              <p>About Us</p>
              <p>Careers</p>
              <p>FAQs</p>
              <p>Teams</p>
              <p>Contact Us</p>
            </div>
          </div>
          <div className='mx-auto mt-10'>
            <div className='text-white my-2'>
              <h1 className='text-white text-2xl'>Subscribe</h1>
              <p className='text-sm'>Subscribe to stay tuned for latest food updates.</p>
              <div className='flex justify-between items-center mt-3'>
                <input className='text-black px-2 rounded' type="text" placeholder='Enter your email address' value={email} onChange={handleEmailChange}/>
                <button className='bg-white text-black px-2 rounded'>Subscribe</button>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className='flex py-1 justify-evenly'>
          <p className='text-white text-sm'>© 2025 FoodLens. All rights reserved.</p>
          <div className='flex text-white text-sm'>
            <p className='px-4'>Privacy Policy</p>
            <p className='px-4'>Terms of Use</p>
            <p className='px-4'>Sales and Refund</p>
            <p className='px-4'>Legal</p>
            <p className='px-4'>Site Map</p>
          </div>
          <div></div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
