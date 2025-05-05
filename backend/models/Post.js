import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  text: { type: String, required: true },
  likes: [{ type: String, ref: 'User' }],
  replies: [{
    user: { type: String, ref: 'User', required: true },
    text: { type: String, required: true },
    likes: [{ type: String, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  caption: { type: String, required: true },
  images: [{ type: String }],
  likes: [{ type: String, ref: 'User' }],
  comments: [commentSchema],
  tags: [{ type: String }],
  location: { type: String },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

export default Post; 