import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{error || 'Product not found'}</p>
            <Link to="/products" className="mt-6 inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Scale for visually representing scores
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-lime-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link to="/products" className="text-green-700 hover:text-green-900 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Product Header */}
          <div className="bg-green-700 p-6 text-white">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="opacity-80">Barcode: {product.barcode}</p>
          </div>

          {/* Product Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Image */}
              <div className="md:col-span-1">
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-full">
                  <img 
                    src={`${API_URL}/${product.imagePath.replace(/\\/g, '/')}`}
                    alt={product.name}
                    className="max-w-full h-auto max-h-80 object-contain rounded"
                  />
                </div>
              </div>

              {/* Product Scores */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Analysis</h2>
                  
                  {/* Nutrition Score */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-semibold text-gray-700">Nutrition Score</h3>
                      <span className="font-bold">{product.analysis.nutritionScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`${getScoreColor(product.analysis.nutritionScore)} h-4 rounded-full`} 
                        style={{ width: `${product.analysis.nutritionScore}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{product.analysis.nutritionEvaluation}</p>
                  </div>

                  {/* Sustainability Score */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-semibold text-gray-700">Sustainability Score</h3>
                      <span className="font-bold">{product.analysis.sustainabilityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`${getScoreColor(product.analysis.sustainabilityScore)} h-4 rounded-full`} 
                        style={{ width: `${product.analysis.sustainabilityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Processing Level */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Processing Level</h3>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                      product.analysis.processingLevel === 'minimally processed' ? 'bg-green-500' :
                      product.analysis.processingLevel === 'processed' ? 'bg-yellow-400' :
                      product.analysis.processingLevel === 'highly processed' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {product.analysis.processingLevel}
                    </span>
                  </div>

                  {/* Overall Recommendation */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Overall Recommendation</h3>
                    <p className="text-green-700">{product.analysis.overallRecommendation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Allergens */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Allergens</h3>
                {product.analysis.allergens.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {product.analysis.allergens.map((allergen, index) => (
                      <li key={index} className="text-red-600">{allergen}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600">No allergens detected</p>
                )}
              </div>

              {/* Additives and Preservatives */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Additives & Preservatives</h3>
                {product.analysis.additives.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {product.analysis.additives.map((additive, index) => (
                      <li key={index} className="text-gray-700">{additive}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600">No additives detected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 