import { extractTextFromImage as pythonOcr } from './pythonOcrService.js';
import { extractTextFromImage as geminiOcr } from './geminiOcrService.js';
import path from 'path';
import fs from 'fs';

// Ensure the test image directory exists
const testImagesDir = path.join(process.cwd(), 'test_images');
if (!fs.existsSync(testImagesDir)) {
  fs.mkdirSync(testImagesDir, { recursive: true });
  console.log(`Created test images directory at ${testImagesDir}`);
  console.log('Please add some test images to this directory and run this script again.');
  process.exit(0);
}

// Check if there are any images in the test directory
const imageFiles = fs.readdirSync(testImagesDir)
  .filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file));

if (imageFiles.length === 0) {
  console.log('No image files found in the test directory.');
  console.log(`Please add some images to ${testImagesDir} and run this script again.`);
  process.exit(0);
}

// Function to test both OCR methods on an image
async function compareMethods(imagePath) {
  console.log(`\n===================== COMPARISON FOR ${path.basename(imagePath)} =====================`);
  
  let pythonResult = null;
  let geminiResult = null;
  
  // Python OCR
  try {
    console.log('\n--- Python OCR ---');
    pythonResult = await pythonOcr(imagePath);
    console.log('Result:', pythonResult);
  } catch (err) {
    console.error('Python OCR Error:', err.message);
  }
  
  // Gemini OCR
  try {
    console.log('\n--- Gemini OCR ---');
    geminiResult = await geminiOcr(imagePath);
    console.log('Result:', geminiResult);
  } catch (err) {
    console.error('Gemini OCR Error:', err.message);
  }
  
  // Compare results
  if (pythonResult && geminiResult) {
    console.log('\n--- COMPARISON ---');
    
    // Count words in each result
    const pythonWords = pythonResult.split(/\s+/).filter(w => w.length > 0).length;
    const geminiWords = geminiResult.split(/\s+/).filter(w => w.length > 0).length;
    
    console.log(`Python OCR: ${pythonWords} words`);
    console.log(`Gemini OCR: ${geminiWords} words`);
    
    // Calculate which one likely did better
    if (pythonWords > geminiWords * 1.2) {
      console.log('VERDICT: Python OCR extracted significantly more text');
    } else if (geminiWords > pythonWords * 1.2) {
      console.log('VERDICT: Gemini OCR extracted significantly more text');
    } else {
      console.log('VERDICT: Both methods extracted similar amounts of text');
    }
    
    // Check for common ingredients in both results
    const commonWords = new Set(
      pythonResult.toLowerCase().split(/\s+|,|;/).filter(w => 
        w.length > 3 && geminiResult.toLowerCase().includes(w)
      )
    );
    
    if (commonWords.size > 0) {
      console.log('\nCommon identified terms:');
      console.log(Array.from(commonWords).join(', '));
    }
  }
  
  console.log('\n=====================================================================\n');
}

// Main function to run tests
async function runComparisons() {
  console.log(`Found ${imageFiles.length} test images. Running OCR comparisons...`);
  
  for (const file of imageFiles) {
    const imagePath = path.join(testImagesDir, file);
    await compareMethods(imagePath);
  }
  
  console.log('All comparisons completed!');
}

// Run the comparisons
runComparisons().catch(err => {
  console.error('Error running comparisons:', err);
}); 