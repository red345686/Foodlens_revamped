import User from './models/User.js';
import Badge from './models/Badge.js';

// Check if a user qualifies for badges and award them accordingly
export const checkAndAwardBadges = async (userId) => {
  try {
    // Fetch user with their current badges
    const user = await User.findById(userId)
      .populate('badges.badge');
    
    if (!user) {
      console.error('User not found:', userId);
      return null;
    }

    // Get all available badges
    const allBadges = await Badge.find({});
    
    // Get IDs of badges the user already has
    const userBadgeIds = user.badges.map(badge => badge.badge._id.toString());
    
    // Check each badge type and award when conditions are met
    const newBadges = [];
    
    // Posts badges
    const postBadges = allBadges.filter(badge => badge.type === 'posts');
    postBadges.forEach(badge => {
      if (!userBadgeIds.includes(badge._id.toString()) && 
          user.stats.postCount >= badge.requirement) {
        newBadges.push({
          badge: badge._id,
          earnedAt: new Date(),
          displayed: true
        });
      }
    });
    
    // Comments badges
    const commentBadges = allBadges.filter(badge => badge.type === 'comments');
    commentBadges.forEach(badge => {
      if (!userBadgeIds.includes(badge._id.toString()) && 
          user.stats.commentCount >= badge.requirement) {
        newBadges.push({
          badge: badge._id,
          earnedAt: new Date(),
          displayed: true
        });
      }
    });
    
    // Likes badges (likes given)
    const likesBadges = allBadges.filter(badge => badge.type === 'likes');
    likesBadges.forEach(badge => {
      if (!userBadgeIds.includes(badge._id.toString()) && 
          user.stats.likesGiven >= badge.requirement) {
        newBadges.push({
          badge: badge._id,
          earnedAt: new Date(),
          displayed: true
        });
      }
    });
    
    // Followers badges
    const followersBadges = allBadges.filter(badge => badge.type === 'followers');
    followersBadges.forEach(badge => {
      if (!userBadgeIds.includes(badge._id.toString()) && 
          user.followers.length >= badge.requirement) {
        newBadges.push({
          badge: badge._id,
          earnedAt: new Date(),
          displayed: true
        });
      }
    });
    
    // Login badges
    const loginBadges = allBadges.filter(badge => badge.type === 'logins');
    loginBadges.forEach(badge => {
      if (!userBadgeIds.includes(badge._id.toString()) && 
          user.stats.loginCount >= badge.requirement) {
        newBadges.push({
          badge: badge._id,
          earnedAt: new Date(),
          displayed: true
        });
      }
    });
    
    // If new badges are awarded, update the user
    if (newBadges.length > 0) {
      // Add the new badges to the user
      await User.findByIdAndUpdate(userId, {
        $push: { badges: { $each: newBadges } },
        $set: { 'stats.lastBadgeCheck': new Date() }
      });
      
      // Return the populated new badge details
      return await Badge.find({ _id: { $in: newBadges.map(badge => badge.badge) } });
    }
    
    // Update the last badge check time
    await User.findByIdAndUpdate(userId, {
      $set: { 'stats.lastBadgeCheck': new Date() }
    });
    
    return [];
    
  } catch (error) {
    console.error('Error in badge service:', error);
    return null;
  }
};

// Increment user activity stats
export const incrementUserStat = async (userId, statType, amount = 1) => {
  const validStats = ['postCount', 'commentCount', 'likesGiven', 'likesReceived', 'loginCount'];
  
  if (!validStats.includes(statType)) {
    throw new Error('Invalid stat type');
  }
  
  try {
    // Update the specified stat and scheduled a badge check
    const updateResult = await User.findByIdAndUpdate(
      userId,
      { $inc: { [`stats.${statType}`]: amount } },
      { new: true }
    );
    
    // Check for badges if we successfully updated the stat
    if (updateResult) {
      // Perform badge check if it's been at least 1 hour since last check
      // This prevents checking too frequently for performance reasons
      const hoursSinceLastCheck = (new Date() - new Date(updateResult.stats.lastBadgeCheck)) / (1000 * 60 * 60);
      
      if (hoursSinceLastCheck >= 1) {
        return await checkAndAwardBadges(userId);
      }
    }
    
    return [];
  } catch (error) {
    console.error(`Error incrementing ${statType}:`, error);
    throw error;
  }
};

// Initialize default badges (call this during server startup)
export const initializeDefaultBadges = async () => {
  try {
    const existingBadges = await Badge.countDocuments();
    
    // Only create default badges if none exist
    if (existingBadges === 0) {
      const defaultBadges = [
        // Post badges
        {
          name: 'First Post',
          description: 'Created your first post',
          icon: '/badges/first-post.png',
          type: 'posts',
          requirement: 1,
          tier: 'bronze'
        },
        {
          name: 'Active Poster',
          description: 'Created 10 posts',
          icon: '/badges/active-poster.png',
          type: 'posts',
          requirement: 10,
          tier: 'silver'
        },
        {
          name: 'Prolific Poster',
          description: 'Created 50 posts',
          icon: '/badges/prolific-poster.png',
          type: 'posts',
          requirement: 50,
          tier: 'gold'
        },
        
        // Comment badges
        {
          name: 'First Comment',
          description: 'Left your first comment',
          icon: '/badges/first-comment.png',
          type: 'comments',
          requirement: 1,
          tier: 'bronze'
        },
        {
          name: 'Active Commenter',
          description: 'Left 20 comments',
          icon: '/badges/active-commenter.png',
          type: 'comments',
          requirement: 20,
          tier: 'silver'
        },
        {
          name: 'Conversation Master',
          description: 'Left 100 comments',
          icon: '/badges/conversation-master.png',
          type: 'comments',
          requirement: 100,
          tier: 'gold'
        },
        
        // Likes badges
        {
          name: 'First Like',
          description: 'Liked your first post',
          icon: '/badges/first-like.png',
          type: 'likes',
          requirement: 1,
          tier: 'bronze'
        },
        {
          name: 'Serial Liker',
          description: 'Liked 50 posts',
          icon: '/badges/serial-liker.png',
          type: 'likes',
          requirement: 50,
          tier: 'silver'
        },
        {
          name: 'Appreciation King',
          description: 'Liked 200 posts',
          icon: '/badges/appreciation-king.png',
          type: 'likes',
          requirement: 200,
          tier: 'gold'
        },
        
        // Followers badges
        {
          name: 'First Follower',
          description: 'Got your first follower',
          icon: '/badges/first-follower.png',
          type: 'followers',
          requirement: 1,
          tier: 'bronze'
        },
        {
          name: 'Rising Star',
          description: 'Reached 10 followers',
          icon: '/badges/rising-star.png',
          type: 'followers',
          requirement: 10,
          tier: 'silver'
        },
        {
          name: 'Influencer',
          description: 'Reached 50 followers',
          icon: '/badges/influencer.png',
          type: 'followers',
          requirement: 50,
          tier: 'gold'
        },
        
        // Login badges
        {
          name: 'Welcome',
          description: 'Logged in for the first time',
          icon: '/badges/welcome.png',
          type: 'logins',
          requirement: 1,
          tier: 'bronze'
        },
        {
          name: 'Regular',
          description: 'Logged in 10 times',
          icon: '/badges/regular.png',
          type: 'logins',
          requirement: 10,
          tier: 'silver'
        },
        {
          name: 'Dedicated',
          description: 'Logged in 50 times',
          icon: '/badges/dedicated.png',
          type: 'logins',
          requirement: 50,
          tier: 'gold'
        }
      ];
      
      await Badge.insertMany(defaultBadges);
      console.log('Default badges created successfully');
    } else {
      console.log('Badges already exist, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing badges:', error);
  }
};

// Update badge visibility (displayed/hidden)
export const updateBadgeVisibility = async (userId, badgeId, displayed) => {
  try {
    const result = await User.findOneAndUpdate(
      { 
        _id: userId, 
        'badges.badge': badgeId 
      },
      { 
        $set: { 'badges.$.displayed': displayed } 
      },
      { new: true }
    );
    
    return result ? true : false;
  } catch (error) {
    console.error('Error updating badge visibility:', error);
    throw error;
  }
}; 