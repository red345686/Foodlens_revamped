import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import extractBarcodeFromImage from './barcode.js'; // Your Gemini OCR logic
import { fetchProductByBarcode, fetchProductsByCategory, searchProductsByName } from './foodapi.js';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

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
    res.json({ status: "OK" , barcode });
  } catch (error) {
    console.error('Failed to extract barcode:', error);
    res.status(500).json({ status: "failed", error: 'Error extracting barcode' });
  }
});

app.get('/product/bybarcode/:barcode', async (req, res) => {
  const { barcode } = req.params;
  try {
    const productDetails = await fetchProductByBarcode(barcode);
    if (!productDetails) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(productDetails);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Internal server error' });
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