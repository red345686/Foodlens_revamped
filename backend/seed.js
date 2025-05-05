import dotenv from 'dotenv';
import { connectMongoose } from './database.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Message from './models/Message.js';

dotenv.config();

// Create default user
async function seedDefaultUser() {
  try {
    // Connect to the database
    await connectMongoose();
    
    console.log('Looking for default user...');
    
    // Check if default user already exists
    const existingUser = await User.findOne({ username: 'defaultuser' });
    
    if (existingUser) {
      console.log('Default user already exists!');
      return existingUser;
    }
    
    // Create a new default user
    const defaultUser = new User({
      username: 'defaultuser',
      email: 'default@foodlens.com',
      password: 'password123', // In a real app, this would be hashed
      profilePicture: 'https://i.pravatar.cc/300?img=68',
      bio: 'This is the default user for the FoodLens community app. Welcome to my profile!',
      followers: [],
      following: [],
      posts: [],
      savedPosts: [],
      notifications: [],
      isActive: true,
      lastSeen: new Date(),
    });
    
    await defaultUser.save();
    console.log('Default user created successfully!');
    
    // Create a sample post
    const defaultPost = new Post({
      user: defaultUser._id,
      caption: 'Welcome to the FoodLens community! This is my first post. I love sharing healthy recipes and food tips. Let me know what kind of content you would like to see!',
      images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop'],
      tags: ['welcome', 'foodlens', 'community', 'healthyfood'],
      likes: [],
      comments: [],
      location: 'FoodLens HQ',
    });
    
    await defaultPost.save();
    console.log('Default post created successfully!');
    
    // Update user with the post reference
    defaultUser.posts.push(defaultPost._id);
    await defaultUser.save();
    
    return defaultUser;
  } catch (error) {
    console.error('Error seeding default user:', error);
    process.exit(1);
  }
}

// Create another test user
async function seedTestUser(defaultUser) {
  try {
    console.log('Looking for test user...');
    
    // Check if test user already exists
    const existingTestUser = await User.findOne({ username: 'testuser' });
    
    if (existingTestUser) {
      console.log('Test user already exists!');
      return existingTestUser;
    }
    
    // Create a new test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@foodlens.com',
      password: 'password123', // In a real app, this would be hashed
      profilePicture: 'https://i.pravatar.cc/300?img=33',
      bio: 'I am a test user who loves to try new recipes and food adventures!',
      followers: [defaultUser._id],
      following: [defaultUser._id],
      posts: [],
      savedPosts: [],
      notifications: [{
        type: 'follow',
        user: defaultUser._id,
        read: false,
        createdAt: new Date()
      }],
      isActive: true,
      lastSeen: new Date(),
    });
    
    await testUser.save();
    console.log('Test user created successfully!');
    
    // Update default user's followers and following
    defaultUser.followers.push(testUser._id);
    defaultUser.following.push(testUser._id);
    await defaultUser.save();
    
    // Create a test post
    const testPost = new Post({
      user: testUser._id,
      caption: 'Hey everyone! Just joined FoodLens community. Looking forward to sharing my food journey!',
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1480&auto=format&fit=crop'],
      tags: ['newbie', 'foodjourney', 'healthyeating'],
      likes: [defaultUser._id],
      comments: [{
        user: defaultUser._id,
        text: 'Welcome to the community! Looking forward to your posts.',
        likes: [],
        replies: [],
        createdAt: new Date()
      }],
      location: 'Home Kitchen',
    });
    
    await testPost.save();
    console.log('Test post created successfully!');
    
    // Update test user with the post reference
    testUser.posts.push(testPost._id);
    await testUser.save();
    
    // Create a message between users
    const message1 = new Message({
      sender: defaultUser._id,
      recipient: testUser._id,
      text: 'Welcome to FoodLens! Let me know if you have any questions about the community.',
      read: false,
      createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    });
    
    const message2 = new Message({
      sender: testUser._id,
      recipient: defaultUser._id,
      text: 'Thanks for the welcome! I\'m excited to be part of this community.',
      read: false,
      createdAt: new Date()
    });
    
    await message1.save();
    await message2.save();
    console.log('Sample messages created successfully!');
    
    return testUser;
  } catch (error) {
    console.error('Error seeding test user:', error);
    process.exit(1);
  }
}

// Run the seeding process
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    const defaultUser = await seedDefaultUser();
    await seedTestUser(defaultUser);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 