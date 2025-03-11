import React from 'react'
import { Link } from 'react-router-dom'
function NavBar() {
  return (
    <nav className='flex items-center bg-transparent justify-evenly text-black sticky' role='navigation'>
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
  )
}

export default NavBar
