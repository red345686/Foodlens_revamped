import React from 'react'
import { Link } from 'react-router-dom'
function NavBar({ page }) {
  const font = {
    fontFamily: "Zen Kaku Gothic Antique"
  }
  return (
    <header className="w-full bg-[#294c25] backdrop-filter fixed">
      <nav className="container mx-auto px-6 py-1 flex items-center">
        <Link to='/' className='text-lg font-bold text-white px-12'>
          <div className='flex items-center'>
            <img className="w-10 rounded-lg" src="logo.png" alt="" />
            <span className='mx-2 text-2xl'>FoodLens</span>
          </div>
        </Link>
        <div className="space-x-10 font-sans text-lg">
          <Link className={`${page === 'products' ? 'active text-white' : 'text-gray-400'}`} to='/products'>Products</Link>
          <Link className={`${page === 'blogs' ? 'active text-white' : 'text-gray-400'}`} to='/blogs'>Blog</Link>
          <Link className={`${page === 'community' ? 'active text-white' : 'text-gray-400'}`} to='/community'>Community</Link>
          <Link className={`${page === 'about' ? 'active text-white' : 'text-gray-400'}`} to='/about'>About</Link>
          <Link className={`${page === 'report' ? 'active text-white' : 'text-gray-400'}`} to='/report'>Report</Link>
          <span></span>
        </div>
      </nav>
    </header>
  );

}

export default NavBar
