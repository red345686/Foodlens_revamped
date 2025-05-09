import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import axios from 'axios';

// Use Vite's import.meta.env for environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get the correct image URL
const getImageUrl = (product, imageType = 'product') => {
  if (!product) return null;

  // Check if using mock data (which has 'image' property)
  if (product.image) {
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
      return imagePath;
    }

    // If it's a relative path
    const fullPath = `${API_URL}/${imagePath.replace(/\\/g, '/')}`;
    return fullPath;
  }

  // Fallback to default image
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('product'); // 'product' or 'ingredients'
  const [fixingAnalysis, setFixingAnalysis] = useState(false);
  const [fixMessage, setFixMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        console.log("Product data received:", response.data);

        if (response.data.analysis) {
          console.log("Product analysis data details:", {
            nutritionScore: response.data.analysis.nutritionScore,
            nutritionScoreType: typeof response.data.analysis.nutritionScore,
            sustainabilityScore: response.data.analysis.sustainabilityScore,
            sustainabilityScoreType: typeof response.data.analysis.sustainabilityScore,
            hasAnalysis: !!response.data.analysis,
            processingLevel: response.data.analysis.processingLevel
          });
        } else {
          console.log("No analysis data found in the product!");
        }

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

  // Add debug log when product state changes
  useEffect(() => {
    if (product && product.analysis) {
      console.log("Product state updated with analysis:", {
        nutritionScore: product.analysis.nutritionScore,
        nutritionScoreType: typeof product.analysis.nutritionScore,
        sustainabilityScore: product.analysis.sustainabilityScore,
        sustainabilityScoreType: typeof product.analysis.sustainabilityScore
      });
    }
  }, [product]);

  // Add function to safely access analysis data
  const getAnalysisValue = (product, field, defaultValue) => {
    if (!product || !product.analysis) return defaultValue;

    const value = product.analysis[field];
    if (value === undefined || value === null) return defaultValue;

    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
  };

  // Scale for visually representing scores with ensured numeric values
  const getScoreColor = (score) => {
    const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
    if (numScore >= 80) return 'bg-green-500';
    if (numScore >= 60) return 'bg-lime-500';
    if (numScore >= 40) return 'bg-yellow-500';
    if (numScore >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColor = (severity) => {
    if (!severity) return 'bg-gray-500';
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-yellow-500';
      case 'medium': return 'bg-orange-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Function to fix product analysis
  const fixProductAnalysis = async () => {
    try {
      setFixingAnalysis(true);
      setFixMessage({ type: 'info', text: 'Fixing product analysis...' });

      const response = await axios.post(`${API_URL}/api/products/fix-product-analysis/${id}`);

      if (response.data.status === 'success') {
        setProduct({ ...product, analysis: response.data.product.analysis });
        setFixMessage({ type: 'success', text: 'Product analysis fixed successfully!' });

        // Refresh the product data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setFixMessage({ type: 'error', text: 'Failed to fix product analysis.' });
      }
    } catch (error) {
      console.error('Error fixing product analysis:', error);
      setFixMessage({ type: 'error', text: 'Error: ' + (error.response?.data?.error || 'Failed to fix product analysis') });
    } finally {
      setTimeout(() => {
        setFixingAnalysis(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 pt-16">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 pt-16">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 pt-16">
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
            {product.barcode && <p className="opacity-80">Barcode: {product.barcode}</p>}
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('product')}
                className={`w-1/2 py-4 px-4 text-center font-medium text-sm ${activeTab === 'product'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Product Analysis
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`w-1/2 py-4 px-4 text-center font-medium text-sm ${activeTab === 'ingredients'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Ingredient Analysis
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'product' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Image */}
                <div className="md:col-span-1">
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-full overflow-hidden">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="max-w-full h-auto max-h-80 object-contain rounded shadow transition-all duration-300 hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        console.log("Image failed to load:", e.target.src);
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                </div>

                {/* Product Scores */}
                <div className="md:col-span-2">
                  {product.analysis ? (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Analysis</h2>

                      {/* Check if analysis has actual values */}
                      {(!product.analysis.nutritionScore && !product.analysis.sustainabilityScore) ? (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                          <p className="text-yellow-700 mb-3">This product has incomplete analysis data.</p>

                          <button
                            onClick={fixProductAnalysis}
                            disabled={fixingAnalysis}
                            className={`px-4 py-2 rounded ${fixingAnalysis ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                          >
                            {fixingAnalysis ? 'Fixing...' : 'Fix Product Analysis'}
                          </button>

                          {fixMessage && (
                            <p className={`mt-2 text-sm ${fixMessage.type === 'success' ? 'text-green-600' :
                                fixMessage.type === 'error' ? 'text-red-600' :
                                  'text-blue-600'
                              }`}>
                              {fixMessage.text}
                            </p>
                          )}
                        </div>
                      ) : null}

                      {/* Nutrition Score */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-1">
                          <h3 className="font-semibold text-gray-700">Nutrition Score</h3>
                          <span className="font-bold">{getAnalysisValue(product, 'nutritionScore', 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`${getScoreColor(getAnalysisValue(product, 'nutritionScore', 0))} h-4 rounded-full`}
                            style={{ width: `${getAnalysisValue(product, 'nutritionScore', 0)}%` }}
                          ></div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{product.analysis.nutritionEvaluation || 'No evaluation available'}</p>
                      </div>

                      {/* Sustainability Score */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-1">
                          <h3 className="font-semibold text-gray-700">Sustainability Score</h3>
                          <span className="font-bold">{getAnalysisValue(product, 'sustainabilityScore', 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`${getScoreColor(getAnalysisValue(product, 'sustainabilityScore', 0))} h-4 rounded-full`}
                            style={{ width: `${getAnalysisValue(product, 'sustainabilityScore', 0)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Processing Level */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">Processing Level</h3>
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${!product.analysis.processingLevel ? 'bg-gray-500' :
                            product.analysis.processingLevel === 'minimally processed' ? 'bg-green-500' :
                              product.analysis.processingLevel === 'processed' ? 'bg-yellow-400' :
                                product.analysis.processingLevel === 'highly processed' ? 'bg-orange-500' :
                                  'bg-red-500'
                          }`}>
                          {product.analysis.processingLevel || 'Unknown'}
                        </span>
                      </div>

                      {/* Overall Recommendation */}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">Overall Recommendation</h3>
                        <p className="text-green-700">{product.analysis.overallRecommendation || 'No recommendation available'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Analysis</h2>
                      <p className="text-gray-500">No product analysis available. This product needs to be analyzed.</p>
                      <div className="mt-4">
                        <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                          Analyze This Product
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                {product.ingredientAnalysis ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Image */}
                      <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-64">
                        <img
                          src={getImageUrl(product, 'product')}
                          alt={product.name}
                          className="max-w-full h-auto max-h-64 object-contain rounded shadow"
                          loading="lazy"
                          onError={(e) => {
                            console.log("Image failed to load:", e.target.src);
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>

                      {/* Ingredients Image */}
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-3">Ingredients</h3>
                        {product.ingredientsImagePath ? (
                          <div className="flex items-center justify-center">
                            <img
                              src={getImageUrl(product, 'ingredients')}
                              alt="Ingredients"
                              className="max-w-full h-auto max-h-64 object-contain rounded shadow"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No ingredients image available</p>
                        )}
                      </div>
                    </div>

                    {/* Safety Score */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Ingredients Safety</h2>
                        <div className="flex items-center">
                          <span className="mr-2 font-bold text-lg">{product.ingredientAnalysis.safetyScore}/100</span>
                          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                              backgroundColor: `${product.ingredientAnalysis.safetyScore >= 80 ? '#10B981' :
                                  product.ingredientAnalysis.safetyScore >= 60 ? '#84CC16' :
                                    product.ingredientAnalysis.safetyScore >= 40 ? '#FBBF24' :
                                      product.ingredientAnalysis.safetyScore >= 20 ? '#F97316' :
                                        '#EF4444'
                                }`
                            }}
                          >
                            {product.ingredientAnalysis.safetyScore}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-2">Overall Safety Assessment</h3>
                        <p className="text-gray-600">{product.ingredientAnalysis.overallSafety}</p>
                      </div>

                      {/* Extracted Text */}
                      {product.ingredientAnalysis.extractedText && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h3 className="font-semibold text-gray-700 mb-3">Raw Extracted Text</h3>
                          <p className="text-gray-600 italic">{product.ingredientAnalysis.extractedText}</p>
                        </div>
                      )}

                      {/* Identified Ingredients */}
                      {product.ingredients && product.ingredients.length > 0 && (
                        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                          <h3 className="font-semibold text-gray-700 mb-3">Identified Ingredients</h3>
                          <div className="flex flex-wrap gap-2">
                            {product.ingredients.map((ingredient, index) => (
                              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Harmful Ingredients */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3">Potentially Harmful Ingredients</h3>
                        {product.ingredientAnalysis.harmfulIngredients &&
                          product.ingredientAnalysis.harmfulIngredients.length > 0 ? (
                          <div className="space-y-4">
                            {product.ingredientAnalysis.harmfulIngredients.map((ingredient, index) => (
                              <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-bold text-gray-800">{ingredient.name}</h4>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${ingredient.severity === 'high' ? 'bg-red-500' :
                                      ingredient.severity === 'medium' ? 'bg-orange-500' :
                                        'bg-yellow-500'
                                    }`}>
                                    {ingredient.severity} risk
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm">{ingredient.reason}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-green-600 font-medium bg-green-50 p-3 rounded-lg border border-green-200">
                            No harmful ingredients detected
                          </p>
                        )}
                      </div>

                      {/* Safe Ingredients */}
                      {product.ingredientAnalysis.safeIngredients &&
                        product.ingredientAnalysis.safeIngredients.length > 0 && (
                          <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Safe Ingredients</h3>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex flex-wrap gap-2">
                                {product.ingredientAnalysis.safeIngredients.map((ingredient, index) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Unknown Ingredients */}
                      {product.ingredientAnalysis.unknownIngredients &&
                        product.ingredientAnalysis.unknownIngredients.length > 0 && (
                          <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Ingredients with Unknown Safety Profile</h3>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex flex-wrap gap-2">
                                {product.ingredientAnalysis.unknownIngredients.map((ingredient, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Detailed Analysis */}
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">Detailed Analysis</h3>
                        <p className="text-blue-700 text-sm whitespace-pre-line">{product.ingredientAnalysis.detailedAnalysis}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Ingredient Analysis Available</h3>
                    <p className="text-gray-500 mb-4">
                      Upload an image of the ingredients list to analyze this product's ingredients.
                    </p>
                    <Link to="/analyze-ingredients" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                      Upload Ingredients Image
                    </Link>
                  </div>
                )}

                {/* Add Nutritional Content Image if available */}
                {product.nutritionalContentImagePath && (
                  <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Nutritional Information</h3>
                    <div className="flex items-center justify-center">
                      <img
                        src={getImageUrl(product, 'nutrients')}
                        alt="Nutritional Information"
                        className="max-w-full h-auto max-h-64 object-contain rounded shadow"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Information */}
            {activeTab === 'product' && product.analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Allergens */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Allergens</h3>
                  {product.analysis.allergens && product.analysis.allergens.length > 0 ? (
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
                  {product.analysis.additives && product.analysis.additives.length > 0 ? (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;