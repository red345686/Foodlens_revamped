import React, { useState, useContext, useCallback, memo, useRef, useEffect, useMemo } from 'react';
import { UserContext } from '../../context/UserContext';
import { postAPI } from '../../services/api';
import { FaImage, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

// Default avatar to use if user has no profile picture
const DEFAULT_AVATAR = '/default-profile.png';

// Create a completely isolated form component that won't re-render when parent changes
const PostForm = memo(({ currentUser, onSubmit, onCancel }) => {
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  // Focus the textarea when the form appears
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Cleanup image previews when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      // Revoke all object URLs when component unmounts
      imagePreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreview]);

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Preview images
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newImagePreviews]);
    
    // Store raw file objects for upload
    setImages(prev => [...prev, ...files]);
  }, []);

  const removeImage = useCallback((index) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    
    setImagePreview(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // Free memory
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!caption.trim()) {
      setError('Caption is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      await onSubmit({
        caption,
        images,
        tags: tagArray,
        location: location.trim() || undefined
      });
      
      // Don't reset the form - parent component will unmount this form
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.error || 'Failed to create post');
      setLoading(false);
    }
  }, [caption, images, location, tags, onSubmit]);

  const displayName = currentUser?.displayName || currentUser?.username || currentUser?.email?.split('@')[0] || 'User';
  const profilePic = currentUser?.profilePicture || currentUser?.photoURL || DEFAULT_AVATAR;

  return (
    <form onSubmit={handleSubmit} className="w-full flex-1">
      <textarea
        ref={textareaRef}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={`What's on your mind, ${displayName}?`}
        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-none"
      />
      
      {/* Image previews */}
      {imagePreview.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {imagePreview.map((src, index) => (
            <div key={index} className="relative">
              <img 
                src={src} 
                alt="Preview" 
                className="w-24 h-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full p-1"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex space-x-2">
          <label className="cursor-pointer text-gray-700 flex items-center space-x-1 hover:text-blue-500">
            <FaImage />
            <span>Photo</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          
          <div className="relative">
            <button
              type="button"
              className="text-gray-700 flex items-center space-x-1 hover:text-blue-500"
            >
              <FaMapMarkerAlt />
              <span>Location</span>
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="border rounded px-2 py-1 text-sm"
          />
          
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="border rounded px-2 py-1 text-sm"
          />
          
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-gray-500 hover:text-gray-700 rounded"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || !caption.trim()}
            className={`px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
              loading || !caption.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if currentUser changes (which should be rare)
  return prevProps.currentUser?._id === nextProps.currentUser?._id;
});

// PostPrompt component - only shows the prompt to create a post
const PostPrompt = memo(({ currentUser, onClick }) => {
  const displayName = currentUser?.displayName || currentUser?.username || currentUser?.email?.split('@')[0] || 'User';
  const profilePic = currentUser?.profilePicture || currentUser?.photoURL || DEFAULT_AVATAR;
  
  // We create a memoized version of the avatar to prevent re-rendering
  const avatar = useMemo(() => (
    <img 
      src={profilePic}
      alt={displayName} 
      className="w-10 h-10 rounded-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_AVATAR;
      }}
    />
  ), [profilePic, displayName]);
  
  return (
    <div className="flex items-start space-x-3 cursor-pointer" onClick={onClick}>
      {avatar}
      <div className="bg-gray-100 rounded-full py-2 px-4 text-gray-500 flex-1">
        What's on your mind, {displayName}?
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if currentUser ID, profilePicture or displayName changes
  return (
    prevProps.currentUser?._id === nextProps.currentUser?._id &&
    prevProps.currentUser?.profilePicture === nextProps.currentUser?.profilePicture &&
    prevProps.currentUser?.photoURL === nextProps.currentUser?.photoURL &&
    (prevProps.currentUser?.displayName || prevProps.currentUser?.username) === 
    (nextProps.currentUser?.displayName || nextProps.currentUser?.username)
  );
});

// Memoize the CreatePost component
const CreatePost = ({ onPostCreated }) => {
  const { currentUser } = useContext(UserContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [key, setKey] = useState(0); // Force re-render when form is closed and reopened

  // If there's no current user, don't render anything
  if (!currentUser) return null;

  // Handler for submitting a post
  const handleSubmitPost = useCallback(async (postData) => {
    try {
      console.log("Submitting post data:", {
        caption: postData.caption,
        hasImages: postData.images && postData.images.length > 0,
        imageCount: postData.images ? postData.images.length : 0,
        imageTypes: postData.images ? postData.images.map(img => typeof img === 'object' ? (img.type || 'File object') : typeof img) : []
      });
      
      const formData = {
        userId: currentUser._id,
        ...postData
      };
      
      const response = await postAPI.createPost(formData);
      console.log("Post created successfully:", response.data);
      
      // Only call onPostCreated if it exists
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      
      // Close the form and reset key
      setIsExpanded(false);
      setKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }, [currentUser, onPostCreated]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {!isExpanded ? (
        <PostPrompt 
          currentUser={currentUser} 
          onClick={() => setIsExpanded(true)}
        />
      ) : (
        <div className="flex items-start space-x-3">
          <img 
            src={currentUser.profilePicture || currentUser.photoURL || DEFAULT_AVATAR}
            alt={currentUser.displayName || currentUser.username || 'User'} 
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          <PostForm
            key={key}
            currentUser={currentUser}
            onSubmit={handleSubmitPost}
            onCancel={() => setIsExpanded(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CreatePost; 