import axios from 'axios';

// Define the API base URL with configurable port
const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout to prevent hanging requests
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  followUser: (userId, currentUserId) => api.post(`/users/${userId}/follow`, { userId: currentUserId }),
  unfollowUser: (userId, currentUserId) => api.post(`/users/${userId}/unfollow`, { userId: currentUserId }),
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  // Badge endpoints
  getUserBadges: (userId) => api.get(`/users/${userId}/badges`),
  updateBadgeVisibility: (userId, badgeId, displayed) => 
    api.put(`/users/${userId}/badges/${badgeId}`, { displayed }),
  checkForNewBadges: (userId) => api.post(`/users/${userId}/check-badges`),
  getAllBadges: () => api.get('/users/badges/all'),
  getDefaultUser: () => {
    const token = localStorage.getItem('firebaseToken');
    if (!token) {
      console.warn('No token found for API call');
      return Promise.reject(new Error('No authentication token available'));
    }
    
    // Try to get user info with token
    return api.get('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(err => {
      console.warn('Error fetching user with token', err);
      
      // If server connection fails completely, return a default offline user
      // This prevents null user errors while offline or during initial setup
      const firebaseUser = JSON.parse(localStorage.getItem('currentUser'));
      if (firebaseUser) {
        return Promise.resolve({
          data: {
            ...firebaseUser,
            profilePicture: firebaseUser.profilePicture || '/src/assets/defaultavatar.png',
            following: firebaseUser.following || []
          }
        });
      }
      
      // If no user at all, reject properly
      return Promise.reject(err);
    });
  },
};

// Post API
export const postAPI = {
  createPost: (postData) => {
    const formData = new FormData();
    formData.append('userId', postData.userId);
    formData.append('caption', postData.caption);
    
    console.log('Creating post with data:', {
      userId: postData.userId,
      caption: postData.caption,
      hasImages: postData.images && postData.images.length > 0,
      imageCount: postData.images ? postData.images.length : 0,
      imageTypes: postData.images ? postData.images.map(img => img.type || 'unknown') : []
    });
    
    if (postData.images && postData.images.length > 0) {
      console.log('Appending images to FormData:', postData.images.length);
      postData.images.forEach((image, index) => {
        formData.append('images', image);
        console.log(`Image ${index} added:`, image.name || 'unnamed file', image.type || 'unknown type');
      });
    }

    if (postData.tags) {
      formData.append('tags', JSON.stringify(postData.tags));
    }

    if (postData.location) {
      formData.append('location', postData.location);
    }

    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      console.log('Server response for post creation:', response.data);
      if (response.data.images && response.data.images.length > 0) {
        console.log('Image URLs returned:', response.data.images);
      }
      return response;
    });
  },
  getFeed: (userId) => {
    const url = userId ? `/posts/feed?userId=${userId}` : '/posts/feed';
    return api.get(url);
  },
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  likePost: (postId, userId) => api.post(`/posts/${postId}/like`, { userId }),
  unlikePost: (postId, userId) => api.post(`/posts/${postId}/unlike`, { userId }),
  addComment: (postId, userId, text) => api.post(`/posts/${postId}/comment`, { userId, text }),
  deletePost: (postId, userId) => api.delete(`/posts/${postId}`, { data: { userId } }),
};

// Create a specialized axios instance for messages
const messageAxiosInstance = axios.create({
  baseURL: `${API_URL}/api/messages`, // Make sure this includes /api prefix
  withCredentials: true,
  headers: {'Content-Type': 'application/json'}
});

// Add interceptor to the message instance
messageAxiosInstance.interceptors.request.use(config => {
  if (config.url?.includes('/conversations/')) {
    config.url = config.url.replace(/([^/]+)$/, match => 
      encodeURIComponent(match)
    );
  }
  return config;
});

// Message API using both base api and specialized instance
export const messageAPI = {
  sendMessage: (senderId, recipientId, text) => messageAxiosInstance.post('', { senderId, recipientId, text }),
  getConversation: (userId, otherUserId) => messageAxiosInstance.get(`/${userId}/${otherUserId}`),
  markAsRead: (senderId, recipientId) => messageAxiosInstance.put(`/read/${senderId}/${recipientId}`),
  getUnreadCount: (userId) => messageAxiosInstance.get(`/unread/${userId}`),
  getConversations: (userId) => messageAxiosInstance.get(`/conversations/${encodeURIComponent(userId)}`),
  updatePrivacySettings: (userId, settings) => messageAxiosInstance.put(`/privacy/${userId}`, settings),
  blockUser: (userId, blockedUserId) => messageAxiosInstance.post(`/block/${userId}`, { blockedUserId }),
  unblockUser: (userId, unblockedUserId) => messageAxiosInstance.post(`/unblock/${userId}`, { unblockedUserId }),
  getBlockedUsers: (userId) => messageAxiosInstance.get(`/blocked/${userId}`),
};