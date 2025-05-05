import axios from 'axios';

// Define the API base URL with configurable port
const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
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
            profilePicture: firebaseUser.profilePicture || 'https://via.placeholder.com/150',
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
  getFeed: () => api.get('/posts/feed'),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  likePost: (postId, userId) => api.post(`/posts/${postId}/like`, { userId }),
  unlikePost: (postId, userId) => api.post(`/posts/${postId}/unlike`, { userId }),
  addComment: (postId, userId, text) => api.post(`/posts/${postId}/comment`, { userId, text }),
  deletePost: (postId, userId) => api.delete(`/posts/${postId}`, { data: { userId } }),
};

// Message API
export const messageAPI = {
  sendMessage: (senderId, recipientId, text) => api.post('/messages', { senderId, recipientId, text }),
  getConversation: (userId, otherUserId) => api.get(`/messages/${userId}/${otherUserId}`),
  markAsRead: (senderId, recipientId) => api.put(`/messages/read/${senderId}/${recipientId}`),
  getUnreadCount: (userId) => api.get(`/messages/unread/${userId}`),
  getConversations: (userId) => api.get(`/messages/conversations/${userId}`),
};

export default {
  user: userAPI,
  post: postAPI,
  message: messageAPI,
}; 