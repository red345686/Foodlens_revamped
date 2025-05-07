import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';

/**
 * Extract text from an image using Tesseract OCR
 * 
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(imagePath) {
  try {
    console.log('Starting OCR text extraction from image:', imagePath);
    
    // Verify the image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }
    
    // Initialize Tesseract worker - simplified for version 4.1.1
    const worker = await createWorker();
    
    // Configure language - simplified for version 4.1.1
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Set parameters - compatible with version 4.1.1
    await worker.setParameters({
      tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.()-:;%/\'\" ',
    });
    
    // Recognize text - method compatible with version 4.1.1
    console.log('Running OCR recognition...');
    try {
      const result = await worker.recognize(imagePath);
      console.log('OCR extraction completed');
      
      // Clean up worker
      await worker.terminate();
      
      // Clean and format the extracted text
      const cleanedText = cleanExtractedText(result.data.text);
      console.log('Extracted text from image:', cleanedText);
      
      return cleanedText;
    } catch (recognizeError) {
      console.error('Error in OCR recognition:', recognizeError);
      await worker.terminate();
      throw recognizeError;
    }
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`OCR text extraction failed: ${error.message}`);
  }
}

/**
 * Clean and format extracted text
 * 
 * @param {string} text - Raw OCR extracted text
 * @returns {string} - Cleaned text
 */
function cleanExtractedText(text) {
  if (!text) return '';
  
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Convert "Ingredients:" labels to just start with the ingredients
  cleaned = cleaned.replace(/^Ingredients[:\s]+/i, '');
  cleaned = cleaned.replace(/^INGREDIENTS[:\s]+/i, '');
  
  // Replace line breaks with commas if they appear to separate ingredients
  cleaned = cleaned.replace(/\n/g, ', ').replace(/,\s*,/g, ',');
  
  // Remove any weird OCR artifacts
  cleaned = cleaned.replace(/[^\w\s,.:()\-;%\/'"]/g, '');
  
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
    
  // If we didn't get any splits or just one ingredient, try another approach
  if (ingredients.length <= 1) {
    // Split by typical ingredient patterns (capitalized words or words with parentheses)
    ingredients = text.split(/(?=[A-Z][a-z])/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  
  // Try to clean up individual ingredients
  ingredients = ingredients.map(ingredient => {
    // Remove percentages
    return ingredient.replace(/\d+(\.\d+)?%/g, '').trim();
  }).filter(item => item.length > 0);
  
  return ingredients;
}

export { extractTextFromImage, parseIngredientsFromText }; 