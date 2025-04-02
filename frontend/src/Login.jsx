import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Link } from 'react-router-dom'

const Login = () => {
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className='xl:flex justify-between'>
      <div className='p-6 sm:px-12 xl:mx-auto backdrop-blur-xl h-screen sm:pt-[5vh] lg:pt-[8vh]'>
        {/* <Link className='bg-green-500 rounded-full p-2'>Return to home page</Link> */}
        <Link to='/' className='text-3xl md:text-4xl lg:text-5xl underline font-bold text-[#294c25]'>FoodLens</Link>
        <h1 className='text-xl lg:text-4xl font-semibold mt-2 md:mt-4 lg:mt-6'>Welcome back !</h1>
        <p className='text-sm lg:text-xl font-serif mt-3'>Enter to get unlimited access to data and information</p>
        <div className='flex flex-col space-y-1 pt-1 lg:pt-5'>
          <label htmlFor="email" className='font-medium px-3'>Email<span className='text-red-600'>*</span></label>
          <input type="text" id='email' name='email' placeholder='Enter your email address' className='border rounded-lg py-1 md:py-2 lg:py-3 px-4' />
        </div>
        <div className='flex flex-col space-y-1 pt-1 lg:pt-5'>
          <label htmlFor="password" className='font-medium px-3'>Password<span className='text-red-600'>*</span></label>
          <input type="password" id='password' name='password' placeholder='Enter your password' className='border rounded-lg py-1 md:py-2 lg:py-3 px-4' />
        </div>
        <div className='mx-2 mt-1 flex justify-between font-thin text-xs lg:text-base lg:mt-1'>
          <div>
            <input type="checkbox" name='remember' value={true} />
            <label htmlFor="remember" className='ml-1'>Remember me</label>
          </div>
          <Link className='text-red-600'>Forgot your password?</Link>
        </div>
        <button className='bg-lime-500 text-white px-auto py-1 lg:py-2 rounded-lg mt-4 w-full'>Log In</button>
        <div className='flex justify-center flex-row my-4'>
          <div className='w-full' style={{ height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
          <p className='text-sm md:text-base lg:text-lg text-center w-full'>Or Login With</p>
          <div className='w-full' style={{ height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
        </div>
        {/* Google Login below */}
        <button onClick={handleGoogleSignIn} className='flex justify-around border rounded-2xl text w-full' style={{ backgroundColor: '#f2f2f2' }}><img src='google.svg'></img></button>
        <p className='text-sm lg:text-base mt-6 mx-6 text-center'>Don't have an account? <Link className='text-purple-600 underline font-semibold'>Register here</Link></p>
      </div>
      <img className='fixed xl:relative h-[100vh] sm:h-[100vh] sm:w-auto' src="LoginBack.jpg" alt="" style={{ top: '0', zIndex: '-1' }} />
    </div>
  )
}

export default Login
