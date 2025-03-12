import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div className='flex justify-between'>
      <div className='ml-24' style={{marginTop: '14vh'}}>
        <h1 className='text-4xl font-semibold'>Welcome back !</h1>
        <p className='font-serif mt-3'>Enter to get unlimited access to data and information</p>
        <div className='flex flex-col space-y-1 mt-5'>
          <label htmlFor="email" className='font-medium pl-3'>Email<span className='text-red-600'>*</span></label>
          <input type="text" id='email' name='email' placeholder='Enter your email addresss' className='border rounded-lg h-10 p-6' />
        </div>
        <div className='flex flex-col space-y-1 mt-5'>
          <label htmlFor="password" className='font-medium pl-3'>Password<span className='text-red-600'>*</span></label>
          <input type="password" id='password' name='password' placeholder='Enter your password' className='border rounded-lg h-10 p-6' />
        </div>
        <div className='mx-2 flex justify-between font-thin text-sm mt-1'>
          <div>
            <input type="checkbox" name='remember' value={true} />
            <label htmlFor="remember">Remember me</label>
          </div>
          <Link className='text-red-600'>Forgot your password?</Link>
        </div>
        <button className='bg-lime-500 text-white px-auto py-2 rounded-lg mt-4 w-96'>Log In</button>
        <div className='flex justify-center flex-row my-4'>
          <div style={{ width: '8rem', height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
          <p className='text-center mx-2'>Or Login With</p>
          <div style={{ width: '8rem', height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
        </div>
        {/* Google Login below */}
        <button className='flex justify-around border rounded-2xl text w-96' style={{ backgroundColor: '#f2f2f2' }}><img src='google.svg' style={{ width: '12rem' }}></img></button> 
        <p className='mt-6 mx-6'>Don't have an account? <Link className='text-purple-600 underline font-semibold'>Register here</Link></p>
      </div>
      <img src="LoginBack.jpg" alt="" style={{ height: '100vh' }} />
    </div>
  )
}

export default Login
