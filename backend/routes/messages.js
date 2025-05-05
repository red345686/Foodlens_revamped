import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

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
    
    // Check if sender follows recipient or vice versa
    const senderFollowsRecipient = sender.following.includes(recipientId);
    const recipientFollowsSender = recipient.following.includes(senderId);
    
    if (!senderFollowsRecipient && !recipientFollowsSender) {
      return res.status(403).json({ error: 'You can only message users you follow or who follow you' });
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
    
    // Sort by latest message time
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

export default router; 