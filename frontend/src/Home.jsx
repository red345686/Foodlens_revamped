import React from 'react'
import { Link } from 'react-router-dom'
const Home = () => {
  return (
    <>
      <div className="bg-[url('HomeBackground.png')] bg-cover bg-center fixed h-screen w-full -z-10">
      </div>
      <div className='fixed bg-transparent lg:`p-10 rounded-lg' style={{ marginLeft: '10vw', marginRight: '50vw', marginTop: '20vh' }}>
        <h1 className='text-8xl mx-10 mb-10 text-white font-bold'>FoodLens</h1>
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
