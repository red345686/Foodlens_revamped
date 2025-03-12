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
function App() {

  const router = Router([
    {
      path: "/",
      element:
        <>
          <NavBar />
          <Home />
        </>
    },
    {
      path: "/products",
      element:
        <>
          <NavBar />
          <Products />
        </>
    },
    {
      path: "/community",
      element:
        <>
          <NavBar />
          <Community />
        </>
    },
    {
      path: "/blogs",
      element:
        <>
          <NavBar />
          <Blogs />
        </>
    },
    {
      path: "/explore",
      element:
        <>
          <NavBar />
          <Explore />
        </>
    },
    {
      path: "/login",
      element:
        <>
          <NavBar />
          <Login />
        </>
    },
    {
      path: "/about",
      element:
        <>
          <NavBar />
          <About />
        </>
    }
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;