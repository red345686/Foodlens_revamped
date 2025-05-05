import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { messageAPI, userAPI } from '../../services/api';
import { FaLock, FaUserSlash, FaShieldAlt, FaUserFriends, FaAngleLeft, FaTimes } from 'react-icons/fa';

const MessageSettings = ({ onClose }) => {
  const { currentUser } = useContext(UserContext);
  const [privacySetting, setPrivacySetting] = useState('everyone');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchSettings();
      fetchBlockedUsers();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const userResponse = await userAPI.getProfile(currentUser._id);
      if (userResponse.data?.messagingPrivacy?.allowMessagesFrom) {
        setPrivacySetting(userResponse.data.messagingPrivacy.allowMessagesFrom);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching privacy settings:', err);
      setError('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getBlockedUsers(currentUser._id);
      setBlockedUsers(response.data.blockedUsers || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
      setError('Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (setting) => {
    try {
      setLoading(true);
      await messageAPI.updatePrivacySettings(currentUser._id, { allowMessagesFrom: setting });
      setPrivacySetting(setting);
      setSuccessMessage('Privacy settings updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setError(null);
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId) => {
    try {
      setLoading(true);
      await messageAPI.unblockUser(currentUser._id, userId);
      setBlockedUsers(blockedUsers.filter(user => user._id !== userId));
      setSuccessMessage('User unblocked successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setError(null);
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Please log in to access settings</p>
      </div>
    );
  }

  const privacyOptions = [
    { value: 'everyone', label: 'Everyone', icon: <FaUserFriends />, description: 'Allow anyone to send you messages' },
    { value: 'followers', label: 'Followers Only', icon: <FaUserFriends />, description: 'Only people who follow you can message you' },
    { value: 'following', label: 'Following Only', icon: <FaUserFriends />, description: 'Only people you follow can message you' },
    { value: 'mutualFollows', label: 'Mutual Connections', icon: <FaUserFriends />, description: 'Only people you follow who also follow you' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-[#294c25] text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="hover:bg-[#1a3317] p-1 rounded"
          >
            <FaAngleLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Message Privacy Settings</h2>
        </div>
        <button 
          onClick={onClose}
          className="hover:bg-[#1a3317] p-1 rounded"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#294c25]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <section className="mb-8">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <FaLock className="text-[#294c25]" /> Who can message you
          </h3>
          
          <div className="space-y-3">
            {privacyOptions.map(option => (
              <div 
                key={option.value}
                onClick={() => updatePrivacySettings(option.value)}
                className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                  privacySetting === option.value 
                    ? 'border-[#294c25] bg-[#eef7ed]' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  privacySetting === option.value 
                    ? 'bg-[#294c25] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {option.icon}
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                  {privacySetting === option.value && (
                    <div className="w-3 h-3 rounded-full bg-[#294c25]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <FaUserSlash className="text-[#294c25]" /> Blocked Users
          </h3>
          
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FaShieldAlt size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">You haven't blocked any users</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map(user => (
                <div 
                  key={user._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center">
                    <img 
                      src={user.profilePicture} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <div className="font-medium">{user.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => unblockUser(user._id)}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessageSettings; 