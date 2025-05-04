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

const PORT = process.env.PORT || 3000;
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