import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { postAPI } from '../services/api';
import { useWebSocket } from './WebSocketContext';
import { useUser } from './UserContext';

const API_URL = import.meta.env.VITE_API_URL; // Replace process.env.REACT_APP_API_URL

export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
  const { currentUser, updateProfile } = useUser();
  const [communityUser, setCommunityUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, connected, emitNewPost, emitLikePost, emitCommentPost } = useWebSocket();

  useEffect(() => {
    const syncCommunityUser = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_URL}/community/users/${currentUser._id}`);
          setCommunityUser(response.data);
        } catch {
          const newProfile = await axios.post(`${API_URL}/community/users`, {
            userId: currentUser._id,
            username: currentUser.username
          });
          setCommunityUser(newProfile.data);
        }
      } else {
        setCommunityUser(null);
      }
    };
    syncCommunityUser();
  }, [currentUser]);

  useEffect(() => {
    if (!socket || !connected) return;

    // Add message-related socket listeners
    socket.on('new_message', (message) => {
      setPosts(prev => {
        // Update relevant post's comments
        return prev.map(post => {
          if (post._id === message.postId) {
            return {
              ...post,
              comments: [...post.comments, message]
            };
          }
          return post;
        });
      });
    });

    socket.on('typing', ({ postId, userId }) => {
      // Handle typing indicators
    });

    return () => {
      socket.off('new_message');
      socket.off('typing');
    };
  }, [socket, connected]);

  // Add message fetching functionality
  const fetchMessages = async (postId) => {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/messages`);
      return response.data;
    } catch (err) {
      setError('Failed to load messages');
    }
  };

  // Update context value with message functions
  const contextValue = {
    communityUser,
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost: async (postId) => {
      await postAPI.post(`/posts/${postId}/like`);
      emitLikePost(postId, currentUser._id);
    },
    unlikePost: async (postId) => {
      await postAPI.post(`/posts/${postId}/unlike`);
      emitLikePost(postId, currentUser._id);
    },
    // Update followUser implementation
    followUser: async (userId) => {
      await postAPI.post(`/community/users/${userId}/follow`);
      updateUserFollowing(userId, true);
    },
    unfollowUser: async (userId) => {
      await postAPI.post(`/users/${userId}/unfollow`);
      updateUserFollowing(userId, false);
    },
    canInteract: !!currentUser,
    getAuthStatus: () => !!currentUser
  };

  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used within CommunityProvider');
  return context;
};