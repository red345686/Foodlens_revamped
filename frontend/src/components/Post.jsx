import { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  TextField,
  Button,
  Box,
  Collapse,
  Stack
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Send,
  MoreVert
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Create Motion versions of MUI components
const MotionCard = motion(Card);
const MotionAvatar = motion(Avatar);
const MotionIconButton = motion(IconButton);
const MotionCardMedia = motion(CardMedia);
const MotionBox = motion(Box);

const Post = ({ post }) => {
  const { currentUser, likePost, unlikePost, addComment } = useCommunity();
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const isLiked = post.likes.includes(currentUser?._id);
  
  const handleLikeClick = () => {
    if (isLiked) {
      unlikePost(post._id);
    } else {
      likePost(post._id);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(post._id, commentText);
      setCommentText('');
    }
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show limited comments by default
  const commentsToShow = showAllComments
    ? post.comments
    : post.comments.slice(0, 2);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 100 
      }
    }
  };

  const heartVariants = {
    liked: { 
      scale: [1, 1.2, 1], 
      transition: { duration: 0.3 }
    },
    unliked: { 
      scale: 1 
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  const commentItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 100 
      }
    }
  };

  return (
    <MotionCard 
      sx={{ maxWidth: 600, width: '100%', mb: 3, borderRadius: 2 }}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader
        avatar={
          <MotionAvatar
            alt={post.user?.username}
            src={post.user?.profilePicture}
            whileHover={{ scale: 1.1 }}
          />
        }
        action={
          <MotionIconButton 
            aria-label="settings"
            whileHover={{ rotate: 45, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <MoreVert />
          </MotionIconButton>
        }
        title={post.user?.username}
        subheader={formatDate(post.createdAt)}
      />
      
      {post.image && (
        <MotionCardMedia
          component="img"
          height="400"
          image={post.image}
          alt={post.caption}
          sx={{ objectFit: 'cover' }}
          whileHover={imageVariants.hover}
        />
      )}
      
      <CardContent>
        <Typography variant="body1">{post.caption}</Typography>
      </CardContent>
      
      <CardActions disableSpacing>
        <MotionIconButton
          aria-label={isLiked ? 'unlike' : 'like'}
          onClick={handleLikeClick}
          color={isLiked ? 'primary' : 'default'}
          variants={heartVariants}
          animate={isLiked ? 'liked' : 'unliked'}
          whileTap={{ scale: 0.9 }}
        >
          {isLiked ? <Favorite /> : <FavoriteBorder />}
        </MotionIconButton>
        <Typography variant="body2" color="text.secondary">
          {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
        </Typography>
        
        <MotionIconButton
          aria-label="comments"
          onClick={() => setExpanded(!expanded)}
          sx={{ ml: 'auto' }}
          whileHover={{ scale: 1.1, rotate: expanded ? -5 : 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChatBubbleOutline />
        </MotionIconButton>
        <Typography variant="body2" color="text.secondary">
          {post.comments.length}
        </Typography>
      </CardActions>
      
      <AnimatePresence>
        {expanded && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Stack spacing={2}>
                <AnimatePresence>
                  {commentsToShow.map((comment, index) => (
                    <MotionBox 
                      key={index} 
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                      initial="hidden"
                      animate="visible"
                      variants={commentItemVariants}
                      custom={index}
                      exit={{ opacity: 0, x: -10 }}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}
                    >
                      <MotionAvatar
                        alt={comment.user?.username}
                        src={comment.user?.profilePicture}
                        sx={{ width: 32, height: 32 }}
                        whileHover={{ scale: 1.1 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                          {comment.user?.username}
                        </Typography>
                        <Typography variant="body2" component="span">
                          {comment.text}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatDate(comment.createdAt)}
                        </Typography>
                      </Box>
                    </MotionBox>
                  ))}
                </AnimatePresence>
                
                {post.comments.length > 2 && (
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      size="small"
                      onClick={() => setShowAllComments(!showAllComments)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {showAllComments ? 'Show less' : `View all ${post.comments.length} comments`}
                    </Button>
                  </MotionBox>
                )}
                
                <MotionBox 
                  component="form" 
                  onSubmit={handleCommentSubmit} 
                  sx={{ display: 'flex', mt: 2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    variant="outlined"
                  />
                  <MotionIconButton 
                    type="submit" 
                    disabled={!commentText.trim()}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send />
                  </MotionIconButton>
                </MotionBox>
              </Stack>
            </CardContent>
          </Collapse>
        )}
      </AnimatePresence>
    </MotionCard>
  );
};

export default Post; 