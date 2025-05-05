import express from 'express';
import User from '../models/User.js';
// Import Firebase admin for verification
import admin from 'firebase-admin';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firebaseId } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create a new user with Firebase UID as _id
    const newUser = new User({
      _id: firebaseId, // Use Firebase UID as MongoDB _id
      username,
      email,
      password, // Note: In a real app, you should hash the password
    });
    
    await newUser.save();
    
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
      followers: newUser.followers,
      following: newUser.following,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to get user by Firebase ID
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Firebase
    try {
      // This requires Firebase Admin setup
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUserId = decodedToken.uid;
      
      // Find user with Firebase UID
      const user = await User.findById(firebaseUserId).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, firebaseId } = req.body;
    
    // If Firebase ID is provided, use that to find the user
    if (firebaseId) {
      const user = await User.findById(firebaseId);
      if (user) {
        return res.status(200).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
        });
      }
      
      // If no user found but Firebase auth passed, create a new user
      const newUser = new User({
        _id: firebaseId,
        username: email.split('@')[0], // Default username from email
        email,
        password: 'firebase-auth', // Placeholder since Firebase handles auth
        bio: 'Firebase user',
      });
      await newUser.save();
      
      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        bio: newUser.bio,
        followers: newUser.followers,
        following: newUser.following,
      });
    }
    
    // Traditional email/password login as fallback
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if password matches
    if (user.password !== password) { // Note: In a real app, you should compare hashed passwords
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { bio, profilePicture } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { bio, profilePicture },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow a user
router.post('/:id/follow', async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }
    
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ error: 'You are already following this user' });
    }
    
    // Add to following and followers
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { following: userToFollow._id }
    });
    
    await User.findByIdAndUpdate(userToFollow._id, {
      $push: { followers: currentUser._id }
    });
    
    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow a user
router.post('/:id/unfollow', async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    
    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userToUnfollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ error: 'You cannot unfollow yourself' });
    }
    
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ error: 'You are not following this user' });
    }
    
    // Remove from following and followers
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: userToUnfollow._id }
    });
    
    await User.findByIdAndUpdate(userToUnfollow._id, {
      $pull: { followers: currentUser._id }
    });
    
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get default user
router.get('/default/user', async (req, res) => {
  try {
    // Check if default user already exists
    let defaultUser = await User.findOne({ username: 'defaultuser' });
    
    if (!defaultUser) {
      // Create a default user if it doesn't exist
      defaultUser = new User({
        username: 'defaultuser',
        email: 'default@example.com',
        password: 'password123',
        bio: 'This is the default user for the community app',
      });
      await defaultUser.save();
    }
    
    res.status(200).json({
      _id: defaultUser._id,
      username: defaultUser.username,
      email: defaultUser.email,
      profilePicture: defaultUser.profilePicture,
      bio: defaultUser.bio,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 