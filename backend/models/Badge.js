import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // URL to badge icon
  type: { 
    type: String, 
    required: true, 
    enum: ['posts', 'comments', 'likes', 'followers', 'logins', 'special'] 
  },
  requirement: { 
    type: Number, 
    required: true // Number of actions required to earn the badge
  },
  tier: { 
    type: String, 
    required: true, 
    enum: ['bronze', 'silver', 'gold', 'platinum'] 
  },
  createdAt: { type: Date, default: Date.now }
});

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge; 