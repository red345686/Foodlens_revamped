import { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Skeleton
} from '@mui/material';

const UserCard = ({ user, onMessageClick }) => {
  const { currentUser, followUser, unfollowUser } = useCommunity();
  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following?.includes(user?._id)
  );
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user._id);
        setIsFollowing(false);
      } else {
        await followUser(user._id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={50} height={50} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={36} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user.profilePicture}
          alt={user.username}
          sx={{ width: 50, height: 50 }}
        />
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.bio || 'No bio available'}
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant={isFollowing ? 'outlined' : 'contained'}
            size="small"
            disabled={loading}
            onClick={handleFollowToggle}
            sx={{ minWidth: 80 }}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          
          {isFollowing && (
            <Button
              variant="text"
              size="small"
              onClick={() => onMessageClick(user)}
              sx={{ mt: 1, minWidth: 80 }}
            >
              Message
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard; 