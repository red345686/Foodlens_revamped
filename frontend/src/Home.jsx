import React from 'react'
import { Link } from 'react-router-dom'
const Home = () => {
  return (
    <>
      <header className={`sticky w-full bg-transparent backdrop-filter`}>
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
      <div className="bg-[url('HomeBackground.png')] bg-cover bg-center fixed h-screen w-full -mt-12 -z-10">
      </div>
      <div className='fixed bg-transparent lg:`p-10 rounded-lg' style={{ marginLeft: '10vw', marginRight: '50vw', marginTop: '20vh' }}>
        <h1 className='flex text-8xl justify-center mb-10 text-white font-bold w-auto'>FoodLens</h1>
        <span className='text-3xl text-white font-thin font-'>FoodLens is your go-to platform for understanding the ingredients in your food. Empower yourself to eat smarter with FoodLens!</span>
        <div className='flex justify-center space-x-20 mt-10'>
          <Link to='/explore' className='text-3xl text-white px-8 py-4 bg-red-600 rounded-3xl'>EXPLORE</Link>
          <Link to='/login' className='text-3xl text-white px-8 py-4 bg-red-600 rounded-3xl'>LOGIN</Link>
        </div>
      </div>
    </>
  )
}

export default Home
