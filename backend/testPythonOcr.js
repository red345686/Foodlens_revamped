import { extractTextFromImage } from './pythonOcrService.js';
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

// Function to test OCR on an image
async function testOcr(imagePath) {
  console.log(`\n============ Testing Python OCR on ${path.basename(imagePath)} ============`);
  
  try {
    console.log('Starting OCR extraction...');
    const result = await extractTextFromImage(imagePath);
    console.log('Result:', result);
  } catch (err) {
    console.error('Python OCR Error:', err.message);
  }
  
  console.log('============================================================\n');
}

// Main function to run tests
async function runTests() {
  console.log(`Found ${imageFiles.length} test images. Running Python OCR tests...`);
  
  for (const file of imageFiles) {
    const imagePath = path.join(testImagesDir, file);
    await testOcr(imagePath);
  }
  
  console.log('All tests completed!');
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
}); 