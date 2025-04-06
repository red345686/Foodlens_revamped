import { useState } from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
    }
  };

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        // Try to register
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Try to login
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('A user with this email already exists. Please try logging in instead.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className='xl:flex justify-between'>
      <div className='p-6 sm:px-12 xl:mx-auto backdrop-blur-xl h-screen sm:pt-[5vh] lg:pt-[8vh]'>
        <Link to='/' className='text-3xl md:text-4xl lg:text-5xl underline font-bold text-[#294c25]'>FoodLens</Link>
        <h1 className='text-xl lg:text-4xl font-semibold mt-2 md:mt-4 lg:mt-6'>
          {isRegistering ? 'Create an account' : 'Welcome back!'}
        </h1>
        <p className='text-sm lg:text-xl font-serif mt-3'>
          {isRegistering ? 'Join us to get unlimited access to data and information' : 'Enter to get unlimited access to data and information'}
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailPasswordAuth} className="mt-4">
          <div className='flex flex-col space-y-1 pt-1 lg:pt-5'>
            <label htmlFor="email" className='font-medium px-3'>Email<span className='text-red-600'>*</span></label>
            <input
              type="email"
              id='email'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email address'
              className='border rounded-lg py-1 md:py-2 lg:py-3 px-4'
              required
            />
          </div>
          <div className='flex flex-col space-y-1 pt-1 lg:pt-5'>
            <label htmlFor="password" className='font-medium px-3'>Password<span className='text-red-600'>*</span></label>
            <input
              type="password"
              id='password'
              name='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              className='border rounded-lg py-1 md:py-2 lg:py-3 px-4'
              required
            />
          </div>
          <div className='mx-2 mt-1 flex justify-between font-thin text-xs lg:text-base lg:mt-1'>
            <div>
              <input type="checkbox" name='remember' value={true} />
              <label htmlFor="remember" className='ml-1'>Remember me</label>
            </div>
            {!isRegistering && (
              <Link className='text-red-600'>Forgot your password?</Link>
            )}
          </div>
          <button
            type="submit"
            className='bg-lime-500 text-white px-auto py-1 lg:py-2 rounded-lg mt-4 w-full'
          >
            {isRegistering ? 'Register' : 'Log In'}
          </button>
        </form>

        <div className='flex justify-center flex-row my-4'>
          <div className='w-full' style={{ height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
          <p className='text-sm md:text-base lg:text-lg text-center w-full'>Or {isRegistering ? 'Register' : 'Login'} With</p>
          <div className='w-full' style={{ height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className='flex justify-around border rounded-2xl text w-full'
          style={{ backgroundColor: '#f2f2f2' }}
        >
          <img src='google.svg' alt="Google" />
        </button>

        <p className='text-sm lg:text-base mt-6 mx-6 text-center'>
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className='text-purple-600 underline font-semibold'
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
      <img className='fixed xl:relative h-[100vh] sm:h-[100vh] sm:w-auto' src="LoginBack.jpg" alt="" style={{ top: '0', zIndex: '-1' }} />
    </div>
  )
}

export default Login
