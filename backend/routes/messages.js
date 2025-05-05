import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Check messaging permission between users
const canSendMessage = async (senderId, recipientId) => {
  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return { allowed: false, reason: 'Recipient not found' };
    }
    
    // Check if sender is blocked
    if (recipient.messagingPrivacy?.blockedUsers?.includes(senderId)) {
      return { allowed: false, reason: 'You have been blocked by this user' };
    }
    
    // Check privacy settings
    const privacySetting = recipient.messagingPrivacy?.allowMessagesFrom || 'everyone';
    
    if (privacySetting === 'everyone') {
      return { allowed: true };
    }
    
    const sender = await User.findById(senderId);
    if (!sender) {
      return { allowed: false, reason: 'Sender not found' };
    }
    
    // Check specific privacy settings
    if (privacySetting === 'following') {
      // Can message if recipient is following sender
      if (recipient.following.includes(senderId)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'This user only accepts messages from people they follow' };
    }
    
    if (privacySetting === 'followers') {
      // Can message if sender is following recipient
      if (sender.following.includes(recipientId)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'This user only accepts messages from their followers' };
    }
    
    if (privacySetting === 'mutualFollows') {
      // Can message only if both users follow each other
      if (recipient.following.includes(senderId) && sender.following.includes(recipientId)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'This user only accepts messages from mutual connections' };
    }
    
    // Default fallback
    return { allowed: false, reason: 'Unable to send message due to privacy settings' };
  } catch (error) {
    console.error('Error checking message permissions:', error);
    return { allowed: false, reason: 'Error checking permissions' };
  }
};

// Send a message
router.post('/', async (req, res) => {
  try {
    const { senderId, recipientId, text } = req.body;
    
    // Check if sender exists
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: 'Sender user not found' });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }
    
    // Check messaging permissions
    const permissionCheck = await canSendMessage(senderId, recipientId);
    if (!permissionCheck.allowed) {
      return res.status(403).json({ error: permissionCheck.reason });
    }
    
    // Create and save message
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      text
    });
    
    await newMessage.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation between two users
router.get('/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    
    // Verify both users exist
    const [user, otherUser] = await Promise.all([
      User.findById(userId),
      User.findById(otherUserId)
    ]);
    
    if (!user || !otherUser) {
      return res.status(404).json({ error: 'One or both users not found' });
    }
    
    // Check if either user has blocked the other
    if (
      user.messagingPrivacy?.blockedUsers?.includes(otherUserId) ||
      otherUser.messagingPrivacy?.blockedUsers?.includes(userId)
    ) {
      return res.status(403).json({ error: 'Cannot view this conversation' });
    }
    
    // Get messages where user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profilePicture')
      .populate('recipient', 'username profilePicture');
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/read/:senderId/:recipientId', async (req, res) => {
  try {
    const { senderId, recipientId } = req.params;
    
    // Update all unread messages from sender to recipient
    await Message.updateMany(
      { sender: senderId, recipient: recipientId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread messages count
router.get('/unread/:userId', async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.params.userId,
      read: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get list of conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find all users that the current user has messaged or received messages from
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ createdAt: -1 });
    
    // Get unique user IDs from these messages (excluding current user)
    const userIds = new Set();
    messages.forEach(message => {
      if (message.sender.toString() !== userId) {
        userIds.add(message.sender.toString());
      }
      if (message.recipient.toString() !== userId) {
        userIds.add(message.recipient.toString());
      }
    });
    
    // Get user details for these IDs
    const conversationUsers = await User.find({
      _id: { $in: [...userIds] }
    }).select('username profilePicture');
    
    // For each user, find the latest message
    const conversations = await Promise.all(
      conversationUsers.map(async (user) => {
        const latestMessage = await Message.findOne({
          $or: [
            { sender: userId, recipient: user._id },
            { sender: user._id, recipient: userId }
          ]
        }).sort({ createdAt: -1 });
        
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          recipient: userId,
          read: false
        });
        
        return {
          user: {
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture
          },
          latestMessage: latestMessage ? {
            text: latestMessage.text,
            createdAt: latestMessage.createdAt,
            sender: latestMessage.sender
          } : null,
          unreadCount
        };
      })
    );
    
    // Sort conversations by latest message
    conversations.sort((a, b) => {
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
    });
    
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user messaging privacy settings
router.put('/privacy/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { allowMessagesFrom } = req.body;
    
    // Validate privacy setting
    const validSettings = ['everyone', 'following', 'followers', 'mutualFollows'];
    if (allowMessagesFrom && !validSettings.includes(allowMessagesFrom)) {
      return res.status(400).json({ error: 'Invalid privacy setting' });
    }
    
    // Update the user's privacy settings
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        'messagingPrivacy.allowMessagesFrom': allowMessagesFrom 
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Privacy settings updated',
      privacy: updatedUser.messagingPrivacy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Block a user from sending messages
router.post('/block/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { blockedUserId } = req.body;
    
    // Validate IDs
    if (userId === blockedUserId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }
    
    // Check if both users exist
    const [user, blockedUser] = await Promise.all([
      User.findById(userId),
      User.findById(blockedUserId)
    ]);
    
    if (!user || !blockedUser) {
      return res.status(404).json({ error: 'One or both users not found' });
    }
    
    // Check if already blocked
    if (user.messagingPrivacy?.blockedUsers?.includes(blockedUserId)) {
      return res.status(400).json({ error: 'User is already blocked' });
    }
    
    // Add to blocked list
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { 'messagingPrivacy.blockedUsers': blockedUserId } },
      { new: true }
    );
    
    res.status(200).json({
      message: 'User blocked successfully',
      blockedUsers: updatedUser.messagingPrivacy.blockedUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unblock a user
router.post('/unblock/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { unblockedUserId } = req.body;
    
    // Update the user's blocked list
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'messagingPrivacy.blockedUsers': unblockedUserId } },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User unblocked successfully',
      blockedUsers: updatedUser.messagingPrivacy.blockedUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blocked users list
router.get('/blocked/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('messagingPrivacy.blockedUsers', 'username profilePicture');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      blockedUsers: user.messagingPrivacy?.blockedUsers || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 