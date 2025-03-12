import React from 'react'
import { Link } from 'react-router-dom'
function NavBar() {
  const font = {
    fontFamily: "Zen Kaku Gothic Antique"
  }
  return (
    <header className="fixed top-0 w-full bg-transparent bg-opacity-0 backdrop-filter backdrop-blur-lgg pt-4 z-50">
      <nav className="container mx-auto px-6 py-1 flex items-center">
        <Link to='/' className='text-lg font-bold text-white px-12'>
          <div className='flex items-center'>
            <img className="w-10 rounded-lg" src="logo.png" alt="" />
            <span className='mx-2 text-2xl'>FoodLens</span>
          </div>
        </Link>
        <div className="space-x-10 text-white font-sans text-lg">
          <Link to='/products'>Products</Link>
          <Link to='/blogs'>Blog</Link>
          <Link to='/community'>Community</Link>
          <Link to='/about'>About</Link>
        </div>
      </nav>
    </header>
  );

}

export default NavBar
