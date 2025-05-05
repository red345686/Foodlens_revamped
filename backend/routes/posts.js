import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Create a new post
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { userId, caption, tags, location } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      // Clean up uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Process uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Create public URL for the image - ensure path starts with /uploads/
        const imageUrl = `/uploads/${path.basename(file.path)}`;
        console.log('Created image URL:', imageUrl, 'from file:', file.filename);
        imageUrls.push(imageUrl);
      });
    }

    // Parse tags if they exist
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        console.error('Error parsing tags:', error);
        // If parsing fails, treat as string and split by commas
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }
    
    const newPost = new Post({
      user: userId,
      caption,
      images: imageUrls,
      tags: parsedTags,
      location
    });
    
    await newPost.save();
    
    // Add post to user's posts
    await User.findByIdAndUpdate(userId, {
      $push: { posts: newPost._id }
    });
    
    // Populate user info
    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'username profilePicture');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all posts (feed)
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find({ isArchived: false })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'username profilePicture',
        // Provide default values in case user is null
        match: { isActive: { $ne: false } }, // Only match active users
      })
      .populate({
        path: 'likes',
        select: 'username profilePicture',
      })
      .populate({
        path: 'comments.user',
        select: 'username profilePicture',
      });
    
    // Filter out posts where user is null (deleted users)
    const filteredPosts = posts.filter(post => post.user !== null);
    
    // Ensure all comments have valid users
    filteredPosts.forEach(post => {
      if (post.comments) {
        post.comments = post.comments.filter(comment => comment.user !== null);
      }
    });
    
    res.status(200).json(filteredPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's posts
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ 
      user: req.params.userId,
      isArchived: false
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'username profilePicture',
      })
      .populate({
        path: 'likes',
        select: 'username',
      })
      .populate({
        path: 'comments.user',
        select: 'username profilePicture',
      });
    
    // Filter out posts with invalid data
    const filteredPosts = posts.filter(post => post.user !== null);
    
    // Ensure all comments have valid users
    filteredPosts.forEach(post => {
      if (post.comments) {
        post.comments = post.comments.filter(comment => comment.user !== null);
      }
    });
    
    res.status(200).json(filteredPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'username profilePicture',
      })
      .populate({
        path: 'likes',
        select: 'username profilePicture',
      })
      .populate({
        path: 'comments.user',
        select: 'username profilePicture',
      });
    
    if (!post || post.isArchived) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if post user is valid, if not add default values
    if (!post.user) {
      post.user = {
        username: 'Deleted User',
        profilePicture: 'https://via.placeholder.com/150'
      };
    }
    
    // Filter out comments with invalid users
    if (post.comments) {
      post.comments = post.comments.filter(comment => comment.user !== null);
    }
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a post
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;
    
    if (!post || post.isArchived) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ error: 'Post already liked' });
    }
    
    // Add user to likes array
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { likes: userId }
    });
    
    // Add notification to post owner if it's not the same user
    if (post.user.toString() !== userId) {
      await User.findByIdAndUpdate(post.user, {
        $push: {
          notifications: {
            type: 'like',
            user: userId,
            post: post._id
          }
        }
      });
    }
    
    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlike a post
router.post('/:id/unlike', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;
    
    if (!post || post.isArchived) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user hasn't liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ error: 'Post not liked yet' });
    }
    
    // Remove user from likes array
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { likes: userId }
    });
    
    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a comment to a post
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post || post.isArchived) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const comment = {
      user: userId,
      text,
      _id: new mongoose.Types.ObjectId(), // Generate a proper ObjectId for the comment
      createdAt: new Date()
    };
    
    // Add comment to post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment } },
      { new: true }
    )
      .populate({
        path: 'user',
        select: 'username profilePicture',
      })
      .populate({
        path: 'comments.user',
        select: 'username profilePicture',
      });
    
    // Make sure all comment user data is valid
    if (updatedPost.comments) {
      updatedPost.comments = updatedPost.comments.map(comment => {
        if (!comment.user) {
          return {
            ...comment.toObject(),
            user: {
              _id: userId,
              username: 'Unknown User',
              profilePicture: 'https://via.placeholder.com/150'
            }
          };
        }
        return comment;
      });
    }
    
    // Add notification to post owner if it's not the same user
    if (post.user.toString() !== userId) {
      await User.findByIdAndUpdate(post.user, {
        $push: {
          notifications: {
            type: 'comment',
            user: userId,
            post: post._id
          }
        }
      });
    }
    
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a comment
router.post('/:postId/comment/:commentId/like', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;
    
    const post = await Post.findById(postId);
    if (!post || post.isArchived) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check if user already liked the comment
    if (comment.likes.includes(userId)) {
      return res.status(400).json({ error: 'Comment already liked' });
    }
    
    // Add user to comment likes
    comment.likes.push(userId);
    await post.save();
    
    res.status(200).json({ message: 'Comment liked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlike a comment
router.post('/:postId/comment/:commentId/unlike', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;
    
    const post = await Post.findById(postId);
    if (!post || post.isArchived) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check if user hasn't liked the comment
    if (!comment.likes.includes(userId)) {
      return res.status(400).json({ error: 'Comment not liked yet' });
    }
    
    // Remove user from comment likes
    comment.likes = comment.likes.filter(id => id.toString() !== userId);
    await post.save();
    
    res.status(200).json({ message: 'Comment unliked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is the owner of the post
    if (post.user.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    
    // Instead of deleting, mark as archived
    await Post.findByIdAndUpdate(req.params.id, { isArchived: true });
    
    // Remove post from user's posts array
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: post._id }
    });
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 