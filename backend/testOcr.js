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
async function testOcrMethods(imagePath) {
  console.log(`\n============ Testing OCR on ${path.basename(imagePath)} ============`);
  
  try {
    console.log('\n--- Python OCR ---');
    const pythonResult = await pythonOcr(imagePath);
    console.log('Result:', pythonResult);
  } catch (err) {
    console.error('Python OCR Error:', err.message);
  }
  
  try {
    console.log('\n--- Gemini OCR ---');
    const geminiResult = await geminiOcr(imagePath);
    console.log('Result:', geminiResult);
  } catch (err) {
    console.error('Gemini OCR Error:', err.message);
  }
  
  console.log('\n============================================================');
}

// Main function to run tests
async function runTests() {
  console.log(`Found ${imageFiles.length} test images. Running OCR tests...`);
  
  for (const file of imageFiles) {
    const imagePath = path.join(testImagesDir, file);
    await testOcrMethods(imagePath);
  }
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
}); 