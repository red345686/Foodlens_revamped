import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const mockProducts = [
  {
    id: 1,
    name: 'Fromage blanc nature',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    score: 75,
    nutrition: ['A', '3', 'Green']
  },
  {
    id: 2,
    name: 'Greek Yogurt',
    image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    score: 82,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 3,
    name: 'Fresh Salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1968&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    score: 90,
    nutrition: ['A', '1', 'Green']
  },
  {
    id: 4,
    name: 'Whole Wheat Bread',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    score: 70,
    nutrition: ['B', '4', 'Yellow']
  },
  {
    id: 5,
    name: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    score: 88,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 6,
    name: 'Fruit Bowl',
    image: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    score: 95,
    nutrition: ['A', '1', 'Green']
  },
  {
    id: 7,
    name: 'Oatmeal',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    score: 80,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 8,
    name: 'Egg Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    score: 77,
    nutrition: ['B', '3', 'Yellow']
  }
];

const NutriBadge = ({ type }) => {
  if (type === 'A') return <span className="bg-green-600 text-white rounded px-2 py-0.5 text-xs font-bold">A</span>;
  if (type === 'B') return <span className="bg-yellow-400 text-white rounded px-2 py-0.5 text-xs font-bold">B</span>;
  if (type === '1') return <span className="bg-green-200 text-green-900 rounded px-2 py-0.5 text-xs font-bold">1</span>;
  if (type === '2') return <span className="bg-green-300 text-green-900 rounded px-2 py-0.5 text-xs font-bold">2</span>;
  if (type === '3') return <span className="bg-yellow-200 text-yellow-900 rounded px-2 py-0.5 text-xs font-bold">3</span>;
  if (type === '4') return <span className="bg-yellow-400 text-yellow-900 rounded px-2 py-0.5 text-xs font-bold">4</span>;
  if (type === 'Green') return <span className="bg-green-500 text-white rounded px-2 py-0.5 text-xs font-bold">Green</span>;
  if (type === 'Yellow') return <span className="bg-yellow-400 text-white rounded px-2 py-0.5 text-xs font-bold">Yellow</span>;
  return null;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBarcodeImage(e.target.files[0]);
    }
  };

  const handleProductImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProductImage(e.target.files[0]);
    }
  };

  const handleBarcodeUpload = async (e) => {
    e.preventDefault();
    
    if (!barcodeImage) {
      alert('Please select a barcode image to upload');
      return;
    }

    setProcessingStatus('Uploading barcode image...');
    const formData = new FormData();
    formData.append('image', barcodeImage);

    try {
      // Upload barcode image
      const response = await axios.post(`${API_URL}/api/products/upload-barcode-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        setBarcode(response.data.barcode);
        setProcessingStatus('Barcode extracted: ' + response.data.barcode);
      } else {
        setProcessingStatus('Failed to extract barcode');
      }
    } catch (error) {
      console.error('Error uploading barcode image:', error);
      setProcessingStatus('Error: ' + (error.response?.data?.error || 'Failed to upload barcode image'));
    }
  };

  const handleProductAnalysis = async (e) => {
    e.preventDefault();
    
    if (!productImage) {
      alert('Please select a product image to upload');
      return;
    }

    if (!barcode) {
      alert('Please extract or enter a barcode first');
      return;
    }

    setProcessingStatus('Analyzing product...');
    const formData = new FormData();
    formData.append('productImage', productImage);
    formData.append('barcode', barcode);

    try {
      // Upload product image for analysis
      const response = await axios.post(`${API_URL}/api/products/analyze-product`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        setProcessingStatus('Product analyzed successfully!');
        // Refresh the product list
        fetchProducts();
        // Reset the form
        setBarcodeImage(null);
        setProductImage(null);
        setBarcode('');
        setShowUploadForm(false);
      } else {
        setProcessingStatus('Failed to analyze product');
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
      setProcessingStatus('Error: ' + (error.response?.data?.error || 'Failed to analyze product'));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200">
      <NavBar page="products" />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <br />
        <h1 className="text-3xl font-extrabold text-green-900 mb-8 text-center tracking-tight drop-shadow-lg">Explore Products</h1>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Type here to search"
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white shadow-sm"
          />
          <button 
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center text-green-900 shadow-sm"
            onClick={() => setSearchTerm('')}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 6v12m12-12v12M6 18h12" /></svg>
            Clear
          </button>
          <button 
            className="bg-green-700 text-white rounded-lg px-4 py-2 flex items-center shadow-sm"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            {showUploadForm ? 'Hide Upload Form' : 'Upload Your Food'}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-green-900">Upload and Analyze Your Product</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Barcode Image Upload */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Step 1: Upload Barcode</h3>
                <form onSubmit={handleBarcodeUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode Image</label>
                    <input 
                      type="file" 
                      onChange={handleBarcodeImageChange} 
                      className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                      accept="image/*"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                  >
                    Extract Barcode
                  </button>
                </form>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      value={barcode} 
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Enter barcode manually"
                      className="flex-1 rounded-l-lg px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
              
              {/* Product Image Upload */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Step 2: Upload Product Image</h3>
                <form onSubmit={handleProductAnalysis} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <input 
                      type="file" 
                      onChange={handleProductImageChange} 
                      className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                      accept="image/*"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                    disabled={!barcode}
                  >
                    Analyze Product
                  </button>
                </form>
              </div>
            </div>
            
            {/* Processing Status */}
            {processingStatus && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                <p>{processingStatus}</p>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl">
                <p className="text-lg text-gray-600">No products found. Try uploading a new product!</p>
              </div>
            ) : (
              <div className="rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredProducts.map(product => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="bg-white/80 rounded-2xl shadow-lg p-4 flex flex-col items-center transition transform hover:scale-105 hover:shadow-2xl backdrop-blur-md border border-green-100"
                      aria-label={product.name}
                    >
                      <div className="relative w-24 h-24 mb-2 overflow-hidden rounded-xl shadow-md">
                        <img
                          src={`${API_URL}/${product.imagePath.replace(/\\/g, '/')}`}
                          alt={product.name}
                          className="w-full h-full object-cover filter brightness-95 contrast-110 hover:brightness-100 hover:contrast-125 transition"
                          style={{ background: '#e6f4ea' }}
                        />
                        <span className="absolute top-0 right-0 bg-green-700 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow">
                          {product.analysis.nutritionScore}%
                        </span>
                      </div>
                      <div className="text-green-900 font-semibold text-base mb-1 text-center drop-shadow-sm">{product.name}</div>
                      <div className="flex space-x-1 mt-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          product.analysis.processingLevel === 'minimally processed' ? 'bg-green-500 text-white' :
                          product.analysis.processingLevel === 'processed' ? 'bg-yellow-400 text-white' :
                          product.analysis.processingLevel === 'highly processed' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {product.analysis.processingLevel}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
