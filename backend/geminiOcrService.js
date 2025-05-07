import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

// Initialize the Generative AI API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to validate image file
function validateImageFile(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found at path: ${imagePath}`);
  }
  
  const stats = fs.statSync(imagePath);
  if (stats.size === 0) {
    throw new Error('Image file is empty');
  }
}

// Function to encode image to base64
function encodeImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Extract text from an image using Gemini Vision API
 * 
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(imagePath) {
  try {
    console.log('Starting Gemini OCR text extraction from image:', imagePath);
    
    // Validate image file
    validateImageFile(imagePath);
    
    // Encode image to base64
    const base64Image = encodeImageToBase64(imagePath);
    
    // Initialize the model - using gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create prompt for Gemini to extract text
    const prompt = `
      You are an OCR (Optical Character Recognition) engine.
      
      I'm providing an image of a product ingredients list.
      The base64 encoded image is: ${base64Image}
      
      YOUR TASK:
      1. Look at this image CAREFULLY and extract ONLY the text visible in the ingredients list.
      2. Output ONLY the extracted text, without any commentary or explanation.
      3. Maintain the format (commas, spacing) exactly as it appears in the image.
      4. If you can't read some text clearly, indicate with [unclear].
      5. Do not make up or infer any text that is not clearly visible in the image.
      
      JUST EXTRACT THE TEXT. NOTHING ELSE.
    `;
    
    // Generate text with the model
    try {
      console.log('Sending OCR request to Gemini API...');
      const result = await model.generateContent(prompt);
      const extractedText = result.response.text().trim();
      console.log('Received OCR response from Gemini API');
      
      // Clean the extracted text
      const cleanedText = cleanExtractedText(extractedText);
      console.log('Extracted text from image using Gemini:', cleanedText);
      
      return cleanedText;
    } catch (genaiError) {
      console.error('Error calling Gemini API for OCR:', genaiError);
      throw new Error(`Gemini OCR error: ${genaiError.message}`);
    }
  } catch (error) {
    console.error('Error in Gemini OCR extraction:', error);
    throw new Error(`Gemini OCR extraction failed: ${error.message}`);
  }
}

/**
 * Clean and format extracted text
 * 
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
function cleanExtractedText(text) {
  if (!text) return '';
  
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Convert "Ingredients:" labels to just start with the ingredients
  cleaned = cleaned.replace(/^Ingredients[:\s]+/i, '');
  cleaned = cleaned.replace(/^INGREDIENTS[:\s]+/i, '');
  
  // Remove any phrases indicating Gemini's thinking about the text
  cleaned = cleaned.replace(/The ingredients list says:/i, '');
  cleaned = cleaned.replace(/The text reads:/i, '');
  cleaned = cleaned.replace(/I can see the following ingredients:/i, '');
  cleaned = cleaned.replace(/The extracted text is:/i, '');
  
  return cleaned;
}

/**
 * Attempt to separate ingredients from the extracted text
 * Ingredients are often comma-separated or separated by specific patterns
 * 
 * @param {string} text - Extracted text that may contain ingredients
 * @returns {string[]} - Array of individual ingredients
 */
function parseIngredientsFromText(text) {
  if (!text) return [];
  
  // Split by common ingredient separators (comma, semicolon)
  let ingredients = text.split(/[,;]\s*/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  // Try to clean up individual ingredients
  ingredients = ingredients.map(ingredient => {
    // Remove percentages
    return ingredient.replace(/\d+(\.\d+)?%/g, '').trim();
  }).filter(item => item.length > 0);
  
  return ingredients;
}

export { extractTextFromImage, parseIngredientsFromText }; 