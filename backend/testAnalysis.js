import { analyzeIngredientsImage } from './geminiService.js';
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

// Function to test ingredient analysis on an image
async function testAnalysis(imagePath) {
  console.log(`\n===================== ANALYZING ${path.basename(imagePath)} =====================`);
  
  try {
    console.log('\nRunning full ingredient analysis (OCR + AI evaluation)...');
    const analysis = await analyzeIngredientsImage(imagePath);
    
    // Display the results
    console.log('\n--- ANALYSIS RESULTS ---');
    console.log('Extracted Text:', analysis.extractedText);
    console.log('\nIngredients:', analysis.ingredients.join(', '));
    
    console.log('\nHarmful Ingredients:');
    if (analysis.harmfulIngredients.length === 0) {
      console.log('None found');
    } else {
      analysis.harmfulIngredients.forEach(item => {
        console.log(`- ${item.name} (Severity: ${item.severity})`);
        console.log(`  Reason: ${item.reason}`);
      });
    }
    
    console.log('\nSafe Ingredients:', analysis.safeIngredients.join(', ') || 'None found');
    console.log('\nUnknown Ingredients:', analysis.unknownIngredients.join(', ') || 'None found');
    console.log('\nSafety Score:', analysis.safetyScore);
    console.log('\nOverall Safety:', analysis.overallSafety);
  } catch (err) {
    console.error('Analysis Error:', err.message);
  }
  
  console.log('\n=====================================================================\n');
}

// Main function to run tests
async function runAnalysis() {
  console.log(`Found ${imageFiles.length} test images. Running ingredient analysis...`);
  
  for (const file of imageFiles) {
    const imagePath = path.join(testImagesDir, file);
    await testAnalysis(imagePath);
  }
  
  console.log('All analyses completed!');
}

// Run the analysis
runAnalysis().catch(err => {
  console.error('Error running analysis:', err);
}); 