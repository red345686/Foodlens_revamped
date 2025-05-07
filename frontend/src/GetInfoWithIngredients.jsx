import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";

const GetInfoWithIngredients = () => {
  const [file, setFile] = useState(null);
  const [productPhoto, setProductPhoto] = useState(null);
  const [nutritionImage, setNutritionImage] = useState(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [productPhotoPreview, setProductPhotoPreview] = useState(null);
  const [nutritionImagePreview, setNutritionImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [imageQualityTips, setImageQualityTips] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualIngredients, setManualIngredients] = useState("");
  const [inputMethod, setInputMethod] = useState("image"); // "image" or "manual"
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    setProductName(e.target.value);
    setError(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    
    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleProductPhotoChange = (e) => {
    const selectedFile = e.target.files[0];
    setProductPhoto(selectedFile);
    setError(null);
    
    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductPhotoPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setProductPhotoPreview(null);
    }
  };

  const handleNutritionImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setNutritionImage(selectedFile);
    setError(null);
    
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

  const toggleInputMethod = () => {
    setInputMethod(inputMethod === "image" ? "manual" : "image");
    setError(null);
  };

  const handleManualIngredientsChange = (e) => {
    setManualIngredients(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (inputMethod === "image" && !file) {
      setError('Please upload an image of the ingredients list.');
      return;
    }

    if (inputMethod === "manual" && !manualIngredients.trim()) {
      setError('Please enter the ingredients list.');
      return;
    }

    try {
      setLoading(true);
      
      if (inputMethod === "image") {
        // Process with image upload
        const formData = new FormData();
        formData.append('ingredientsImage', file);
        formData.append('name', productName);
        
        // Add product photo and nutrition image if available
        if (productPhoto) {
          formData.append('productPhoto', productPhoto);
        }
        
        if (nutritionImage) {
          formData.append('nutritionalContentImage', nutritionImage);
        }
        
        console.log('Sending request to analyze ingredients from image...');
        const response = await fetch('http://localhost:5000/api/products/analyze-ingredients', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (!response.ok) {
          throw new Error(result.error || `Server error: ${response.status}`);
        }

        if (result.status === 'success' && result.product && result.product.id) {
          console.log('Analysis successful:', result);
          navigate(`/product/${result.product.id}`);
        } else {
          throw new Error(result.error || 'Invalid response from server');
        }
      } else {
        // Process manual ingredients entry
        console.log('Sending request to analyze manually entered ingredients...');
        try {
          const formData = new FormData();
          formData.append('name', productName);
          formData.append('ingredients', manualIngredients);
          
          // Add product photo and nutrition image if available
          if (productPhoto) {
            formData.append('productPhoto', productPhoto);
          }
          
          if (nutritionImage) {
            formData.append('nutritionalContentImage', nutritionImage);
          }
          
          const response = await fetch('http://localhost:5000/api/products/analyze-manual-ingredients', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            throw new Error(errorData.error || `Server error: ${response.status}`);
          }

          const result = await response.json();
          console.log('Server response:', result);

          if (result.status === 'success' && result.product && result.product.id) {
            console.log('Analysis successful:', result);
            navigate(`/product/${result.product.id}`);
          } else {
            throw new Error(result.error || 'Invalid response from server');
          }
        } catch (error) {
          console.error('Error analyzing manually entered ingredients:', error);
          throw error; // Re-throw to be handled by the outer catch block
        }
      }
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      setError(
        error.message === 'Failed to fetch' 
          ? 'Unable to connect to the server. Please check if the server is running.'
          : error.message || 'An error occurred while analyzing the ingredients.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200">
      <NavBar />
      <div className="max-w-md mx-auto p-6 mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
            Analyze Ingredients
          </h2>
          
          <div className="mb-6">
            <p className="text-gray-600 text-sm text-center">
              {inputMethod === "image" 
                ? "Take a clear photo of the product's ingredients list and we'll analyze it for potentially harmful ingredients."
                : "Enter the product's ingredients list and we'll analyze it for potentially harmful ingredients."}
            </p>
            
            <div className="flex justify-center mt-3 gap-3">
              <button 
                onClick={toggleInputMethod} 
                className="text-green-600 text-xs font-medium underline"
              >
                {inputMethod === "image" 
                  ? "Enter ingredients manually instead" 
                  : "Upload image instead"}
              </button>
              
              {inputMethod === "image" && (
                <button 
                  onClick={toggleImageTips}
                  className="text-green-600 text-xs font-medium underline"
                >
                  {imageQualityTips ? "Hide image tips" : "Tips for best results"}
                </button>
              )}
            </div>
            
            {imageQualityTips && inputMethod === "image" && (
              <div className="mt-3 p-3 bg-green-50 rounded-md text-xs text-gray-700">
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
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name (optional)
              </label>
              <input
                type="text"
                value={productName}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter product name"
              />
            </div>

            {inputMethod === "image" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    id="file-upload"
                    capture="environment"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {preview ? (
                      <div className="mx-auto">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-48 mx-auto mb-2 object-contain"
                        />
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          Click to upload ingredients image
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients List
                </label>
                <textarea
                  value={manualIngredients}
                  onChange={handleManualIngredientsChange}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Paste or type ingredients list here (comma separated)"
                ></textarea>
              </div>
            )}

            {/* Product photo upload (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Photo (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                <input
                  type="file"
                  onChange={handleProductPhotoChange}
                  className="hidden"
                  accept="image/*"
                  id="product-photo-upload"
                  capture="environment"
                />
                <label htmlFor="product-photo-upload" className="cursor-pointer">
                  {productPhotoPreview ? (
                    <div className="mx-auto">
                      <img
                        src={productPhotoPreview}
                        alt="Product Preview"
                        className="max-h-48 mx-auto mb-2 object-contain"
                      />
                      <p className="text-sm text-gray-500">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">
                        Click to upload product photo
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Nutrition facts image upload (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nutrition Facts Image (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                <input
                  type="file"
                  onChange={handleNutritionImageChange}
                  className="hidden"
                  accept="image/*"
                  id="nutrition-image-upload"
                  capture="environment"
                />
                <label htmlFor="nutrition-image-upload" className="cursor-pointer">
                  {nutritionImagePreview ? (
                    <div className="mx-auto">
                      <img
                        src={nutritionImagePreview}
                        alt="Nutrition Facts Preview"
                        className="max-h-48 mx-auto mb-2 object-contain"
                      />
                      <p className="text-sm text-gray-500">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">
                        Click to upload nutrition facts image
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Analyze Ingredients"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GetInfoWithIngredients;
