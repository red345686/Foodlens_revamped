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

  return (
    <Card sx={{ maxWidth: 600, width: '100%', mb: 3, borderRadius: 2 }}>
      <CardHeader
        avatar={
          <Avatar
            alt={post.user?.username}
            src={post.user?.profilePicture}
          />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVert />
          </IconButton>
        }
        title={post.user?.username}
        subheader={formatDate(post.createdAt)}
      />
      
      {post.image && (
        <CardMedia
          component="img"
          height="400"
          image={post.image}
          alt={post.caption}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent>
        <Typography variant="body1">{post.caption}</Typography>
      </CardContent>
      
      <CardActions disableSpacing>
        <IconButton
          aria-label={isLiked ? 'unlike' : 'like'}
          onClick={handleLikeClick}
          color={isLiked ? 'primary' : 'default'}
        >
          {isLiked ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
        </Typography>
        
        <IconButton
          aria-label="comments"
          onClick={() => setExpanded(!expanded)}
          sx={{ ml: 'auto' }}
        >
          <ChatBubbleOutline />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.comments.length}
        </Typography>
      </CardActions>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack spacing={2}>
            {commentsToShow.map((comment, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Avatar
                  alt={comment.user?.username}
                  src={comment.user?.profilePicture}
                  sx={{ width: 32, height: 32 }}
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
              </Box>
            ))}
            
            {post.comments.length > 2 && (
              <Button
                size="small"
                onClick={() => setShowAllComments(!showAllComments)}
                sx={{ alignSelf: 'flex-start' }}
              >
                {showAllComments ? 'Show less' : `View all ${post.comments.length} comments`}
              </Button>
            )}
            
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', mt: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                variant="outlined"
              />
              <IconButton type="submit" disabled={!commentText.trim()}>
                <Send />
              </IconButton>
            </Box>
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default Post; 