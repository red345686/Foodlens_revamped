import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Initialize socket connection
  useEffect(() => {
    // Create socket connection
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
      
      // Join user-specific room if authenticated
      if (user?.uid) {
        newSocket.emit('join', user.uid);
      }
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    });
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Re-join rooms when user changes
  useEffect(() => {
    if (socket && connected && user?.uid) {
      socket.emit('join', user.uid);
    }
  }, [socket, connected, user]);
  
  // Helper functions for common socket operations
  const emitNewPost = (post) => {
    if (socket && connected) {
      socket.emit('new_post', post);
    }
  };
  
  const emitLikePost = (postId, userId) => {
    if (socket && connected) {
      socket.emit('like_post', { postId, userId });
    }
  };
  
  const emitCommentPost = (postId, comment) => {
    if (socket && connected) {
      socket.emit('comment_post', { postId, comment });
    }
  };
  
  const emitSendMessage = (senderId, recipientId, message) => {
    if (socket && connected) {
      socket.emit('send_message', { senderId, recipientId, message });
    }
  };
  
  const emitTyping = (senderId, recipientId) => {
    if (socket && connected) {
      socket.emit('typing', { senderId, recipientId });
    }
  };
  
  return (
    <WebSocketContext.Provider value={{
      socket,
      connected,
      emitNewPost,
      emitLikePost,
      emitCommentPost,
      emitSendMessage,
      emitTyping
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};