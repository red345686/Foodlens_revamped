import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaUserCircle } from 'react-icons/fa';

const Register = () => {
  const { register } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/community');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#294c25]">Create Account</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">
            Username
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 text-gray-400">
              <FaUserCircle />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 focus:outline-none"
              placeholder="Choose a username"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 text-gray-400">
              <FaEnvelope />
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
        
        <div className="mb-4">
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
              placeholder="Create a password"
              required
              minLength="6"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 focus:outline-none"
              placeholder="Confirm your password"
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/community/login" className="text-[#294c25] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 