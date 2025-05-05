import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { userAPI, postAPI } from '../../services/api';
import Post from './Post';
import { FaUserPlus, FaUserMinus, FaEnvelope, FaUsers } from 'react-icons/fa';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser, followUser, unfollowUser } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile(userId);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await postAPI.getUserPosts(userId);
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const handleFollow = async () => {
    try {
      await followUser(userId);
      // Update the profile to reflect the new follower
      setProfile(prev => ({
        ...prev,
        followers: [...prev.followers, currentUser._id]
      }));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(userId);
      // Update the profile to reflect the removed follower
      setProfile(prev => ({
        ...prev,
        followers: prev.followers.filter(id => id !== currentUser._id)
      }));
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      if (!currentUser) return;
      
      const isLiked = posts.find(post => post._id === postId)?.likes.includes(currentUser._id);
      
      if (isLiked) {
        await postAPI.unlikePost(postId, currentUser._id);
      } else {
        await postAPI.likePost(postId, currentUser._id);
      }
      
      // Update the posts state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const updatedLikes = isLiked
              ? post.likes.filter(id => id !== currentUser._id)
              : [...post.likes, currentUser._id];
            
            return { ...post, likes: updatedLikes };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (postId, commentText) => {
    try {
      if (!currentUser || !commentText.trim()) return;
      
      const response = await postAPI.addComment(postId, currentUser._id, commentText);
      
      // Update the posts state with the new comment
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return response.data;
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      if (!currentUser) return;
      
      await postAPI.deletePost(postId, currentUser._id);
      
      // Remove the deleted post from state
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const isFollowing = profile?.followers.includes(currentUser?._id);
  const isOwnProfile = currentUser?._id === userId;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error || 'User not found'}</p>
        <Link
          to="/community"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-32"></div>
        <div className="p-6 relative">
          <img
            src={profile.profilePicture}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-white absolute -top-12"
          />
          
          <div className="mt-14 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-gray-600">{profile.bio || 'No bio yet'}</p>
              
              <div className="flex space-x-4 mt-3">
                <div className="text-center">
                  <span className="font-bold">{profile.following.length}</span>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
                <div className="text-center">
                  <span className="font-bold">{profile.followers.length}</span>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <span className="font-bold">{posts.length}</span>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!isOwnProfile && (
                <>
                  {isFollowing ? (
                    <button
                      onClick={handleUnfollow}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                      <FaUserMinus className="mr-2" />
                      <span>Unfollow</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      <FaUserPlus className="mr-2" />
                      <span>Follow</span>
                    </button>
                  )}
                  
                  <Link
                    to={`/messages/${userId}`}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                  >
                    <FaEnvelope className="mr-2" />
                    <span>Message</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-t flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'posts'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'followers'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'following'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Following
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      {activeTab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <FaUsers size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <Post
                  key={post._id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onComment={handleComment}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {activeTab === 'followers' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="font-semibold text-lg mb-4">Followers</h2>
          
          {profile.followers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No followers yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.followers.map(follower => (
                <Link
                  key={follower._id}
                  to={`/profile/${follower._id}`}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={follower.profilePicture}
                    alt={follower.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-medium">{follower.username}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'following' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="font-semibold text-lg mb-4">Following</h2>
          
          {profile.following.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">Not following anyone yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.following.map(following => (
                <Link
                  key={following._id}
                  to={`/profile/${following._id}`}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={following.profilePicture}
                    alt={following.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-medium">{following.username}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 