import React, { useState, useCallback, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaHeart, FaRegHeart, FaComment, FaEllipsisV, FaTrash } from 'react-icons/fa';

// Default avatar URL to use if profilePicture is missing
const DEFAULT_AVATAR = '/src/assets/defaultavatar.png';

// Create a custom comparison function for the memo HOC
// This prevents unnecessary re-renders by doing a deep equality check on post data
const areEqual = (prevProps, nextProps) => {
  // Safety check for null/undefined posts
  if (!prevProps.post || !nextProps.post) return prevProps.post === nextProps.post;
  
  // Always re-render if post ID changes
  if (prevProps.post._id !== nextProps.post._id) return false;
  
  // Check if current user changed
  if (!!prevProps.currentUser !== !!nextProps.currentUser) return false;
  if (prevProps.currentUser && nextProps.currentUser && 
      prevProps.currentUser._id !== nextProps.currentUser._id) return false;
  
  // Check if post content changed
  if (prevProps.post.caption !== nextProps.post.caption) return false;
  
  // Safely check like status
  const prevLikes = prevProps.post.likes || [];
  const nextLikes = nextProps.post.likes || [];
  
  // Check if like status changed (but not position in the array)
  const prevLiked = prevProps.currentUser && 
    prevLikes.includes(prevProps.currentUser._id);
  
  const nextLiked = nextProps.currentUser && 
    nextLikes.includes(nextProps.currentUser._id);
  
  if (prevLiked !== nextLiked) return false;
  
  // Check if likes count changed
  if (prevLikes.length !== nextLikes.length) return false;
  
  // Check if comments count changed
  const prevComments = prevProps.post.comments || [];
  const nextComments = nextProps.post.comments || [];
  if (prevComments.length !== nextComments.length) return false;
  
  // Don't re-render if none of the above changed
  return true;
};

// Memoize the Post component to prevent unnecessary re-renders
const Post = memo(({ post, currentUser, onLike, onComment, onDelete }) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Safely check if post and post properties exist
  if (!post || !post.user) {
    return <div className="bg-white rounded-lg shadow-md p-4">Post data unavailable</div>;
  }
  
  // Ensure likes is always an array
  const likes = post.likes || [];
  
  // Use useCallback to memoize these handlers
  const handleLike = useCallback(() => {
    if (onLike) onLike(post._id);
  }, [onLike, post._id]);

  const handleCommentSubmit = useCallback((e) => {
    e.preventDefault();
    if (comment.trim() && onComment) {
      onComment(post._id, comment);
      setComment('');
    }
  }, [comment, onComment, post._id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this post?') && onDelete) {
      onDelete(post._id);
    }
    setShowOptions(false);
  }, [onDelete, post._id]);

  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  const toggleOptions = useCallback(() => {
    setShowOptions(prev => !prev);
  }, []);

  // Pre-compute values that are used multiple times
  const isPostLiked = useMemo(() => {
    return currentUser && likes.includes(currentUser._id);
  }, [currentUser, likes]);
  
  const isOwnPost = useMemo(() => {
    return currentUser && post.user && post.user._id === currentUser._id;
  }, [currentUser, post.user]);

  // Memoize the post header to prevent re-renders
  const postHeader = useMemo(() => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-3">
        <img 
          src={post.user.profilePicture || DEFAULT_AVATAR} 
          alt={post.user.username || 'User'} 
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_AVATAR;
          }}
        />
        <div>
          <Link to={`/profile/${post.user._id}`} className="font-medium hover:underline text-[#294c25]">
            {post.user.username || 'Anonymous User'}
          </Link>
          {post.location && (
            <p className="text-xs text-gray-500">{post.location}</p>
          )}
        </div>
      </div>
      
      {isOwnPost && (
        <div className="relative">
          <button 
            onClick={toggleOptions}
            className="text-gray-500 hover:text-[#294c25] transition-colors"
          >
            <FaEllipsisV />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                <FaTrash className="mr-2" /> Delete Post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  ), [post.user, post.location, isOwnPost, toggleOptions, showOptions, handleDelete]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      {/* Post header */}
      {postHeader}
      
      {/* Post images */}
      {post.images && post.images.length > 0 && (
        <div className="relative">
          {console.log('Rendering image with src:', post.images[0])}
          <img 
            src={post.images[0] } 
            alt="Post" 
            className="w-full object-cover max-h-96"
            onError={(e) => {
              console.error('Failed to load image:', e.target.src);
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          
          {post.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              +{post.images.length - 1} more
            </div>
          )}
        </div>
      )}
      
      {/* Post actions */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-3">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-1 text-gray-700 transition-colors"
          >
            {isPostLiked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="hover:text-red-500" />
            )}
            <span>{likes.length}</span>
          </button>
          
          <button 
            onClick={toggleComments}
            className="flex items-center space-x-1 text-gray-700 hover:text-[#294c25] transition-colors"
          >
            <FaComment />
            <span>{post.comments ? post.comments.length : 0}</span>
          </button>
        </div>
        
        {/* Caption */}
        <div className="mb-3">
          <span className="font-medium mr-2 text-[#294c25]">{post.user.username || 'Anonymous User'}</span>
          <span className="text-gray-800">{post.caption}</span>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-[#294c25] hover:text-[#1a3317] text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Post date */}
        <p className="text-xs text-gray-500 mb-2">
          {format(new Date(post.createdAt), 'MMM d, yyyy')}
        </p>
        
        {/* Comments section */}
        {showComments && (
          <div className="mt-4 border-t pt-3">
            <h4 className="font-medium mb-2 text-[#294c25]">Comments</h4>
            
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {post.comments.map(comment => (
                  <div key={comment._id || Math.random().toString()} className="flex space-x-2">
                    <img 
                      src={(comment.user && comment.user.profilePicture) || DEFAULT_AVATAR} 
                      alt={(comment.user && comment.user.username) || 'User'} 
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <div className="bg-gray-50 rounded-lg p-2 flex-1 border border-gray-100">
                      {comment.user && (
                        <Link to={`/profile/${comment.user._id}`} className="font-medium text-sm text-[#294c25]">
                          {comment.user.username || 'Anonymous User'}
                        </Link>
                      )}
                      <p className="text-sm text-gray-800">{comment.text}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No comments yet</p>
            )}
            
            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="mt-3 flex">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#294c25]"
                />
                <button
                  type="submit"
                  className="bg-[#294c25] text-white px-4 py-2 rounded-r-lg hover:bg-[#1a3317] transition-colors"
                >
                  Post
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);

// Add display name for debugging in React DevTools
Post.displayName = 'Post';

export default Post;