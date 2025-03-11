import React from 'react'
import { Link } from 'react-router-dom'
function NavBar() {
  return (
    <div className='container'>
      <nav className='flex items-center justify-evenly text-black relative shadow-sm' role='navigation'>
        <Link to='/' className='p-1'>
          <div className='flex items-center'>
            <img className="w-10 rounded-lg" src="logo.png" alt="" />
            <span>FoodLens</span>
          </div>
        </Link>
        <Link to='/products'>Products</Link>
        <Link to='/blogs'>Blog</Link>
        <Link to='/community'>Community</Link>
        <Link to='/about'>About</Link>
      </nav>
    </div>
  )
}

export default NavBar
