import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../context/UserContext';
import { messageAPI, userAPI } from '../../services/api';
import { format } from 'date-fns';
import { FaPaperPlane, FaUser } from 'react-icons/fa';

const Messages = () => {
  const { currentUser } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch all conversations when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.user._id);
      markMessagesAsRead(activeConversation.user._id);
    }
  }, [activeConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations(currentUser._id);
      setConversations(response.data);
      
      // Set first conversation as active if there are any
      if (response.data.length > 0 && !activeConversation) {
        setActiveConversation(response.data[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversation(currentUser._id, otherUserId);
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (senderId) => {
    try {
      await messageAPI.markAsRead(senderId, currentUser._id);
      
      // Update unread count in conversations
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.user._id === senderId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        })
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeConversation) return;
    
    try {
      const response = await messageAPI.sendMessage(
        currentUser._id,
        activeConversation.user._id,
        messageText.trim()
      );
      
      // Add new message to the list
      setMessages(prevMessages => [...prevMessages, response.data]);
      
      // Update the conversation with the latest message
      updateConversationWithLatestMessage(
        activeConversation.user._id,
        response.data
      );
      
      // Clear input
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const updateConversationWithLatestMessage = (userId, message) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.user._id === userId) {
          return {
            ...conv,
            latestMessage: {
              text: message.text,
              createdAt: message.createdAt,
              sender: message.sender
            }
          };
        }
        return conv;
      })
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="flex h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>
          
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Follow someone to start chatting</p>
            </div>
          ) : (
            <div>
              {conversations.map(conversation => (
                <div
                  key={conversation.user._id}
                  onClick={() => {
                    setActiveConversation(conversation);
                    markMessagesAsRead(conversation.user._id);
                  }}
                  className={`flex items-center p-3 border-b cursor-pointer transition hover:bg-gray-50 ${
                    activeConversation?.user._id === conversation.user._id
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conversation.user.profilePicture}
                      alt={conversation.user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">
                        {conversation.user.username}
                      </h3>
                      {conversation.latestMessage && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(conversation.latestMessage.createdAt), 'h:mm a')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.latestMessage
                        ? conversation.latestMessage.sender.toString() === currentUser._id
                          ? `You: ${conversation.latestMessage.text}`
                          : conversation.latestMessage.text
                        : 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Messages area */}
        <div className="w-2/3 flex flex-col">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3 border-b flex items-center">
                <img
                  src={activeConversation.user.profilePicture}
                  alt={activeConversation.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="font-medium">{activeConversation.user.username}</h3>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FaUser size={48} className="mb-2 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(message => {
                      const isCurrentUser = message.sender === currentUser._id;
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none border'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                              {format(new Date(message.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <form onSubmit={sendMessage} className="p-3 border-t flex">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className={`bg-blue-500 text-white px-4 py-2 rounded-r-lg flex items-center ${
                    !messageText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                >
                  <FaPaperPlane className="mr-2" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaUser size={64} className="mb-3 text-gray-300" />
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages; 