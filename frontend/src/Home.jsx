import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './components/NavBar'
const Home = () => {
  return (
    <>
      <NavBar page='home' />
      <div className="bg-[url('HomeBackground.png')] bg-cover bg-center fixed h-screen w-[100vw]">
      </div>
      <div className='fixed w-auto bg-transparent lg:p-10 ml-[10vw] mr-[10vw] sm:mr-[30vw] md:mr-[50vw] mt-[10vh] lg:mt-[20vh]'>
        <div className='sm:w-auto text-center mt-[10vh] text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-10 text-white font-bold'>FoodLens</div>
        <div className='sm:w-auto pr-[10vw] sm:pr-0 text-xl md:text-2xl lg:text-3xl text-white font-normal font-sans'>FoodLens is your go-to platform for understanding the ingredients in your food. Empower yourself to eat smarter with FoodLens!</div>
        <div className='flex flex-col sm:flex-row sm:justify-evenly mt-10'>
          <div className='sm:w-auto text-center text-lg sm:text-xl md:text-2xl my-2 lg:text-3xl text-white px-3 md:px-5 lg:px-8 py-2 md:py-3 lg:py-4 bg-red-600 rounded-2xl lg:rounded-3xl'><Link to='/login'>LOGIN</Link></div>
          <div className='sm:w-auto text-center text-lg sm:text-xl md:text-2xl my-2 lg:text-3xl text-white px-3 md:px-5 lg:px-8 py-2 md:py-3 lg:py-4 bg-red-600 rounded-2xl lg:rounded-3xl'><Link to='/explore'>EXPLORE</Link></div>
        </div>
      </div>
    </>
  )
}

export default Home
