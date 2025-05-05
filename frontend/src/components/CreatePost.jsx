import { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Typography
} from '@mui/material';
import { PhotoCamera, Clear } from '@mui/icons-material';

const CreatePost = () => {
  const { currentUser, createPost, loading } = useCommunity();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      setError('');
      
      // Create a preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Store the raw file object for upload
      setImage(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
  };

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!caption.trim() && !image) {
      setError('Please add a caption or image');
      return;
    }
    
    try {
      // Create an array of images if there is an image
      const images = image ? [image] : [];
      
      await createPost({
        caption,
        images,
      });
      
      // Reset form
      setCaption('');
      setImage(null);
      setImagePreview('');
      setError('');
    } catch (err) {
      setError('Failed to create post');
      console.error(err);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, width: '100%', mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            alt={currentUser?.username}
            src={currentUser?.profilePicture}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Typography variant="subtitle1">
            {currentUser?.username}
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          {imagePreview && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                }}
                onClick={handleRemoveImage}
              >
                <Clear />
              </IconButton>
            </Box>
          )}
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              component="label"
              startIcon={<PhotoCamera />}
              variant="outlined"
            >
              Add Photo
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImageChange}
              />
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || (!caption.trim() && !image)}
            >
              {loading ? <CircularProgress size={24} /> : 'Post'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost; 