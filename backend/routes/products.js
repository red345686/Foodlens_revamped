import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Product from '../models/product.js';
import { analyzeProductImage } from '../geminiService.js';
import { fetchProductByBarcode } from '../foodapi.js';
import extractBarcodeFromImage from '../barcode.js';

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

    // Fetch product data from external API
    const productData = await fetchProductByBarcode(barcode);
    if (!productData) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Analyze product image using Gemini
    const analysis = await analyzeProductImage(req.file.path, productData);

    // Save product in database
    let product = await Product.findOne({ barcode });
    
    if (product) {
      // Update existing product
      product.name = productData.product.product_name || 'Unknown Product';
      product.imagePath = req.file.path;
      product.productData = productData;
      product.analysis = analysis;
      product.updatedAt = new Date();
      await product.save();
    } else {
      // Create new product
      product = new Product({
        barcode,
        name: productData.product.product_name || 'Unknown Product',
        imagePath: req.file.path,
        productData,
        analysis
      });
      await product.save();
    }

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
    res.status(500).json({ error: 'Failed to analyze product' });
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
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

export default router; 