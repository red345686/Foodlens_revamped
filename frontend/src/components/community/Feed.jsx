import React, { useState, useEffect, useContext, useCallback, useMemo, useRef, memo } from 'react';
import { UserContext } from '../../context/UserContext';
import { postAPI } from '../../services/api';
import Post from './Post';
import CreatePost from './CreatePost';
import { Link } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';

// API base URL for images
const API_BASE_URL = 'http://localhost:3000';

// Separate the loading UI to prevent re-renders
const LoadingUI = () => (
  <div className="flex justify-center items-center min-h-[300px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#294c25]"></div>
  </div>
);

// Separate the error UI to prevent re-renders
const ErrorUI = ({ error, onRetry }) => (
  <div className="text-center py-10">
    <p className="text-red-500">{error}</p>
    <button
      onClick={onRetry}
      className="mt-4 px-4 py-2 bg-[#294c25] text-white rounded-md hover:bg-[#1a3317] transition"
    >
      Try Again
    </button>
  </div>
);

// Separate the login UI to prevent re-renders
const LoginUI = () => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-center">
    <p className="text-gray-700 mb-3">Sign in to share your posts with the community</p>
    <div className="flex justify-center space-x-4">
      <Link 
        to="/login" 
        className="px-4 py-2 bg-[#294c25] text-white rounded-md hover:bg-[#1a3317] transition"
      >
        Sign In
      </Link>
      <Link 
        to="/register" 
        className="px-4 py-2 border border-[#294c25] text-[#294c25] rounded-md hover:bg-gray-50 transition"
      >
        Register
      </Link>
    </div>
  </div>
);

// Separate the empty posts UI to prevent re-renders
const EmptyPostsUI = () => (
  <div className="text-center py-10">
    <p className="text-gray-500">No posts yet. Be the first to post!</p>
  </div>
);

// Separate PostsList component to prevent re-renders
const PostsList = React.memo(({ posts, currentUser, onLike, onComment, onDelete }) => {
  if (posts.length === 0) {
    return <EmptyPostsUI />;
  }
  
  return (
    <div className="space-y-6 mt-6">
      {posts.map(post => (
        <Post
          key={post._id}
          post={post}
          currentUser={currentUser}
          onLike={onLike}
          onComment={onComment}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  if (prevProps.posts.length !== nextProps.posts.length) return false;
  if (prevProps.currentUser !== nextProps.currentUser) return false;
  return true;
});

// Feed header component with recommendation explanation
const FeedHeader = memo(({ currentUser }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  
  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    
    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#294c25]">
          {currentUser ? 'For You' : 'Community Feed'}
        </h2>
        <div className="relative">
          <button 
            className="text-gray-500 hover:text-[#294c25]"
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label="Feed information"
          >
            <FaInfoCircle size={18} />
          </button>
          
          {showTooltip && (
            <div 
              ref={tooltipRef}
              className="absolute right-0 top-6 w-72 bg-white shadow-lg rounded-md p-3 z-10 text-sm border"
            >
              <h3 className="font-medium mb-2">How posts are ranked:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><span className="font-medium">Recency:</span> Newer posts appear higher</li>
                <li><span className="font-medium">Engagement:</span> Posts with more likes and comments rank higher</li>
                {currentUser && (
                  <>
                    <li><span className="font-medium">Following:</span> Posts from people you follow are prioritized</li>
                    <li><span className="font-medium">Interactions:</span> Content similar to posts you've engaged with appears more frequently</li>
                  </>
                )}
              </ul>
              <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                Click outside to close
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-1">
        {currentUser 
          ? 'Posts are personalized based on your interests and activity.'
          : 'Popular posts from the community.'}
      </p>
    </div>
  );
});

// Main Feed component
const Feed = () => {
  const { currentUser } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  // Helper function to process posts and fix image URLs
  const processPostData = useCallback((postsData) => {
    return postsData.map(post => {
      // Process image URLs if they exist
      if (post.images && post.images.length > 0) {
        const processedImages = post.images.map(imgUrl => {
          // If the URL is already absolute (starts with http), don't modify it
          if (imgUrl.startsWith('http')) {
            return imgUrl;
          }
          // Otherwise, prepend the API base URL
          return `${API_BASE_URL}${imgUrl}`;
        });
        
        return { ...post, images: processedImages };
      }
      return post;
    });
  }, []);

  // Fetch posts with debounce to prevent multiple calls
  const fetchPosts = useCallback(async () => {
    // Skip if already fetching
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      // Pass current user ID for personalized recommendations
      const response = await postAPI.getFeed(currentUser?._id);
      console.log('Fetched posts:', response.data);
      
      // Process posts to fix image URLs
      const processedPosts = processPostData(response.data);
      setPosts(processedPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      // Reset fetching flag after a small delay to prevent rapid consecutive calls
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 300);
    }
  }, [processPostData, currentUser]);

  useEffect(() => {
    let isMounted = true;
    
    const loadPosts = async () => {
      if (isMounted) {
        await fetchPosts();
      }
    };
    
    loadPosts();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [fetchPosts]);

  const handleNewPost = useCallback((newPost) => {
    console.log('New post created:', newPost);
    
    // Process image URLs in the new post
    let processedPost = newPost;
    if (newPost.images && newPost.images.length > 0) {
      const processedImages = newPost.images.map(imgUrl => {
        if (imgUrl.startsWith('http')) {
          return imgUrl;
        }
        return `${API_BASE_URL}${imgUrl}`;
      });
      processedPost = { ...newPost, images: processedImages };
    }
    
    // Add the processed post to the beginning of the list
    setPosts(prevPosts => [processedPost, ...prevPosts]);
  }, []);

  const handleLike = useCallback((postId) => {
    // Skip if no user is logged in
    if (!currentUser) return;
    
    const post = posts.find(p => p._id === postId);
    if (!post) return;
    
    const postIndex = posts.findIndex(p => p._id === postId);
    const isLiked = post.likes && post.likes.includes(currentUser._id);
    
    // Optimistically update the UI
    setPosts(prevPosts => {
      const newPosts = [...prevPosts];
      const newLikes = isLiked 
        ? post.likes.filter(id => id !== currentUser._id)
        : [...post.likes, currentUser._id];
        
      newPosts[postIndex] = {
        ...post,
        likes: newLikes
      };
      
      return newPosts;
    });
    
    // Make API call in the background
    const processLike = async () => {
      try {
        if (isLiked) {
          await postAPI.unlikePost(postId, currentUser._id);
        } else {
          await postAPI.likePost(postId, currentUser._id);
        }
      } catch (error) {
        console.error('Error processing like:', error);
        // If error, refresh posts to get correct state
        fetchPosts();
      }
    };
    
    processLike();
  }, [currentUser, posts]); // Remove fetchPosts from dependencies

  const handleComment = useCallback((postId, commentText) => {
    // Skip if no user is logged in or empty comment
    if (!currentUser || !commentText.trim()) return;
    
    // Optimistically update UI first
    setPosts(prevPosts => {
      const postIndex = prevPosts.findIndex(post => post._id === postId);
      if (postIndex === -1) return prevPosts;
      
      const newPosts = [...prevPosts];
      const post = newPosts[postIndex];
      
      // Create a new comment with the current user data
      const newComment = {
        _id: Date.now().toString(), // Temporary ID until server responds
        text: commentText,
        user: {
          _id: currentUser._id,
          username: currentUser.username || currentUser.displayName || 'User',
          profilePicture: currentUser.profilePicture || currentUser.photoURL || 'https://via.placeholder.com/150'
        },
        createdAt: new Date().toISOString()
      };
      
      // Add the comment to the post
      newPosts[postIndex] = {
        ...post,
        comments: [...(post.comments || []), newComment]
      };
      
      return newPosts;
    });
    
    // Then update server in background
    const processComment = async () => {
      try {
        await postAPI.addComment(postId, currentUser._id, commentText);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };
    
    processComment();
  }, [currentUser]); // Only depend on currentUser

  const handleDeletePost = useCallback((postId) => {
    // Skip if no user is logged in
    if (!currentUser) return;
    
    // Optimistically update UI first
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    
    // Then delete from server
    const processDelete = async () => {
      try {
        await postAPI.deletePost(postId, currentUser._id);
      } catch (error) {
        console.error('Error deleting post:', error);
        // If error, refresh posts
        fetchPosts();
      }
    };
    
    processDelete();
  }, [currentUser]); // Only depend on currentUser, fetchPosts will be called only on error
  
  // Use explicit conditions rather than early returns to prevent layout shifts
  const showLoading = loading;
  const showError = !loading && error;
  const showContent = !loading && !error;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Create Post section - only visible if logged in and not in error state */}
      {showContent && (
        currentUser ? (
          <CreatePost key="create-post" onPostCreated={handleNewPost} />
        ) : (
          <LoginUI />
        )
      )}
      
      {/* Feed Header with recommendation explanation */}
      {showContent && <FeedHeader currentUser={currentUser} />}
      
      {/* Loading, Error, or Posts */}
      {showLoading && <LoadingUI />}
      
      {showError && <ErrorUI error={error} onRetry={() => fetchPosts()} />}
      
      {showContent && (
        <PostsList 
          posts={posts} 
          currentUser={currentUser}
          onLike={handleLike}
          onComment={handleComment}
          onDelete={handleDeletePost}
        />
      )}
    </div>
  );
};

export default Feed; 