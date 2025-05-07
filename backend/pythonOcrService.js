import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to the Python OCR script
 * This will be created in the same directory as this service file
 */
const PYTHON_SCRIPT_PATH = path.join(__dirname, 'ocr_script.py');

/**
 * Flag to indicate if Tesseract installation has been checked
 */
let tesseractChecked = false;

/**
 * Check if Tesseract is installed and provide installation instructions if needed
 */
async function checkTesseractInstallation() {
  if (tesseractChecked) return;
  
  return new Promise((resolve) => {
    exec('tesseract --version', (error) => {
      if (error) {
        console.warn('Tesseract OCR is not installed or not in PATH.');
        console.log('======================= IMPORTANT =======================');
        console.log('Tesseract OCR is required for this feature to work.');
        console.log('Please install Tesseract OCR:');
        console.log('1. Download from: https://github.com/UB-Mannheim/tesseract/wiki');
        console.log('2. Install with default options');
        console.log('3. Add Tesseract installation directory to your PATH environment variable');
        console.log('4. Restart your application server');
        console.log('======================================================');
        console.log('Alternative: Uncomment the line in ocr_script.py to set the tesseract path manually');
      } else {
        console.log('Tesseract OCR is installed.');
      }
      
      tesseractChecked = true;
      resolve();
    });
  });
}

/**
 * Ensures the Python OCR script exists
 * Creates it if it doesn't exist
 */
function ensurePythonScriptExists() {
  if (!fs.existsSync(PYTHON_SCRIPT_PATH)) {
    // The Python script content
    const pythonScript = `import cv2
import pytesseract
from PIL import Image
import os
import json
import sys

# On Windows, you might need to set the tesseract path
# Uncomment and update the path if Tesseract is not in your PATH
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

def extract_text_from_image(image_path, preprocess=True):
    """
    Extract text from an image using pytesseract
    
    Args:
        image_path (str): Path to the image file
        preprocess (bool): Whether to preprocess the image for better results
        
    Returns:
        str: Extracted text from the image
    """
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            return f"Error: File {image_path} does not exist"
        
        # Read image
        image = cv2.imread(image_path)
        
        if image is None:
            return f"Error: Could not read image {image_path}"
        
        if preprocess:
            # Preprocessing to improve OCR accuracy
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding
            gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            
            # Alternative: Adaptive thresholding (uncomment if binary thresholding doesn't work well)
            # gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            
            # Noise removal
            gray = cv2.medianBlur(gray, 3)
            
            # Save the processed image temporarily
            temp_file = f"temp_processed_{os.path.basename(image_path)}"
            cv2.imwrite(temp_file, gray)
            
            # Extract text using pytesseract
            text = pytesseract.image_to_string(Image.open(temp_file))
            
            # Clean up
            if os.path.exists(temp_file):
                os.remove(temp_file)
        else:
            # Direct OCR without preprocessing
            text = pytesseract.image_to_string(Image.open(image_path))
        
        return text
    
    except Exception as e:
        return f"Error: {str(e)}"

def extract_text_with_layout(image_path):
    """
    Extract text while preserving layout information
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Dictionary containing text and its bounding box coordinates
    """
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            return f"Error: File {image_path} does not exist"
        
        # Read image
        image = cv2.imread(image_path)
        
        if image is None:
            return f"Error: Could not read image {image_path}"
        
        # Get detailed OCR output with bounding boxes
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        
        # Extract text with positions
        results = []
        for i, text in enumerate(data['text']):
            if text.strip():  # Skip empty text
                x = data['left'][i]
                y = data['top'][i]
                w = data['width'][i]
                h = data['height'][i]
                conf = data['conf'][i]
                
                results.append({
                    'text': text,
                    'confidence': conf,
                    'position': {
                        'x': x,
                        'y': y,
                        'width': w,
                        'height': h
                    }
                })
        
        return results
    
    except Exception as e:
        return f"Error: {str(e)}"

# Main function that will be called from Node.js
if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else "basic"
    
    if mode == "layout":
        result = extract_text_with_layout(image_path)
        print(json.dumps(result))
    else:
        result = extract_text_from_image(image_path)
        print(json.dumps({"text": result}))
`;

    // Write the Python script to the file system
    fs.writeFileSync(PYTHON_SCRIPT_PATH, pythonScript);
    console.log(`Created Python OCR script at ${PYTHON_SCRIPT_PATH}`);
  }
}

/**
 * Extract text from an image using Python OCR script
 * 
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(imagePath) {
  try {
    console.log('Starting Python OCR text extraction from image:', imagePath);
    
    // Check Tesseract installation
    await checkTesseractInstallation();
    
    // Ensure the Python script exists
    ensurePythonScriptExists();
    
    // Verify the image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }
    
    // Execute the Python script
    return new Promise((resolve, reject) => {
      exec(`python ${PYTHON_SCRIPT_PATH} "${imagePath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error running Python OCR script:', stderr);
          reject(new Error(`Python OCR script execution failed: ${error.message}`));
          return;
        }
        
        try {
          // Parse the JSON output from the Python script
          const result = JSON.parse(stdout);
          
          if (result.error) {
            console.error('Python OCR script returned an error:', result.error);
            reject(new Error(result.error));
            return;
          }
          
          const extractedText = result.text;
          console.log('OCR extraction completed');
          
          // Clean and format the extracted text
          const cleanedText = cleanExtractedText(extractedText);
          console.log('Extracted text from image:', cleanedText);
          
          resolve(cleanedText);
        } catch (parseError) {
          console.error('Error parsing Python OCR output:', parseError);
          reject(new Error(`Failed to parse Python OCR output: ${parseError.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`OCR text extraction failed: ${error.message}`);
  }
}

/**
 * Extract text with layout information from an image using Python OCR script
 * 
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Array>} - Extracted text with layout info
 */
async function extractTextWithLayout(imagePath) {
  try {
    console.log('Starting Python OCR layout extraction from image:', imagePath);
    
    // Ensure the Python script exists
    ensurePythonScriptExists();
    
    // Verify the image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }
    
    // Execute the Python script with layout mode
    return new Promise((resolve, reject) => {
      exec(`python ${PYTHON_SCRIPT_PATH} "${imagePath}" layout`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error running Python OCR script:', stderr);
          reject(new Error(`Python OCR script execution failed: ${error.message}`));
          return;
        }
        
        try {
          // Parse the JSON output from the Python script
          const result = JSON.parse(stdout);
          
          if (result.error) {
            console.error('Python OCR script returned an error:', result.error);
            reject(new Error(result.error));
            return;
          }
          
          console.log('OCR layout extraction completed');
          resolve(result);
        } catch (parseError) {
          console.error('Error parsing Python OCR output:', parseError);
          reject(new Error(`Failed to parse Python OCR output: ${parseError.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Error extracting text with layout from image:', error);
    throw new Error(`OCR layout extraction failed: ${error.message}`);
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

export { extractTextFromImage, extractTextWithLayout, parseIngredientsFromText }; 