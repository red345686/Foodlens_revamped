import './App.css'
import About from './About';
import NavBar from './components/NavBar';
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import Products from './Products';
import ProductDetail from './ProductDetail';
import Community from './Community';
import Blogs from './Blogs';
import Home from './Home';
import Login from './Login';
import Explore from './Explore';
import Report from './components/Report';
import FAQs from './FAQs';
import { auth } from './firebase';
import Contribute from './Contribute';
import Teams from './Teams';
import { AuthProvider } from './AuthContext';
import Profile from './Profile';
import Contact from './Contact';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { WebSocketProvider } from './context/WebSocketContext';

// A wrapper component for pages to apply consistent transitions
const TransitionWrapper = ({ children, page }) => {
  return (
    <PageTransition>
      {page !== 'home' && <NavBar page={page} />}
      {children}
    </PageTransition>
  );
};

function App() {
  const router = Router([
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/products",
      element: <TransitionWrapper page='products'><Products /></TransitionWrapper>
    },
    {
      path: "/product/:id",
      element: <TransitionWrapper page='products'><ProductDetail /></TransitionWrapper>
    },
    {
      path: "/community/*",
      element: <TransitionWrapper page='community'><Community /></TransitionWrapper>
    },
    {
      path: "/blogs",
      element: <TransitionWrapper page='blogs'><Blogs /></TransitionWrapper>
    },
    {
      path: "/explore",
      element: <TransitionWrapper page='explore'><Products /></TransitionWrapper>
    },
    {
      path: "/login",
      element: <TransitionWrapper page='login'><Login /></TransitionWrapper>
    },
    {
      path: "/about",
      element: <TransitionWrapper page='about'><About /></TransitionWrapper>
    },
    {
      path: "/report",
      element: <TransitionWrapper page='report'><Report /></TransitionWrapper>
    },
    {
      path: "/faqs",
      element: <TransitionWrapper page='faqs'><FAQs /></TransitionWrapper>
    },
    {
      path: "/contribute",
      element: <TransitionWrapper page='contribute'><Contribute /></TransitionWrapper>
    },
    {
      path: "/teams",
      element: <TransitionWrapper page='teams'><Teams /></TransitionWrapper>
    },
    {
      path: "/profile",
      element: <TransitionWrapper page='profile'><Profile /></TransitionWrapper>
    },
    {
      path: "/contact",
      element: <TransitionWrapper page='contact'><Contact /></TransitionWrapper>
    },
    {
      path: "/chatbot",
      element: <TransitionWrapper page='chatbot'><Contact /></TransitionWrapper>
    }
  ]);
  
  return (
    <AuthProvider>
      <WebSocketProvider>
        <AnimatePresence mode="wait">
          <RouterProvider router={router} />
        </AnimatePresence>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;