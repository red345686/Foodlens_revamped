import React, { useState, useCallback, memo, useMemo, useContext, useLayoutEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import { useAuth } from './AuthContext';
import Feed from './components/community/Feed';
import ProfilePage from './components/community/ProfilePage';
import Messages from './components/community/Messages';
import Login from './components/community/Login';
import Register from './components/community/Register';
import NavBar from './components/NavBar';
import { FaHome, FaEnvelope, FaUser, FaArrowLeft } from 'react-icons/fa';

// Memoize navigation links to prevent re-renders
const TabLinks = memo(({ location, handleProfileClick }) => (
  <div className="flex space-x-6">
    <Link
      to="/community"
      className={`text-sm font-medium ${location.pathname === '/community'
        ? 'text-[#294c25] border-b-2 border-[#294c25]'
        : 'text-gray-500 hover:text-[#294c25]'
        }`}
    >
      Feed
    </Link>
    <Link
      to="/community/messages"
      className={`text-sm font-medium ${location.pathname.includes('/messages')
        ? 'text-[#294c25] border-b-2 border-[#294c25]'
        : 'text-gray-500 hover:text-[#294c25]'
        }`}
    >
      Messages
    </Link>
  </div>
));

// Memoize mobile navigation to prevent re-renders
const MobileNav = memo(({ location, handleProfileClick }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10" style={{ height: '60px' }}>
    <div className="flex justify-around h-full">
      <Link
        to="/community"
        className={`flex flex-col items-center py-2 ${location.pathname === '/community'
          ? 'text-[#294c25]'
          : 'text-gray-500'
          }`}
      >
        <FaHome size={24} />
        <span className="text-xs mt-1">Feed</span>
      </Link>

      <Link
        to="/community/messages"
        className={`flex flex-col items-center py-2 ${location.pathname.includes('/messages')
          ? 'text-[#294c25]'
          : 'text-gray-500'
          }`}
      >
        <FaEnvelope size={24} />
        <span className="text-xs mt-1">Messages</span>
      </Link>

      <Link
        to="/profile"
        onClick={handleProfileClick}
        className="flex flex-col items-center py-2 text-gray-500"
      >
        <FaUser size={24} />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  </div>
));

// Separate protected route component with optimized rendering
const ProtectedRoute = memo(({ children }) => {
  const { user } = useAuth(); // From main app's AuthContext
  const location = useLocation();

  if (!user && !location.pathname.includes('/login') && !location.pathname.includes('/register')) {
    return <Navigate to="/community/login" replace />;
  }

  return children;
});

const Community = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialRender, setInitialRender] = useState(true);

  // Use layout effect to prevent initial flickering
  useLayoutEffect(() => {
    if (initialRender) {
      setInitialRender(false);
    }
  }, [initialRender]);

  // Memoize handler to prevent re-renders
  const handleProfileClick = useCallback((e) => {
    if (location.pathname.includes('/profile/me')) {
      e.preventDefault();
      navigate('/profile');
    }
  }, [location.pathname, navigate]);

  // Pre-defined header component with stable dimensions
  const Header = useMemo(() => (
    <header className="bg-white shadow-sm pt-16" style={{ height: '110px' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <FaArrowLeft className="text-[#294c25] hover:text-[#1a3317] transition-colors" />
            </Link>
            <h1 className="text-2xl font-bold text-[#294c25]">FoodLens Community</h1>
          </div>
        </div>
      </div>
    </header>
  ), []);

  // If it's the initial render, use a placeholder to maintain dimensions
  if (initialRender) {
    return (
      <div className="bg-gray-50 min-h-screen pb-10">
        <div style={{ height: '64px' }} /> {/* NavBar placeholder */}
        <div style={{ height: '110px' }} /> {/* Header placeholder */}
        <main className="max-w-6xl mx-auto px-4 pt-6 pb-16 md:pb-6" style={{ minHeight: '400px' }} />
        <div className="md:hidden" style={{ height: '60px' }} /> {/* Mobile nav placeholder */}
      </div>
    );
  }

  return (
    <UserProvider>
      <div className="bg-gray-50 min-h-screen pb-10">
        {/* NavBar */}
        <NavBar page="community" />

        {/* Community Header */}
        {Header}

        {/* Navigation tabs - Only show if authenticated */}
        <UserContext.Consumer>
          {(contextValue) => {
            if (!contextValue) return null; // Guard against undefined context
            const { currentUser } = contextValue;
            return currentUser && (
              <>
                <div className="hidden md:flex justify-center mt-2">
                  <TabLinks location={location} handleProfileClick={handleProfileClick} />
                </div>
                <MobileNav location={location} handleProfileClick={handleProfileClick} />
              </>
            );
          }}
        </UserContext.Consumer>

        {/* Main content with fixed height container */}
        <main className="max-w-6xl mx-auto px-4 pt-6 pb-16 md:pb-6 min-h-[400px]">
          <Routes>
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - loading Feed with key to force clean mount */}
            <Route path="/" element={
              <ProtectedRoute>
                <Feed key={`feed-${location.pathname}`} />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <ProfilePage key={`profile-${location.pathname}`} />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages key={`messages-general`} />
              </ProtectedRoute>
            } />
            <Route path="/messages/:userId" element={
              <ProtectedRoute>
                <Messages key={`messages-${location.pathname}`} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
};

export default memo(Community);
