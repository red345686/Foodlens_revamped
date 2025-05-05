import dotenv from 'dotenv';
dotenv.config();
import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Function to analyze product image and provide nutritional insights
async function analyzeProductImage(imagePath, productData) {
  try {
    // Upload the file to Google AI
    const uploadedFile = await ai.files.upload({
      file: imagePath,
      purpose: 'vision',
      config: {
        mimeType: 'image/jpeg',
      },
    });
    
    console.log('Uploaded product image for analysis');
    
    // Create prompt for Gemini to analyze the product
    const prompt = `
      Analyze this food product image and the following product data:
      
      ${JSON.stringify(productData, null, 2)}
      
      Please provide the following information:
      1. Nutrition analysis - evaluate the healthiness on a scale of 0-100
      2. Allergenic content - identify potential allergens
      3. Additives and preservatives - identify potential harmful additives
      4. Sustainability score - evaluate environmental impact on a scale of 0-100
      5. Processing level - evaluate the processing level (minimally processed to ultra-processed)
      
      Return your analysis as a structured JSON object with the following format:
      {
        "nutritionScore": (number between 0-100),
        "nutritionEvaluation": (string explanation),
        "allergens": [(list of strings)],
        "additives": [(list of strings with any concerns noted)],
        "sustainabilityScore": (number between It should be a JSON object that can be parsed.
        "processingLevel": (string: "minimally processed", "processed", "highly processed", or "ultra-processed"),
        "overallRecommendation": (string summary of your findings)
      }
    `;

    // Generate content using Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-pro-latest',
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType, uploadedFile.id),
        '\n\n',
        prompt,
      ]),
    });

    // Parse the JSON response
    const responseText = result.text.trim();
    // Extract JSON from response (in case there's any extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract valid JSON from Gemini response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing product image:', error);
    throw error;
  }
}

export { analyzeProductImage }; 