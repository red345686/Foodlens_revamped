import React, { useState } from 'react'
import Footer from './Footer'
import NavBar from './components/NavBar';

const Products = () => {
  const [allProducts, setAllProducts] = useState([
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
    {
      name: 'Fromage blanc nature',
      image: 'ProductSample.jpg',
      score: 4.5,
    },
  ]);
  const [search, setSearch] = useState('');
  const [upload, setUpload] = useState(null);
  const handleSearch = (e) => {
    setSearch(e.target.value);
  }
  const handleUpload = (e) => {
    setUpload(e.target.files[0]);
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the file upload here
    console.log(upload);
  }

  return (
    <>
    <NavBar page='products' />
    <div style={{ backgroundColor: '#d9f8da', zIndex: '-100', width: '99vw', position: 'absolute', overflowX: 'hidden' }} className='mt-12'>
      {/*Put main body here */}
      <Footer />
    </div>
    </>
  )
}

export default Products
