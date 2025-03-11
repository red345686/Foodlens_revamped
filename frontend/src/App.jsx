import './App.css'
import About from './About';
import NavBar from './components/NavBar';
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import Products from './Products';
import Community from './Community';
import Blogs from './Blogs';
import Home from './Home';
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