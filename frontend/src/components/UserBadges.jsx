import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BadgeIcon from './BadgeIcon';
import { userAPI } from '../services/api';
import { FaMedal, FaEye, FaEyeSlash, FaCheck, FaInfoCircle } from 'react-icons/fa';

const UserBadges = ({ userId, isOwnProfile = false }) => {
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [newBadgeMessage, setNewBadgeMessage] = useState(null);
  
  // Fetch user's badges
  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await userAPI.getUserBadges(userId);
        setUserBadges(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching user badges:', err);
        // Don't set an error state, just use an empty array
        setUserBadges([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserBadges();
  }, [userId]);
  
  // Fetch all available badges for the showcase
  useEffect(() => {
    const fetchAllBadges = async () => {
      try {
        const response = await userAPI.getAllBadges();
        setAllBadges(response.data);
      } catch (err) {
        console.error('Error fetching all badges:', err);
      }
    };
    
    if (showAllBadges) {
      fetchAllBadges();
    }
  }, [showAllBadges]);
  
  // Check for new badges (only for user's own profile)
  const checkForNewBadges = async () => {
    if (!isOwnProfile) return;
    
    try {
      setLoading(true);
      const response = await userAPI.checkForNewBadges(userId);
      
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        // Update the user's badge list
        const updatedResponse = await userAPI.getUserBadges(userId);
        setUserBadges(updatedResponse.data);
        
        // Show notification
        setNewBadgeMessage(response.data.message);
        setTimeout(() => setNewBadgeMessage(null), 5000); // Clear after 5 seconds
      } else {
        setNewBadgeMessage('No new badges earned at this time');
        setTimeout(() => setNewBadgeMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error checking for new badges:', err);
      setError('Failed to check for new badges');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle badge visibility
  const toggleBadgeVisibility = async (badge) => {
    if (!isOwnProfile) return;
    
    try {
      const badgeData = userBadges.find(b => 
        b.badge._id === (badge._id || badge.badge._id)
      );
      
      if (!badgeData) return;
      
      await userAPI.updateBadgeVisibility(
        userId,
        badgeData.badge._id,
        !badgeData.displayed
      );
      
      // Update local state
      setUserBadges(prev => prev.map(b => {
        if (b.badge._id === badgeData.badge._id) {
          return { ...b, displayed: !b.displayed };
        }
        return b;
      }));
    } catch (err) {
      console.error('Error toggling badge visibility:', err);
      setError('Failed to update badge visibility');
    }
  };
  
  // Group badges by type for organization
  const groupedBadges = userBadges.reduce((acc, badge) => {
    const type = badge.badge.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(badge);
    return acc;
  }, {});
  
  // Filter displayed badges for profile
  const displayedBadges = userBadges.filter(b => b.displayed);
  
  if (loading && userBadges.length === 0) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error && userBadges.length === 0) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {/* Displayed badges section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold flex items-center">
            <FaMedal className="mr-2 text-yellow-500" /> 
            {isOwnProfile ? 'Your Badges' : 'User Badges'}
          </h3>
          
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={checkForNewBadges}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center disabled:opacity-50"
            >
              <FaCheck className="mr-1" /> Check for new badges
            </motion.button>
          )}
        </div>
        
        {/* New badge notification */}
        <AnimatePresence>
          {newBadgeMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-3"
            >
              {newBadgeMessage}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Displayed badges */}
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
          </div>
        ) : displayedBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {displayedBadges.map((badgeItem) => (
              <BadgeIcon
                key={badgeItem.badge._id}
                badge={badgeItem.badge}
                earnedAt={badgeItem.earnedAt}
                onClick={() => setSelectedBadge(badgeItem)}
                displayOnly={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm mb-4 py-2">
            {isOwnProfile 
              ? "You haven't earned any badges yet or none are displayed." 
              : "This user hasn't earned any badges yet or none are displayed."}
          </div>
        )}
      </div>
      
      {isOwnProfile && (
        <>
          {/* Toggle to show all badges */}
          <div className="border-t pt-3 mt-4">
            <button
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
            >
              {showAllBadges ? (
                <>
                  <FaEyeSlash className="mr-1" /> Hide badge management
                </>
              ) : (
                <>
                  <FaEye className="mr-1" /> Manage your badges
                </>
              )}
            </button>
          </div>
          
          {/* Badge management section */}
          {showAllBadges && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 flex items-center">
                <FaInfoCircle className="mr-1" /> 
                Select badges to show on your profile:
              </h4>
              
              {/* Badges grouped by type */}
              {Object.entries(groupedBadges).map(([type, badges]) => (
                <div key={type} className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 capitalize mb-2">
                    {type} Badges
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badgeItem) => (
                      <BadgeIcon
                        key={badgeItem.badge._id}
                        badge={badgeItem.badge}
                        earnedAt={badgeItem.earnedAt}
                        isSelected={badgeItem.displayed}
                        onClick={() => toggleBadgeVisibility(badgeItem)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Badge showcase - all available badges */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-2">Badge Showcase</h4>
                <p className="text-sm text-gray-600 mb-3">
                  All badges you can earn through contributions to the site:
                </p>
                
                {allBadges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allBadges.map((badge) => {
                      // Check if user has this badge
                      const userHasBadge = userBadges.some(
                        (ub) => ub.badge._id === badge._id
                      );
                      
                      return (
                        <div 
                          key={badge._id} 
                          className={`p-2 rounded border ${
                            userHasBadge 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <BadgeIcon
                              badge={badge}
                              showTooltip={false}
                            />
                            <div className="ml-2">
                              <div className="text-sm font-medium">{badge.name}</div>
                              <div className="text-xs text-gray-500">{badge.description}</div>
                            </div>
                          </div>
                          {userHasBadge ? (
                            <span className="text-xs text-green-600 flex items-center mt-1">
                              <FaCheck className="mr-1" /> Earned
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 mt-1">
                              {badge.requirement} {badge.type} required
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Loading badge showcase...
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Badge details modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-sm m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <BadgeIcon
                  badge={selectedBadge.badge}
                  size="lg"
                  showTooltip={false}
                />
                <div className="ml-4">
                  <h3 className="text-xl font-bold">{selectedBadge.badge.name}</h3>
                  <div className="text-sm text-gray-600">{selectedBadge.badge.description}</div>
                  <div className="mt-1 text-sm">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium uppercase text-white ${
                      selectedBadge.badge.tier === 'bronze' ? 'bg-amber-600' :
                      selectedBadge.badge.tier === 'silver' ? 'bg-gray-400' :
                      selectedBadge.badge.tier === 'gold' ? 'bg-yellow-400' : 'bg-purple-400'
                    }`}>
                      {selectedBadge.badge.tier}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="text-sm text-gray-600 mb-2">
                  Earned on: {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </div>
                
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      toggleBadgeVisibility(selectedBadge);
                      setSelectedBadge(null);
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
                  >
                    {selectedBadge.displayed ? (
                      <>
                        <FaEyeSlash className="mr-2" /> Hide from profile
                      </>
                    ) : (
                      <>
                        <FaEye className="mr-2" /> Show on profile
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserBadges; 