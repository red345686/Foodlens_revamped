import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../AuthContext'; // Import the main AuthContext

// Create context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user: firebaseUser } = useAuth(); // Get Firebase auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const isCheckingUserRef = useRef(false);

  useEffect(() => {
    // Check for logged in user on initial load
    const checkLoggedInUser = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingUserRef.current || hasAttemptedFetch) return;
      
      try {
        isCheckingUserRef.current = true;
        setLoading(true);
        
        // First check if user is authenticated via Firebase (AuthContext)
        if (firebaseUser) {
          // If Firebase has a user but we don't have a user in context, try to get user data
          try {
            setHasAttemptedFetch(true);
            const token = await firebaseUser.getIdToken();
            localStorage.setItem('firebaseToken', token);
            
            const response = await userAPI.getDefaultUser();
            setCurrentUser(response.data);
            // Save user to local storage
            localStorage.setItem('currentUser', JSON.stringify(response.data));
          } catch (err) {
            console.warn('Failed to fetch user profile, using basic auth data', err);
            // Fallback to basic user info from Firebase
            // Use Firebase UID directly as the _id
            const basicUser = {
              _id: firebaseUser.uid, // This is the Firebase UID
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              following: []
            };
            setCurrentUser(basicUser);
            localStorage.setItem('currentUser', JSON.stringify(basicUser));
            
            // Create a new user in the backend using Firebase data
            try {
              // Only try to register if we couldn't fetch the user (likely doesn't exist yet)
              await userAPI.register({
                username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: firebaseUser.email,
                password: 'firebase-auth', // Dummy password as auth is handled by Firebase
                firebaseId: firebaseUser.uid // Pass Firebase UID for use as _id
              });
            } catch (regErr) {
              // Continue anyway - user can still use the app
            }
          }
        } else {
          // If no Firebase user, check local storage as fallback
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
          } else {
            // If no saved user, app should show login/register options
            setCurrentUser(null);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error checking logged in user:', err);
        setError('Failed to load user data');
        
      } finally {
        setLoading(false);
        isCheckingUserRef.current = false;
      }
    };

    checkLoggedInUser();
  }, [firebaseUser, hasAttemptedFetch]); // Re-run when firebaseUser changes but prevent infinite loops with hasAttemptedFetch

  // Reset the fetch flag when firebase user changes
  useEffect(() => {
    setHasAttemptedFetch(false);
  }, [firebaseUser?.uid]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await userAPI.login(credentials);
      setCurrentUser(response.data);
      // Save user to local storage
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await userAPI.register(userData);
      setCurrentUser(response.data);
      // Save user to local storage
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // Update profile
  const updateProfile = async (userId, userData) => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile(userId, userData);
      setCurrentUser(response.data);
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Follow user
  const followUser = async (userId) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      await userAPI.followUser(userId, currentUser._id);
      // Update current user's following list
      const updatedUser = {
        ...currentUser,
        following: [...currentUser.following, userId]
      };
      setCurrentUser(updatedUser);
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to follow user');
      throw err;
    }
  };

  // Unfollow user
  const unfollowUser = async (userId) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      await userAPI.unfollowUser(userId, currentUser._id);
      // Update current user's following list
      const updatedUser = {
        ...currentUser,
        following: currentUser.following.filter(id => id !== userId)
      };
      setCurrentUser(updatedUser);
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unfollow user');
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        followUser,
        unfollowUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}; 