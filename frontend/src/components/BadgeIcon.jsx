import React, { useState } from 'react';
import { motion } from 'framer-motion';

const tierColors = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-400',
  platinum: 'bg-purple-400'
};

const tierBorders = {
  bronze: 'border-amber-800',
  silver: 'border-gray-600',
  gold: 'border-yellow-600',
  platinum: 'border-purple-600'
};

const BadgeIcon = ({ 
  badge, 
  size = 'md', 
  showTooltip = true,
  onClick = null,
  isSelected = false,
  earnedAt = null,
  displayOnly = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Calculate size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };
  
  if (!badge) return null;
  
  const formattedDate = earnedAt 
    ? new Date(earnedAt).toLocaleDateString() 
    : 'Not yet earned';
    
  // Create a fallback badge color based on badge name if image fails
  const getBadgeInitial = () => {
    return badge.name ? badge.name.charAt(0).toUpperCase() : '?';
  };
  
  return (
    <div className="relative group">
      <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden 
                  border-2 ${isSelected ? 'ring-2 ring-blue-500' : ''} 
                  ${badge.tier ? tierBorders[badge.tier] : 'border-gray-300'}
                  cursor-pointer`}
        onClick={() => {
          if (onClick) onClick(badge);
          if (showTooltip) setShowDetails(!showDetails);
        }}
      >
        <div className={`absolute inset-0 ${badge.tier ? tierColors[badge.tier] : 'bg-gray-200'} opacity-20`}></div>
        
        {imageError ? (
          <div className={`flex items-center justify-center w-full h-full ${badge.tier ? tierColors[badge.tier] : 'bg-gray-300'} text-white font-bold`}>
            {getBadgeInitial()}
          </div>
        ) : (
          <img 
            src={badge.icon || '/badges/default-badge.png'} 
            alt={badge.name} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        
        {displayOnly && (
          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full w-3 h-3 border border-white"></div>
        )}
      </motion.div>
      
      {showTooltip && showDetails && (
        <div className="absolute z-10 -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 w-48 px-3 py-2 bg-white rounded-lg shadow-lg text-sm">
          <div className="font-semibold text-gray-800">{badge.name}</div>
          <div className="text-xs text-gray-600">{badge.description}</div>
          {earnedAt && (
            <div className="text-xs text-gray-500 mt-1">Earned: {formattedDate}</div>
          )}
          <div className="text-xs font-medium mt-1 uppercase">
            <span className={`inline-block px-2 py-0.5 rounded-full ${tierColors[badge.tier]} text-white`}>
              {badge.tier}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeIcon; 