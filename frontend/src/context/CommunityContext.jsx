import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { postAPI } from '../services/api';

const API_URL = 'http://localhost:3000/api';

export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize with default user
  useEffect(() => {
    const fetchDefaultUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/default/user`);
        if (response.data) {
          setCurrentUser(response.data);
          fetchPosts();
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch default user');
        console.error('Error fetching default user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultUser();
  }, []);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts/feed`);
      setPosts(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData) => {
    try {
      setLoading(true);
      // Use the dedicated API service which properly handles FormData for images
      const response = await postAPI.createPost({
        ...postData,
        userId: currentUser._id,
      });
      
      // Add the new post to the beginning of posts array
      setPosts(prevPosts => [response.data, ...prevPosts]);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create post');
      console.error('Error creating post:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Like a post
  const likePost = async (postId) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/like`, {
        userId: currentUser._id,
      });
      
      // Update posts state with the liked post
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...post, likes: [...post.likes, currentUser._id] }
            : post
        )
      );
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to like post');
      console.error('Error liking post:', error);
    }
  };

  // Unlike a post
  const unlikePost = async (postId) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/unlike`, {
        userId: currentUser._id,
      });
      
      // Update posts state with the unliked post
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.filter((id) => id !== currentUser._id),
              }
            : post
        )
      );
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to unlike post');
      console.error('Error unliking post:', error);
    }
  };

  // Comment on a post
  const addComment = async (postId, text) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comment`, {
        userId: currentUser._id,
        text,
      });
      
      // Update posts state with the new comment
      setPosts(
        posts.map((post) => (post._id === postId ? response.data : post))
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add comment');
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Follow a user
  const followUser = async (userId) => {
    try {
      await axios.post(`${API_URL}/users/${userId}/follow`, {
        userId: currentUser._id,
      });
      
      // Update current user state with the new following
      setCurrentUser({
        ...currentUser,
        following: [...currentUser.following, userId],
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to follow user');
      console.error('Error following user:', error);
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId) => {
    try {
      await axios.post(`${API_URL}/users/${userId}/unfollow`, {
        userId: currentUser._id,
      });
      
      // Update current user state with the removed following
      setCurrentUser({
        ...currentUser,
        following: currentUser.following.filter((id) => id !== userId),
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to unfollow user');
      console.error('Error unfollowing user:', error);
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to get user profile');
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  // Get user's posts
  const getUserPosts = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/posts/user/${userId}`);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to get user posts');
      console.error('Error getting user posts:', error);
      throw error;
    }
  };

  // Send a message
  const sendMessage = async (recipientId, text) => {
    try {
      const response = await axios.post(`${API_URL}/messages`, {
        senderId: currentUser._id,
        recipientId,
        text,
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send message');
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Get conversation
  const getConversation = async (otherUserId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/${currentUser._id}/${otherUserId}`
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to get conversation');
      console.error('Error getting conversation:', error);
      throw error;
    }
  };

  // Get conversations list
  const getConversations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/conversations/${currentUser._id}`
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to get conversations');
      console.error('Error getting conversations:', error);
      throw error;
    }
  };

  const contextValue = {
    currentUser,
    posts,
    loading,
    error,
    setError,
    createPost,
    fetchPosts,
    likePost,
    unlikePost,
    addComment,
    followUser,
    unfollowUser,
    getUserProfile,
    getUserPosts,
    sendMessage,
    getConversation,
    getConversations,
  };

  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  );
};

// Custom hook to use the community context
export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}; 