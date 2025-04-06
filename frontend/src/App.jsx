import './App.css'
import About from './About';
import NavBar from './components/NavBar';
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import Products from './Products';
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

function App() {

  const router = Router([
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/products",
      element:
        <>
          {/* <NavBar page='products' /> */}
          <Products />
        </>
    },
    {
      path: "/community",
      element:
        <>
          {/* <NavBar page='community' /> */}
          <Community />
        </>
    },
    {
      path: "/blogs",
      element:
        <>
          <Blogs />
        </>
    },
    {
      path: "/explore",
      element:
        <>
          {/* <NavBar page='explore' /> */}
          <Explore />
        </>
    },
    {
      path: "/login",
      element:
        <>
          <Login />
        </>
    },
    {
      path: "/about",
      element:
        <>
          {/* <NavBar page='about' /> */}
          <About />
        </>
    },
    {
      path: "/report",
      element:
        <>
          {/* <NavBar page='report' /> */}
          <Report />
        </>
    },
    {
      path: "/faqs",
      element:
        <>
          {/* <NavBar page='faqs' /> */}
          <FAQs />
        </>
    },
    {
      path: "/contribute",
      element:
        <>
          {/* <NavBar page='contribute' /> */}
          <Contribute />
        </>
    },
    {
      path: "/teams",
      element:
        <>
          {/* <NavBar page='teams' /> */}
          <Teams />
        </>
    }
  ]);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;