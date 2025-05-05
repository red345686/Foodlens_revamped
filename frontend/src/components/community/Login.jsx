import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // First authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Store the Firebase token for API requests
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);
      
      // Then try to get user data from backend
      try {
        // Pass Firebase UID when logging in to backend
        await login({
          ...formData,
          firebaseId: userCredential.user.uid
        });
      } catch (err) {
        console.warn('Backend login failed, but Firebase auth succeeded', err);
        // It's okay to continue if Firebase auth succeeded but backend login failed
      }
      
      navigate('/community');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#294c25]">Sign In</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 text-gray-400">
              <FaUser />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full bg-[#294c25] text-white py-3 rounded-lg font-medium hover:bg-[#1a3317] transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/community/register" className="text-[#294c25] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 