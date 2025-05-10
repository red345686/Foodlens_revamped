import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import axios from 'axios';

// Define API URL - use import.meta.env for Vite instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log("Using API URL:", API_URL);

const mockProducts = [
  {
    id: 1,
    name: 'Fromage blanc nature',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1972&q=80',
    score: 70,
    nutrition: ['B', '4', 'Yellow']
  },
  {
    id: 5,
    name: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    score: 88,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 6,
    name: 'Fruit Bowl',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1972&q=80',
    score: 95,
    nutrition: ['A', '1', 'Green']
  },
  {
    id: 7,
    name: 'Oatmeal',
    image: 'https://images.unsplash.com/photo-1517093728432-3c7422e8cfa5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    score: 80,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 8,
    name: 'Egg Sandwich',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1980&q=80',
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
  const [fixingAllProducts, setFixingAllProducts] = useState(false);
  const [fixAllStatus, setFixAllStatus] = useState(null);

  // New states for ingredients analysis
  const [activeTab, setActiveTab] = useState('barcode'); // 'barcode' or 'ingredients'
  const [ingredientsImage, setIngredientsImage] = useState(null);
  const [ingredientsImagePreview, setIngredientsImagePreview] = useState(null);
  const [nutritionImage, setNutritionImage] = useState(null);
  const [nutritionImagePreview, setNutritionImagePreview] = useState(null);
  const [productNameForIngredients, setProductNameForIngredients] = useState('');
  const [manualIngredients, setManualIngredients] = useState('');
  const [ingredientsInputMethod, setIngredientsInputMethod] = useState('image'); // 'image' or 'manual'
  const [imageQualityTips, setImageQualityTips] = useState(false);

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      console.log("Products data received:", response.data);

      // Check image paths in received data
      if (response.data && response.data.length > 0) {
        console.log("First product image path:", response.data[0].imagePath);
        console.log("First product complete:", response.data[0]);
      }

      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if API is unavailable
      console.log("Using mock product data instead");
      setProducts(mockProducts);
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
      console.log(`Starting product analysis for barcode: ${barcode}`);

      // Upload product image for analysis
      const response = await axios.post(`${API_URL}/api/products/analyze-product`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Product analysis response:', response.data);

      if (response.data.status === 'success') {
        setProcessingStatus('Product analyzed successfully!');
        console.log('Analysis successful - product data:', response.data.product);

        // If we have a product ID, navigate to the product detail page
        if (response.data.product && response.data.product._id) {
          // Navigate to the product detail page after a short delay
          setTimeout(() => {
            window.location.href = `/product/${response.data.product._id}`;
          }, 1500);
        } else {
          // Refresh the product list if no ID is returned
          fetchProducts();
        }

        // Reset the form
        setBarcodeImage(null);
        setProductImage(null);
        setBarcode('');
        setShowUploadForm(false);
      } else {
        console.error('Analysis failed:', response.data);
        setProcessingStatus('Failed to analyze product: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to analyze product';
      setProcessingStatus('Error: ' + errorMessage);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to fix all products with missing analysis data
  const handleFixAllProducts = async () => {
    try {
      setFixingAllProducts(true);
      setFixAllStatus({ type: 'info', message: 'Fixing all products...' });

      const response = await axios.post(`${API_URL}/api/products/fix-all-products-analysis`);

      if (response.data.status === 'success') {
        setFixAllStatus({
          type: 'success',
          message: `${response.data.message} Refreshing products...`
        });

        // Refresh products after a short delay
        setTimeout(() => {
          fetchProducts();
          setFixAllStatus({
            type: 'success',
            message: response.data.message
          });
          setFixingAllProducts(false);
        }, 1500);
      } else {
        setFixAllStatus({ type: 'error', message: 'Failed to fix products.' });
        setFixingAllProducts(false);
      }
    } catch (error) {
      console.error('Error fixing all products:', error);
      setFixAllStatus({
        type: 'error',
        message: `Error: ${error.response?.data?.error || 'Failed to fix products'}`
      });
      setFixingAllProducts(false);
    }
  };

  // Helper function to safely access analysis values
  const getAnalysisValue = (product, field, defaultValue) => {
    if (!product?.analysis) return defaultValue;

    const value = product.analysis[field];
    if (value === undefined || value === null) return defaultValue;

    return typeof value === 'number' ? value :
      typeof value === 'string' ? parseFloat(value) || defaultValue :
        defaultValue;
  };

  // Helper function to get the correct image URL
  const getImageUrl = (product, imageType = 'product') => {
    // For debugging
    console.log("Processing image for product:", product.name);

    if (!product) return null;

    // Check if using mock data (which has 'image' property)
    if (product.image) {
      console.log("Using mock image URL:", product.image);
      return product.image;
    }

    // Get the formatted image name based on image type
    let formattedName;
    switch (imageType) {
      case 'product':
        formattedName = product.formattedProductImageName;
        break;
      case 'ingredients':
        formattedName = product.formattedIngredientsImageName;
        break;
      case 'nutrients':
        formattedName = product.formattedNutrientsImageName;
        break;
      default:
        formattedName = null;
    }

    // If we have a formatted name, use it with our new endpoint
    if (formattedName) {
      console.log("Using formatted image name URL:", `${API_URL}/api/products/images/${formattedName}`);
      return `${API_URL}/api/products/images/${formattedName}`;
    }

    // Use the appropriate formatted image name based on image type
    let imagePath;

    switch (imageType) {
      case 'product':
        // Use product photo path or default image path
        imagePath = product.productPhotoPath || product.imagePath;
        break;
      case 'ingredients':
        imagePath = product.ingredientsImagePath;
        break;
      case 'nutrients':
        imagePath = product.nutritionalContentImagePath;
        break;
      default:
        imagePath = product.imagePath;
    }

    // Check if we have an imagePath from the API
    if (imagePath) {
      // If it's already a full URL
      if (imagePath.startsWith('http')) {
        console.log("Using full image URL:", imagePath);
        return imagePath;
      }

      // If it's a relative path
      const fullPath = `${API_URL}/${imagePath.replace(/\\/g, '/')}`;
      console.log("Using constructed image URL:", fullPath);
      return fullPath;
    }

    // Fallback to default image
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
  };

  // New handlers for ingredients analysis
  const handleIngredientsImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setIngredientsImage(selectedFile);

    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIngredientsImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setIngredientsImagePreview(null);
    }
  };

  const handleNutritionImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setNutritionImage(selectedFile);

    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNutritionImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setNutritionImagePreview(null);
    }
  };

  const toggleImageTips = () => {
    setImageQualityTips(!imageQualityTips);
  };

  const toggleIngredientsInputMethod = () => {
    setIngredientsInputMethod(ingredientsInputMethod === "image" ? "manual" : "image");
  };

  const handleManualIngredientsChange = (e) => {
    setManualIngredients(e.target.value);
  };

  const handleProductNameChange = (e) => {
    setProductNameForIngredients(e.target.value);
  };

  const handleIngredientsAnalysis = async (e) => {
    e.preventDefault();

    if (ingredientsInputMethod === "image" && !ingredientsImage) {
      setProcessingStatus('Please upload an image of the ingredients list.');
      return;
    }

    if (ingredientsInputMethod === "manual" && !manualIngredients.trim()) {
      setProcessingStatus('Please enter the ingredients list.');
      return;
    }

    try {
      setProcessingStatus('Analyzing ingredients...');

      if (ingredientsInputMethod === "image") {
        // Process with image upload
        const formData = new FormData();
        formData.append('ingredientsImage', ingredientsImage);
        formData.append('name', productNameForIngredients);

        // Add product photo and nutrition image if available
        if (productImage) {
          formData.append('productPhoto', productImage);
        }

        if (nutritionImage) {
          formData.append('nutritionalContentImage', nutritionImage);
        }

        console.log('Sending request to analyze ingredients from image...');
        const response = await axios.post(`${API_URL}/api/products/analyze-ingredients`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.status === 'success' && response.data.product && response.data.product._id) {
          setProcessingStatus('Ingredients analyzed successfully!');
          console.log('Analysis successful:', response.data);

          // Navigate to the product detail page after a short delay
          setTimeout(() => {
            window.location.href = `/product/${response.data.product._id}`;
          }, 1500);
        } else {
          throw new Error(response.data.error || 'Invalid response from server');
        }
      } else {
        // Process manual ingredients entry
        console.log('Sending request to analyze manually entered ingredients...');
        const formData = new FormData();
        formData.append('name', productNameForIngredients);
        formData.append('ingredients', manualIngredients);

        // Add product photo and nutrition image if available
        if (productImage) {
          formData.append('productPhoto', productImage);
        }

        if (nutritionImage) {
          formData.append('nutritionalContentImage', nutritionImage);
        }

        const response = await axios.post(`${API_URL}/api/products/analyze-manual-ingredients`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.status === 'success' && response.data.product && response.data.product._id) {
          setProcessingStatus('Ingredients analyzed successfully!');
          console.log('Analysis successful:', response.data);

          // Navigate to the product detail page after a short delay
          setTimeout(() => {
            window.location.href = `/product/${response.data.product._id}`;
          }, 1500);
        } else {
          throw new Error(response.data.error || 'Invalid response from server');
        }
      }
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      setProcessingStatus(
        error.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please check if the server is running.'
          : error.message || 'An error occurred while analyzing the ingredients.'
      );
    }
  };

  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    if (!barcode) return;
    setProcessingStatus('Searching for product...');
    try {
      const response = await axios.get(`${API_URL}/api/products/barcode/${barcode}`);
      if (response.data && response.data._id) {
        window.location.href = `/product/${response.data._id}`;
      } else {
        setProcessingStatus('No product found for this barcode.');
      }
    } catch (error) {
      setProcessingStatus('Error searching for product.');
    }
  };

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
          <button
            className={`${fixingAllProducts ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg px-4 py-2 flex items-center shadow-sm transition`}
            onClick={handleFixAllProducts}
            disabled={fixingAllProducts}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            {fixingAllProducts ? 'Fixing...' : 'Fix All Products'}
          </button>
        </div>

        {fixAllStatus && (
          <div className={`mb-4 p-3 rounded-lg ${fixAllStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            fixAllStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
            <p>{fixAllStatus.message}</p>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-green-900">Upload and Analyze Your Product</h2>

            {/* Tabs for different upload methods */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('barcode')}
                  className={`w-1/2 py-3 px-4 text-center font-medium text-sm ${activeTab === 'barcode'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Barcode Scan
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`w-1/2 py-3 px-4 text-center font-medium text-sm ${activeTab === 'ingredients'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Ingredients Analysis
                </button>
              </nav>
            </div>

            {processingStatus && (
              <div className={`p-3 rounded-md mb-4 ${processingStatus.includes('successfully') ? 'bg-green-100 text-green-800' :
                processingStatus.includes('Error') || processingStatus.includes('Failed') || processingStatus.includes('Please') ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                {processingStatus}
              </div>
            )}

            {activeTab === 'barcode' && (
              <div>
                {/* Barcode image upload and scan */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Upload Barcode Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBarcodeImageChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleBarcodeUpload}
                    disabled={!barcodeImage}
                    className={`mt-2 w-full ${!barcodeImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded`}
                  >
                    Scan Barcode
                  </button>
                </div>
                {/* Direct barcode entry and search */}
                <form onSubmit={handleBarcodeSearch}>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Enter Barcode</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Enter or scan barcode"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!barcode}
                    className={`w-full ${!barcode ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white py-3 px-4 rounded-md font-medium`}
                  >
                    Search Product
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productNameForIngredients}
                    onChange={handleProductNameChange}
                    placeholder="Enter product name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex justify-between mb-3">
                  <div className="flex gap-3">
                    <button
                      onClick={toggleIngredientsInputMethod}
                      className="text-green-600 text-xs font-medium underline"
                    >
                      {ingredientsInputMethod === "image"
                        ? "Enter ingredients manually instead"
                        : "Upload image instead"}
                    </button>

                    {ingredientsInputMethod === "image" && (
                      <button
                        onClick={toggleImageTips}
                        className="text-green-600 text-xs font-medium underline"
                      >
                        {imageQualityTips ? "Hide image tips" : "Tips for best results"}
                      </button>
                    )}
                  </div>
                </div>

                {imageQualityTips && ingredientsInputMethod === "image" && (
                  <div className="mt-3 p-3 bg-green-50 rounded-md text-xs text-gray-700 mb-4">
                    <h4 className="font-bold mb-1">For best analysis results:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure text is clearly visible and focused</li>
                      <li>Take the photo in good lighting</li>
                      <li>Capture just the ingredients section</li>
                      <li>Avoid shadows and glare on the package</li>
                      <li>Hold the camera steady and close to the text</li>
                    </ul>
                  </div>
                )}

                {ingredientsInputMethod === "image" ? (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Ingredients Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIngredientsImageChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />

                    {ingredientsImagePreview && (
                      <div className="mt-2 p-2 border border-gray-300 rounded-md">
                        <img
                          src={ingredientsImagePreview}
                          alt="Ingredients preview"
                          className="max-h-40 max-w-full object-contain mx-auto"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Ingredients List</label>
                    <textarea
                      value={manualIngredients}
                      onChange={handleManualIngredientsChange}
                      placeholder="Enter ingredients separated by commas"
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Nutrition Facts Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNutritionImageChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <button
                  onClick={handleIngredientsAnalysis}
                  disabled={ingredientsInputMethod === "image" ? !ingredientsImage : !manualIngredients}
                  className={`w-full ${ingredientsInputMethod === "image" && !ingredientsImage || ingredientsInputMethod === "manual" && !manualIngredients ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white py-3 px-4 rounded-md font-medium`}
                >
                  Analyze Ingredients
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1 duration-200"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img
                    src={getImageUrl(product, 'product')}
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-300 transform hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      console.log("Image failed to load:", e.target.src);
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Health Score Badge */}
                  {product.analysis?.nutritionScore && (
                    <div className="absolute top-2 right-2 bg-white rounded-full h-12 w-12 flex items-center justify-center border-2 border-green-500 shadow-md">
                      <span className="text-lg font-bold text-green-700">
                        {Math.round(getAnalysisValue(product, 'nutritionScore', 0))}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>

                  {product.analysis ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.analysis.nutritionGrade && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.analysis.nutritionGrade === 'A' ? 'bg-green-500 text-white' :
                          product.analysis.nutritionGrade === 'B' ? 'bg-lime-500 text-white' :
                            product.analysis.nutritionGrade === 'C' ? 'bg-yellow-500 text-white' :
                              product.analysis.nutritionGrade === 'D' ? 'bg-orange-500 text-white' :
                                'bg-red-500 text-white'
                          }`}>
                          {product.analysis.nutritionGrade || '?'}
                        </span>
                      )}

                      {product.analysis.processingLevel && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.analysis.processingLevel === 'Unprocessed' ? 'bg-green-100 text-green-800' :
                          product.analysis.processingLevel === 'Minimally processed' ? 'bg-green-200 text-green-800' :
                            product.analysis.processingLevel === 'Processed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {product.analysis.processingLevel}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                        No analysis
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No products found. Try a different search term or add a new product.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
