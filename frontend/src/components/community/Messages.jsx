import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../context/UserContext';
import { messageAPI, userAPI } from '../../services/api';
import { format } from 'date-fns';
import { 
  FaPaperPlane, 
  FaUser, 
  FaSearch, 
  FaEllipsisV, 
  FaSmile, 
  FaLock, 
  FaTimes, 
  FaPlus,
  FaCheck,
  FaCheckDouble,
  FaEnvelope,
  FaCog
} from 'react-icons/fa';
import MessageSettings from './MessageSettings';

const Messages = () => {
  const { currentUser } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageRecipients, setNewMessageRecipients] = useState([]);
  const [newMessageSearch, setNewMessageSearch] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageInputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  // Common emojis for quick access
  const quickEmojis = ['😊', '👍', '❤️', '😂', '🙏', '😍', '🔥', '👏'];

  // Fetch all conversations when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      fetchFollowingUsers();
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

  // Handle click outside of emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const fetchFollowingUsers = async () => {
    try {
      const response = await userAPI.getProfile(currentUser._id);
      if (response.data?.following) {
        const followingIds = response.data.following;
        const followingUsers = [];

        for (const userId of followingIds) {
          try {
            const userResponse = await userAPI.getProfile(userId);
            followingUsers.push(userResponse.data);
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }

        setNewMessageRecipients(followingUsers);
      }
    } catch (err) {
      console.error('Error fetching following users:', err);
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
      // Clear any typing indicator
      clearTimeout(typingTimeout);
      setIsTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const startNewConversation = async (recipient) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(
      conv => conv.user._id === recipient._id
    );
    
    if (existingConversation) {
      setActiveConversation(existingConversation);
    } else {
      // Create a new conversation object
      const newConversation = {
        user: recipient,
        latestMessage: null,
        unreadCount: 0
      };
      
      setActiveConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
      setMessages([]);
    }
    
    setShowNewMessageModal(false);
  };

  const updateConversationWithLatestMessage = (userId, message) => {
    setConversations(prevConversations => {
      // Check if the conversation exists
      const conversationExists = prevConversations.some(conv => 
        conv.user._id === userId
      );
      
      if (conversationExists) {
        // Update existing conversation
        return prevConversations.map(conv => {
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
        });
      } else {
        // This shouldn't happen normally, but handle just in case
        return prevConversations;
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    // Set typing indicator
    setIsTyping(true);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    
    setTypingTimeout(newTimeout);
  };

  const addEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecipients = newMessageRecipients.filter(user => 
    user.username.toLowerCase().includes(newMessageSearch.toLowerCase())
  );

  // Format date for messages
  const formatMessageDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'h:mm a'); // Today: show time only
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + format(messageDate, 'h:mm a'); // Yesterday
    } else {
      return format(messageDate, 'MMM d, h:mm a'); // Other dates
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <FaLock className="mx-auto text-gray-400 text-4xl mb-4" />
          <p className="text-gray-600 mb-4">Please log in to access your private messages</p>
          <a 
            href="/community/login" 
            className="px-4 py-2 bg-[#294c25] text-white rounded-md inline-block hover:bg-[#1a3317] transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#294c25]">Private Messages</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#294c25] text-[#294c25] rounded-md hover:bg-[#eef7ed] transition"
          >
            <FaCog size={14} />
            <span>Settings</span>
          </button>
          <button 
            onClick={() => setShowNewMessageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#294c25] text-white rounded-md hover:bg-[#1a3317] transition"
          >
            <FaPlus size={14} />
            <span>New Message</span>
          </button>
        </div>
      </div>
      
      <div className="flex h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-[#294c25]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#294c25]"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No conversations found</p>
                <p className="text-sm mt-2">Start a new message or adjust your search</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.user._id}
                    onClick={() => {
                      setActiveConversation(conversation);
                      markMessagesAsRead(conversation.user._id);
                    }}
                    className={`flex items-center p-3 cursor-pointer transition hover:bg-gray-50 ${
                      activeConversation?.user._id === conversation.user._id
                        ? 'bg-[#eef7ed] border-l-4 border-[#294c25]'
                        : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={conversation.user.profilePicture}
                        alt={conversation.user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-[#294c25] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <h3 className={`font-medium truncate ${conversation.unreadCount > 0 ? 'font-bold' : ''}`}>
                          {conversation.user.username}
                        </h3>
                        {conversation.latestMessage && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(conversation.latestMessage.createdAt), 'h:mm a')}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0 
                          ? 'text-gray-800 font-medium'
                          : 'text-gray-500'
                      }`}>
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
        </div>
        
        {/* Messages area */}
        <div className="w-2/3 flex flex-col">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3 border-b flex items-center justify-between bg-[#f9fbf9]">
                <div className="flex items-center">
                  <img
                    src={activeConversation.user.profilePicture}
                    alt={activeConversation.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-medium">{activeConversation.user.username}</h3>
                    {isTyping && (
                      <span className="text-xs text-[#294c25]">typing...</span>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    className="text-gray-500 p-2 rounded-full hover:bg-gray-100"
                    aria-label="Conversation options"
                  >
                    <FaEllipsisV size={16} />
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-[#f9faf9]">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#294c25]"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <FaUser size={32} className="text-gray-300" />
                    </div>
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, idx) => {
                      const isCurrentUser = message.sender === currentUser._id;
                      const showDate = idx === 0 || 
                        new Date(message.createdAt).toDateString() !== 
                        new Date(messages[idx-1].createdAt).toDateString();
                      
                      return (
                        <React.Fragment key={message._id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                                {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                              </div>
                            </div>
                          )}
                          
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && (
                              <img
                                src={activeConversation.user.profilePicture}
                                alt={activeConversation.user.username}
                                className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                              />
                            )}
                            
                            <div 
                              className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                isCurrentUser 
                                  ? 'bg-[#294c25] text-white rounded-tr-none' 
                                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.text}</p>
                              <div className={`text-xs mt-1 flex justify-end items-center gap-1 ${
                                isCurrentUser ? 'text-[#c0d8bb]' : 'text-gray-500'
                              }`}>
                                <span>{formatMessageDate(message.createdAt)}</span>
                                {isCurrentUser && (
                                  message.read 
                                    ? <FaCheckDouble size={12} /> 
                                    : <FaCheck size={12} />
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-3 border-t bg-white">
                <form onSubmit={sendMessage} className="flex items-end">
                  <div className="relative flex-1">
                    <textarea
                      ref={messageInputRef}
                      value={messageText}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="w-full border rounded-2xl px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#294c25] max-h-32 min-h-[2.5rem] resize-y"
                      rows={Math.min(4, Math.max(1, messageText.split('\n').length))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                    <div className="absolute right-3 bottom-2">
                      <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-gray-500 hover:text-[#294c25]"
                      >
                        <FaSmile size={20} />
                      </button>
                    </div>
                    
                    {showEmojiPicker && (
                      <div 
                        ref={emojiPickerRef}
                        className="absolute bottom-12 right-0 bg-white p-3 rounded-lg shadow-lg z-10 border"
                      >
                        <div className="grid grid-cols-8 gap-2">
                          {quickEmojis.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => addEmoji(emoji)}
                              className="text-xl hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className={`ml-2 bg-[#294c25] text-white p-2 rounded-full flex items-center justify-center w-12 h-12 ${
                      !messageText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a3317]'
                    }`}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-[#f9faf9] text-gray-500">
              <div className="w-24 h-24 rounded-full bg-[#eef7ed] flex items-center justify-center mb-4">
                <FaEnvelope size={48} className="text-[#294c25]" />
              </div>
              <p className="text-lg font-medium">Your Messages</p>
              <p className="text-sm mt-2 text-center max-w-xs">
                Send private messages to your friends and connections
              </p>
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#294c25] text-white rounded-md hover:bg-[#1a3317] transition"
              >
                <FaPlus size={14} />
                <span>New Message</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">New Message</h3>
              <button 
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for people you follow..."
                  value={newMessageSearch}
                  onChange={(e) => setNewMessageSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#294c25]"
                />
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {filteredRecipients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No users found</p>
                    <p className="text-sm mt-1">Follow someone to start a conversation</p>
                  </div>
                ) : (
                  filteredRecipients.map(user => (
                    <div 
                      key={user._id}
                      onClick={() => startNewConversation(user)}
                      className="flex items-center p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
                    >
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.fullName || user.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <MessageSettings onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
};

export default Messages; 