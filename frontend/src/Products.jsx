import React, { useState } from 'react'
import Footer from './Footer'
import NavBar from './components/NavBar';
import GetInfoWithBarcode from './GetInfoWithBarcode';
import GetInfoWithName from './GetInfoWithName';

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
      {/* <div className="min-h-screen flex flex-col"> */}
      <div style={{ backgroundColor: '#d9f8da', zIndex: '-100', width: '100%', position: 'absolute', overflowX: 'hidden' }} className='pt-20'>
        <h1>Remove this when developing the product page</h1>
        {/*Put main body here */}

        {/* Activate this when someone wants to search product with barcode     */}
        <GetInfoWithBarcode />
        <GetInfoWithName />
        <Footer />
      </div>
    </>
  )
}

export default Products
