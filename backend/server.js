import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import messageRoutes from './routes/messages.js';
import productRoutes from './routes/products.js';
import extractBarcodeFromImage from './barcode.js'; // Your Gemini OCR logic
import { fetchProductByBarcode, fetchProductsByCategory, searchProductsByName } from './foodapi.js';
import admin from 'firebase-admin';
import { initializeDefaultBadges } from './badgeService.js'; // Import badge service
import { analyzeManualIngredients } from './geminiService.js';

dotenv.config();

// Initialize Firebase Admin SDK
// For development, you may need to use a service account JSON file
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // If you have the service account details as a JSON string in an env var
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // Try to initialize with application default credentials
  admin.initializeApp();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Use absolute path with __dirname to ensure consistency
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Logging middleware for file access
app.use('/uploads', (req, res, next) => {
  console.log(`Image file requested: ${req.url}`);
  next();
});

// Serve the uploads directory from the correct absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
initDatabase().then(() => {
  console.log('Database initialized successfully');

  // Initialize badge system
  initializeDefaultBadges().then(() => {
    console.log('Badge system initialized successfully');
  }).catch(err => {
    console.error('Failed to initialize badge system', err);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Hello, Backend is running!');
});

app.post('/getbarcode', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    console.log('Received file:', file);
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    var barcode = await extractBarcodeFromImage(file.path);
    fs.unlinkSync(file.path);  // Delete the file after processing
    try {
      barcode = parseInt(barcode); // Convert to integer if needed
    } catch (error) {
      console.error('Failed to parse barcode:', error);
      return res.status(400).json({ status: "failed", error: 'Invalid barcode format' });
    }
    res.json({ status: "OK", barcode });
  } catch (error) {
    console.error('Failed to extract barcode:', error);
    res.status(500).json({ status: "failed", error: 'Error extracting barcode' });
  }
});

const newsCache = {
  syncDate: null,
  news: []
};

app.get('/allnews', async (req, res) => {
  try {
    const today = new Date();
    const oneMonthBack = new Date(today);
    oneMonthBack.setMonth(today.getMonth() - 1);
    const year = oneMonthBack.getFullYear();
    const month = String(oneMonthBack.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(oneMonthBack.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    if (newsCache.syncDate === formattedDate) {
      console.log("Sending Cache News");
      return res.status(200).send(newsCache.news);
    }
    const response = await fetch(`https://newsapi.org/v2/everything?q=food%20habits&from=${formattedDate}&sortBy=publishedAt&apiKey=${process.env.NEWSAPI_API_KEY}`)
    const data = await response.json();
    // console.log('Fetched news data:', data);
    console.log('Fetch time:', formattedDate);
    newsCache.syncDate = formattedDate;
    newsCache.news = data;
    res.status(200).send(data);
  } catch (error) {
    console.error('Error fetching news sources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/product/bybarcode/:barcode', async (req, res) => {
  const { barcode } = req.params;
  try {
    const productDetails = await fetchProductByBarcode(barcode);
    if (!productDetails) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Extract ingredients with better handling of different formats
    let ingredientsText = '';

    if (productDetails.product) {
      // Try multiple possible locations/formats of ingredients data
      if (typeof productDetails.product.ingredients_text === 'string' && productDetails.product.ingredients_text.trim().length > 0) {
        ingredientsText = productDetails.product.ingredients_text.trim();
      } else if (productDetails.product.ingredients_text_en && typeof productDetails.product.ingredients_text_en === 'string') {
        ingredientsText = productDetails.product.ingredients_text_en.trim();
      } else if (productDetails.product.ingredients && Array.isArray(productDetails.product.ingredients)) {
        // Handle case where ingredients are in an array format
        ingredientsText = productDetails.product.ingredients
          .map(ing => ing.text || ing.id || ing.name || String(ing))
          .filter(Boolean)
          .join(', ');
      }
    }

    console.log('Extracted ingredients text:', ingredientsText);
    console.log('Ingredients text type:', typeof ingredientsText);
    console.log('Ingredients text length:', ingredientsText.length);

    const nutrients = productDetails.product?.nutriments || {};

    // If we have ingredients, analyze them with Gemini
    let analysis = null;
    if (ingredientsText && ingredientsText.trim().length > 0) {
      try {
        // Sanitize the ingredients text to ensure it's a valid string
        const sanitizedIngredientsText = String(ingredientsText)
          .trim()
          .replace(/\s+/g, ' ')  // Normalize whitespace
          .replace(/(\d+\.?\d*)\s*%/g, '') // Remove percentages
          .replace(/\([^)]*\)/g, '')  // Remove content in parentheses
          .replace(/\s*,\s*/g, ', '); // Standardize commas

        console.log('Sanitized ingredients text:', sanitizedIngredientsText);

        analysis = await analyzeManualIngredients(sanitizedIngredientsText);
        console.log('Analysis completed successfully');
      } catch (analysisError) {
        console.error('Error analyzing ingredients:', analysisError);

        // Create a meaningful fallback analysis with available ingredients
        const ingredientsList = ingredientsText
          .split(/,|;/)
          .map(item => item.trim())
          .filter(item => item.length > 0);

        analysis = {
          ingredients: ingredientsList,
          harmfulIngredients: [],
          safeIngredients: ingredientsList,
          unknownIngredients: [],
          safetyScore: 50,
          overallSafety: "Ingredients could not be fully analyzed",
          detailedAnalysis: `The product contains: ${ingredientsList.join(', ')}`,
          nutritionScore: 50,
          sustainabilityScore: 50,
          processingLevel: "processed"
        };
      }
    } else {
      console.log('No ingredients text found in product data');
      analysis = {
        ingredients: [],
        harmfulIngredients: [],
        safeIngredients: [],
        unknownIngredients: [],
        safetyScore: 50,
        overallSafety: "No ingredients information available for this product",
        detailedAnalysis: "Cannot analyze ingredients as none were provided in the product data",
        nutritionScore: 50,
        sustainabilityScore: 50,
        processingLevel: "processed"
      };
    }

    // Return the product details along with the analysis
    res.json({
      productDetails,
      analysis
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/product/byname/:prodName', async (req, res) => {
  const { prodName } = req.params;
  try {
    const productDetails = await searchProductsByName(prodName);
    if (!productDetails) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(productDetails);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});