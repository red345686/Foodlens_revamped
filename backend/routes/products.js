import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Product from '../models/product.js';
import { analyzeProductImage, analyzeIngredientsImage, analyzeManualIngredients } from '../geminiService.js';
import { fetchProductByBarcode } from '../foodapi.js';
import extractBarcodeFromImage from '../barcode.js';
import mongoose from 'mongoose';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use product name from request body with file type as suffix for better identification
    const productName = req.body.name ? req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : '';
    let fileType = '';
    
    if (file.fieldname === 'productPhoto') {
      fileType = 'productimage';
    } else if (file.fieldname === 'ingredientsImage') {
      fileType = 'ingredientsimage';
    } else if (file.fieldname === 'nutritionalContentImage') {
      fileType = 'nutrientsimage';
    } else {
      fileType = file.fieldname;
    }
    
    // If product name is provided, use productname_imagetype format
    if (productName) {
      const fileName = `${productName}_${fileType}${path.extname(file.originalname)}`;
      cb(null, fileName);
    } else {
      // Fallback to timestamp based naming if no product name is provided
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }
});

const upload = multer({ storage: storage });

// Upload product image and barcode extraction
router.post('/upload-barcode-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract barcode from image
    const barcode = await extractBarcodeFromImage(req.file.path);
    
    res.json({ 
      status: 'success', 
      barcode: barcode.trim(),
      imagePath: req.file.path
    });
  } catch (error) {
    console.error('Error processing barcode image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Upload ingredients image for analysis
router.post('/analyze-ingredients', upload.fields([
  { name: 'ingredientsImage', maxCount: 1 },
  { name: 'productPhoto', maxCount: 1 },
  { name: 'nutritionalContentImage', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.ingredientsImage) {
      return res.status(400).json({ error: 'No ingredients image uploaded' });
    }
    
    const { productId, name } = req.body;
    const ingredientsImagePath = req.files.ingredientsImage[0].path;
    const productPhotoPath = req.files.productPhoto ? req.files.productPhoto[0].path : null;
    const nutritionalContentImagePath = req.files.nutritionalContentImage ? req.files.nutritionalContentImage[0].path : null;
    
    console.log('Processing ingredients image:', ingredientsImagePath);
    if (productPhotoPath) console.log('Product photo provided:', productPhotoPath);
    if (nutritionalContentImagePath) console.log('Nutrition image provided:', nutritionalContentImagePath);
    
    // Analyze ingredients image using OCR + Gemini
    let ingredientAnalysis;
    try {
      ingredientAnalysis = await analyzeIngredientsImage(ingredientsImagePath);
      if (!ingredientAnalysis) {
        throw new Error('No analysis results received from analysis pipeline');
      }
      
      // Log the analysis for debugging
      console.log('Analysis results:', {
        extractedText: ingredientAnalysis.extractedText,
        ingredientsCount: ingredientAnalysis.ingredients ? ingredientAnalysis.ingredients.length : 0,
        safetyScore: ingredientAnalysis.safetyScore
      });
    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      return res.status(500).json({ 
        error: 'Failed to analyze ingredients',
        details: analysisError.message 
      });
    }
    
    // Create or update product
    let product;
    try {
      if (productId) {
        // Update existing product
        product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        product.ingredientsImagePath = ingredientsImagePath;
        
        // Add product photo and nutrition image paths if they exist
        if (productPhotoPath) {
          product.productPhotoPath = productPhotoPath;
          // Set formatted product image name
          const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          product.formattedProductImageName = `${sanitizedName}_productimage`;
        }
        
        if (nutritionalContentImagePath) {
          product.nutritionalContentImagePath = nutritionalContentImagePath;
          // Set formatted nutrients image name
          const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          product.formattedNutrientsImageName = `${sanitizedName}_nutrientsimage`;
        }
        
        // Set formatted ingredients image name
        if (ingredientsImagePath) {
          const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          product.formattedIngredientsImageName = `${sanitizedName}_ingredientsimage`;
        }
        
        product.ingredients = ingredientAnalysis.ingredients || [];
        product.ingredientAnalysis = {
          extractedText: ingredientAnalysis.extractedText || '',
          safetyScore: ingredientAnalysis.safetyScore,
          harmfulIngredients: ingredientAnalysis.harmfulIngredients || [],
          safeIngredients: ingredientAnalysis.safeIngredients || [],
          unknownIngredients: ingredientAnalysis.unknownIngredients || [],
          overallSafety: ingredientAnalysis.overallSafety || '',
          detailedAnalysis: ingredientAnalysis.detailedAnalysis || ''
        };
        
        // Update analysis fields with data from ingredient analysis
        product.analysis = {
          nutritionScore: ingredientAnalysis.nutritionScore || 50,
          nutritionEvaluation: "Analysis based on ingredients list",
          allergens: [],
          additives: [],
          sustainabilityScore: ingredientAnalysis.sustainabilityScore || 50,
          processingLevel: ingredientAnalysis.processingLevel || "processed",
          overallRecommendation: "Based on ingredients analysis"
        };
        
        await product.save();
      } else {
        // Create new product without barcode
        // Generate a unique identifier since we don't have a barcode
        const uniqueId = new mongoose.Types.ObjectId().toString();
        
        console.log('Creating new product with ingredients analysis');
        const productName = name || 'Unknown Product';
        const sanitizedName = productName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // Create formatted image names
        const formattedProductImageName = productPhotoPath ? `${sanitizedName}_productimage` : null;
        const formattedIngredientsImageName = ingredientsImagePath ? `${sanitizedName}_ingredientsimage` : null;
        const formattedNutrientsImageName = nutritionalContentImagePath ? `${sanitizedName}_nutrientsimage` : null;
        
        product = new Product({
          name: productName,
          // Add a unique string in the barcode field to avoid null value
          barcode: `ocr_${uniqueId}`,
          ingredientsImagePath: ingredientsImagePath,
          productPhotoPath: productPhotoPath,
          nutritionalContentImagePath: nutritionalContentImagePath,
          formattedProductImageName: formattedProductImageName,
          formattedIngredientsImageName: formattedIngredientsImageName,
          formattedNutrientsImageName: formattedNutrientsImageName,
          ingredients: ingredientAnalysis.ingredients || [],
          ingredientAnalysis: {
            extractedText: ingredientAnalysis.extractedText || '',
            safetyScore: ingredientAnalysis.safetyScore,
            harmfulIngredients: ingredientAnalysis.harmfulIngredients || [],
            safeIngredients: ingredientAnalysis.safeIngredients || [],
            unknownIngredients: ingredientAnalysis.unknownIngredients || [],
            overallSafety: ingredientAnalysis.overallSafety || '',
            detailedAnalysis: ingredientAnalysis.detailedAnalysis || ''
          },
          analysis: {
            nutritionScore: ingredientAnalysis.nutritionScore || 50,
            nutritionEvaluation: "Analysis based on ingredients list",
            allergens: [],
            additives: [],
            sustainabilityScore: ingredientAnalysis.sustainabilityScore || 50,
            processingLevel: ingredientAnalysis.processingLevel || "processed",
            overallRecommendation: "Based on ingredients analysis"
          },
          productData: { product_name: name || 'Unknown Product' }
        });
        
        await product.save();
        console.log('Product saved with ID:', product._id);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        error: 'Failed to save product data',
        details: dbError.message 
      });
    }

    console.log('Successfully analyzed and saved product ingredients');
    
    // Send back the complete product object
    res.json({
      status: 'success',
      product: {
        id: product._id,
        name: product.name,
        barcode: product.barcode,
        ingredientsImagePath: product.ingredientsImagePath,
        productPhotoPath: product.productPhotoPath,
        nutritionalContentImagePath: product.nutritionalContentImagePath,
        formattedProductImageName: product.formattedProductImageName,
        formattedIngredientsImageName: product.formattedIngredientsImageName,
        formattedNutrientsImageName: product.formattedNutrientsImageName,
        ingredients: product.ingredients,
        ingredientAnalysis: product.ingredientAnalysis,
        productData: product.productData
      }
    });
  } catch (error) {
    console.error('Error in analyze-ingredients endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process ingredients analysis request',
      details: error.message 
    });
  }
});

// Analyze manually entered ingredients
router.post('/analyze-manual-ingredients', upload.fields([
  { name: 'productPhoto', maxCount: 1 },
  { name: 'nutritionalContentImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { ingredients, name } = req.body;
    
    if (!ingredients) {
      return res.status(400).json({ error: 'No ingredients provided' });
    }
    
    const productPhotoPath = req.files && req.files.productPhoto ? req.files.productPhoto[0].path : null;
    const nutritionalContentImagePath = req.files && req.files.nutritionalContentImage ? req.files.nutritionalContentImage[0].path : null;
    
    console.log('Processing manually entered ingredients:', ingredients);
    if (productPhotoPath) console.log('Product photo provided:', productPhotoPath);
    if (nutritionalContentImagePath) console.log('Nutrition image provided:', nutritionalContentImagePath);
    
    // Analyze ingredients using Gemini
    let ingredientAnalysis;
    try {
      // Pass the ingredients to the Gemini service
      ingredientAnalysis = await analyzeManualIngredients(ingredients);
      
      if (!ingredientAnalysis) {
        throw new Error('No analysis results received from Gemini API');
      }
      
      console.log('Successfully analyzed ingredients with Gemini');
    } catch (analysisError) {
      console.error('Gemini API error:', analysisError);
      return res.status(500).json({ 
        error: 'Failed to analyze ingredients',
        details: analysisError.message 
      });
    }
    
    // Create product
    let product;
    try {
      // Generate a unique identifier
      const uniqueId = new mongoose.Types.ObjectId().toString();
      
      product = new Product({
        name: name || 'Unknown Product',
        barcode: `manual_${uniqueId}`,
        productPhotoPath: productPhotoPath,
        nutritionalContentImagePath: nutritionalContentImagePath,
        ingredients: ingredientAnalysis.ingredients || [],
        ingredientAnalysis: {
          extractedText: ingredients, // Use the manually entered text
          safetyScore: ingredientAnalysis.safetyScore,
          harmfulIngredients: ingredientAnalysis.harmfulIngredients || [],
          safeIngredients: ingredientAnalysis.safeIngredients || [],
          unknownIngredients: ingredientAnalysis.unknownIngredients || [],
          overallSafety: ingredientAnalysis.overallSafety || '',
          detailedAnalysis: ingredientAnalysis.detailedAnalysis || ''
        },
        // Include nutritionScore, sustainabilityScore and processingLevel from the analysis
        analysis: {
          nutritionScore: ingredientAnalysis.nutritionScore || 50,
          nutritionEvaluation: "Analysis based on ingredient list only",
          allergens: [],
          additives: [],
          sustainabilityScore: ingredientAnalysis.sustainabilityScore || 50,
          processingLevel: ingredientAnalysis.processingLevel || "processed",
          overallRecommendation: "Based on ingredient analysis only"
        },
        productData: { product_name: name || 'Unknown Product' }
      });
      
      await product.save();
      console.log('Product created from manual ingredients with ID:', product._id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        error: 'Failed to save product data',
        details: dbError.message 
      });
    }
    
    // Send back the product
    res.json({
      status: 'success',
      product: {
        id: product._id,
        name: product.name,
        barcode: product.barcode,
        productPhotoPath: product.productPhotoPath,
        nutritionalContentImagePath: product.nutritionalContentImagePath,
        ingredients: product.ingredients,
        ingredientAnalysis: product.ingredientAnalysis,
        productData: product.productData
      }
    });
  } catch (error) {
    console.error('Error in analyze-manual-ingredients endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process manual ingredients analysis',
      details: error.message 
    });
  }
});

// Upload product photo for analysis
router.post('/analyze-product', upload.single('productImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No product image uploaded' });
    }
    
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    console.log(`Analyzing product with barcode: ${barcode}`);
    
    // Fetch product data from external API
    const productData = await fetchProductByBarcode(barcode);
    if (!productData) {
      console.error(`Product with barcode ${barcode} not found in external API`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log(`Product data retrieved for ${productData.product?.product_name || 'Unknown Product'}`);

    // Analyze product image using Gemini
    console.log(`Starting analysis for product image at path: ${req.file.path}`);
    const analysis = await analyzeProductImage(req.file.path, productData);
    console.log('Raw product analysis result from Gemini:', JSON.stringify(analysis, null, 2));
    
    if (!analysis) {
      console.error('No analysis results received from geminiService');
      return res.status(500).json({ error: 'Failed to generate product analysis' });
    }

    // Create an analysis object with explicit default values for every field
    const productAnalysis = {
      nutritionScore: parseFloat(analysis.nutritionScore || 50),
      nutritionEvaluation: analysis.nutritionEvaluation || 'No detailed evaluation available',
      allergens: Array.isArray(analysis.allergens) ? analysis.allergens : [],
      additives: Array.isArray(analysis.additives) ? analysis.additives : [],
      sustainabilityScore: parseFloat(analysis.sustainabilityScore || 50),
      processingLevel: analysis.processingLevel || 'processed',
      overallRecommendation: analysis.overallRecommendation || 'No specific recommendation available'
    };

    console.log('Formatted product analysis:', JSON.stringify(productAnalysis, null, 2));
    
    // Log conversion to see what might be happening with the values
    console.log('Numeric conversion check:', {
      rawNutritionScore: analysis.nutritionScore,
      rawType: typeof analysis.nutritionScore,
      parsedNutritionScore: parseFloat(analysis.nutritionScore || 50),
      parsedType: typeof parseFloat(analysis.nutritionScore || 50),
      rawSustainabilityScore: analysis.sustainabilityScore,
      rawSustainabilityType: typeof analysis.sustainabilityScore,
      parsedSustainabilityScore: parseFloat(analysis.sustainabilityScore || 50),
      parsedSustainabilityType: typeof parseFloat(analysis.sustainabilityScore || 50)
    });

    // Save product in database
    let product = await Product.findOne({ barcode });
    
    if (product) {
      // Update existing product
      console.log(`Updating existing product with ID: ${product._id}`);
      product.name = productData.product?.product_name || 'Unknown Product';
      product.imagePath = req.file.path;
      product.productData = productData;
      product.analysis = productAnalysis;
      product.updatedAt = new Date();
      
      try {
        await product.save();
        console.log(`Product updated successfully with analysis data`);
      } catch (saveError) {
        console.error('Error saving updated product:', saveError);
        return res.status(500).json({ error: 'Failed to save product updates', details: saveError.message });
      }
    } else {
      // Create new product
      console.log(`Creating new product with barcode: ${barcode}`);
      try {
        product = new Product({
          barcode,
          name: productData.product?.product_name || 'Unknown Product',
          imagePath: req.file.path,
          productData,
          analysis: productAnalysis
        });
        
        await product.save();
        console.log(`New product created with ID: ${product._id}`);
      } catch (createError) {
        console.error('Error creating new product:', createError);
        return res.status(500).json({ error: 'Failed to create product', details: createError.message });
      }
    }

    // Log the final product data before sending
    console.log('Product saved successfully with analysis:',
      JSON.stringify({
        id: product._id,
        name: product.name,
        hasAnalysis: !!product.analysis,
        nutritionScore: product.analysis?.nutritionScore,
        sustainabilityScore: product.analysis?.sustainabilityScore,
        processingLevel: product.analysis?.processingLevel
      })
    );

    res.json({
      status: 'success',
      product: {
        id: product._id,
        barcode: product.barcode,
        name: product.name,
        imagePath: product.imagePath,
        analysis: product.analysis
      }
    });
  } catch (error) {
    console.error('Error analyzing product:', error);
    res.status(500).json({ error: 'Failed to analyze product', details: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching product with ID: ${req.params.id}`);
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log(`Product with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check and regenerate formatted image names if missing
    let needsUpdate = false;
    
    if (product.name) {
      const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      if (product.productPhotoPath && !product.formattedProductImageName) {
        product.formattedProductImageName = `${sanitizedName}_productimage`;
        needsUpdate = true;
      }
      
      if (product.ingredientsImagePath && !product.formattedIngredientsImageName) {
        product.formattedIngredientsImageName = `${sanitizedName}_ingredientsimage`;
        needsUpdate = true;
      }
      
      if (product.nutritionalContentImagePath && !product.formattedNutrientsImageName) {
        product.formattedNutrientsImageName = `${sanitizedName}_nutrientsimage`;
        needsUpdate = true;
      }
    }
    
    // Save the product if any formatted image names were updated
    if (needsUpdate) {
      await product.save();
      console.log(`Updated formatted image names for product ${product._id}`);
    }
    
    // Add detailed logging about the analysis data
    console.log('Product found, analysis data:', {
      hasAnalysis: !!product.analysis,
      nutritionScore: product.analysis?.nutritionScore,
      nutritionScoreType: typeof product.analysis?.nutritionScore,
      sustainabilityScore: product.analysis?.sustainabilityScore,
      processingLevel: product.analysis?.processingLevel
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product by barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Fix product analysis data
router.post('/fix-product-analysis/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    console.log(`Fixing product analysis for product with ID: ${productId}`);
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if analysis exists, create it if not
    if (!product.analysis) {
      console.log('Product has no analysis object, creating one with default values');
      product.analysis = {
        nutritionScore: 50,
        nutritionEvaluation: "No detailed nutrition analysis available",
        allergens: [],
        additives: [],
        sustainabilityScore: 50,
        processingLevel: "processed",
        overallRecommendation: "No specific recommendation available"
      };
    } else {
      console.log('Product has analysis object, ensuring all fields are properly set');
      // Ensure all fields are properly set
      if (product.analysis.nutritionScore === undefined || product.analysis.nutritionScore === null) {
        product.analysis.nutritionScore = 50;
      } else {
        product.analysis.nutritionScore = parseFloat(product.analysis.nutritionScore) || 50;
      }
      
      if (!product.analysis.nutritionEvaluation) {
        product.analysis.nutritionEvaluation = "No detailed nutrition analysis available";
      }
      
      if (!Array.isArray(product.analysis.allergens)) {
        product.analysis.allergens = [];
      }
      
      if (!Array.isArray(product.analysis.additives)) {
        product.analysis.additives = [];
      }
      
      if (product.analysis.sustainabilityScore === undefined || product.analysis.sustainabilityScore === null) {
        product.analysis.sustainabilityScore = 50;
      } else {
        product.analysis.sustainabilityScore = parseFloat(product.analysis.sustainabilityScore) || 50;
      }
      
      if (!product.analysis.processingLevel) {
        product.analysis.processingLevel = "processed";
      }
      
      if (!product.analysis.overallRecommendation) {
        product.analysis.overallRecommendation = "No specific recommendation available";
      }
    }
    
    // Save the updated product
    await product.save();
    
    console.log('Product analysis fixed successfully');
    
    res.json({
      status: 'success',
      message: 'Product analysis fixed successfully',
      product: {
        id: product._id,
        name: product.name,
        analysis: product.analysis
      }
    });
  } catch (error) {
    console.error('Error fixing product analysis:', error);
    res.status(500).json({ error: 'Failed to fix product analysis', details: error.message });
  }
});

// Fix all products with missing analysis data
router.post('/fix-all-products-analysis', async (req, res) => {
  try {
    console.log('Starting to fix all products with missing or incorrect analysis data');
    
    // Find all products
    const products = await Product.find();
    console.log(`Found ${products.length} products to check`);
    
    let fixedCount = 0;
    
    // Process each product
    for (const product of products) {
      let needsFix = false;
      
      // Check if analysis exists, create it if not
      if (!product.analysis) {
        console.log(`Product ${product._id} has no analysis object, creating one with default values`);
        product.analysis = {
          nutritionScore: 50,
          nutritionEvaluation: "No detailed nutrition analysis available",
          allergens: [],
          additives: [],
          sustainabilityScore: 50,
          processingLevel: "processed",
          overallRecommendation: "No specific recommendation available"
        };
        needsFix = true;
      } else {
        // Check if any required field is missing
        if (product.analysis.nutritionScore === undefined || product.analysis.nutritionScore === null) {
          product.analysis.nutritionScore = 50;
          needsFix = true;
        } else if (isNaN(parseFloat(product.analysis.nutritionScore))) {
          product.analysis.nutritionScore = 50;
          needsFix = true;
        }
        
        if (!product.analysis.nutritionEvaluation) {
          product.analysis.nutritionEvaluation = "No detailed nutrition analysis available";
          needsFix = true;
        }
        
        if (!Array.isArray(product.analysis.allergens)) {
          product.analysis.allergens = [];
          needsFix = true;
        }
        
        if (!Array.isArray(product.analysis.additives)) {
          product.analysis.additives = [];
          needsFix = true;
        }
        
        if (product.analysis.sustainabilityScore === undefined || product.analysis.sustainabilityScore === null) {
          product.analysis.sustainabilityScore = 50;
          needsFix = true;
        } else if (isNaN(parseFloat(product.analysis.sustainabilityScore))) {
          product.analysis.sustainabilityScore = 50;
          needsFix = true;
        }
        
        if (!product.analysis.processingLevel) {
          product.analysis.processingLevel = "processed";
          needsFix = true;
        }
        
        if (!product.analysis.overallRecommendation) {
          product.analysis.overallRecommendation = "No specific recommendation available";
          needsFix = true;
        }
      }
      
      // Save the product if any fixes were applied
      if (needsFix) {
        await product.save();
        fixedCount++;
        console.log(`Fixed product ${product._id}`);
      }
    }
    
    console.log(`Fixed ${fixedCount} products with missing or incorrect analysis data`);
    
    res.json({
      status: 'success',
      message: `Fixed ${fixedCount} products with missing or incorrect analysis data`,
      totalChecked: products.length
    });
  } catch (error) {
    console.error('Error fixing all products analysis:', error);
    res.status(500).json({ error: 'Failed to fix all products analysis', details: error.message });
  }
});

// Endpoint to get product image by formatted name
router.get('/images/:formattedName', async (req, res) => {
  try {
    const { formattedName } = req.params;
    
    if (!formattedName) {
      return res.status(400).json({ error: 'Formatted image name is required' });
    }
    
    // Determine image type from the formatted name
    let imageType = 'productimage';
    if (formattedName.includes('_ingredientsimage')) {
      imageType = 'ingredientsimage';
    } else if (formattedName.includes('_nutrientsimage')) {
      imageType = 'nutrientsimage';
    }
    
    // Find the product with the corresponding formatted image name
    let query = {};
    if (imageType === 'productimage') {
      query.formattedProductImageName = formattedName;
    } else if (imageType === 'ingredientsimage') {
      query.formattedIngredientsImageName = formattedName;
    } else if (imageType === 'nutrientsimage') {
      query.formattedNutrientsImageName = formattedName;
    }
    
    const product = await Product.findOne(query);
    
    if (!product) {
      return res.status(404).json({ error: 'Product with the specified image name not found' });
    }
    
    // Get the correct image path based on the image type
    let imagePath;
    if (imageType === 'productimage') {
      imagePath = product.productPhotoPath;
    } else if (imageType === 'ingredientsimage') {
      imagePath = product.ingredientsImagePath;
    } else if (imageType === 'nutrientsimage') {
      imagePath = product.nutritionalContentImagePath;
    }
    
    if (!imagePath) {
      return res.status(404).json({ error: 'Image path not found for this product' });
    }
    
    // Send the file path
    const absolutePath = path.resolve(__dirname, '..', imagePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }
    
    res.sendFile(absolutePath);
  } catch (error) {
    console.error('Error fetching image by formatted name:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

export default router; 