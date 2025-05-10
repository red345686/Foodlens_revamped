import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'https://via.placeholder.com/150' },
  bio: { type: String, default: '' },
  followers: [{ type: String, ref: 'User' }],
  following: [{ type: String, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  notifications: [{
    type: { type: String, enum: ['follow', 'like', 'comment'] },
    user: { type: String, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  messagingPrivacy: {
    allowMessagesFrom: {
      type: String,
      enum: ['everyone', 'following', 'followers', 'mutualFollows'],
      default: 'everyone'
    },
    blockedUsers: [{ type: String, ref: 'User' }]
  },
  badges: [{
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    earnedAt: { type: Date, default: Date.now },
    displayed: { type: Boolean, default: true }
  }],
  stats: {
    postCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    likesGiven: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    loginCount: { type: Number, default: 1 },
    lastBadgeCheck: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User; 