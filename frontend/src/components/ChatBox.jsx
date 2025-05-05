import { useState, useEffect, useRef } from 'react';
import { useCommunity } from '../context/CommunityContext';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Divider
} from '@mui/material';
import { Send, Close } from '@mui/icons-material';

const ChatBox = ({ user, onClose }) => {
  const { currentUser, sendMessage, getConversation } = useCommunity();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        if (user && currentUser) {
          const conversationData = await getConversation(user._id);
          setMessages(conversationData);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, currentUser, getConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const newMessage = await sendMessage(user._id, messageText);
      setMessages([...messages, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format date for messages
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 320,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        zIndex: 1000
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={user.profilePicture} alt={user.username} />
          <Typography variant="subtitle1">{user.username}</Typography>
        </Box>
        <IconButton size="small" color="inherit" onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'background.default'
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Stack spacing={1}>
            {messages.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 4 }}
              >
                No messages yet. Start a conversation!
              </Typography>
            ) : (
              messages.map((message, index) => {
                const isSentByCurrentUser = message.sender === currentUser._id;
                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '75%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isSentByCurrentUser ? 'primary.light' : 'grey.200',
                        color: isSentByCurrentUser ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">{message.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          opacity: 0.8
                        }}
                      >
                        {formatMessageTime(message.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Box>

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!messageText.trim()}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBox; 