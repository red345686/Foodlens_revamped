import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { extractTextFromImage as extractTextWithPythonOcr, parseIngredientsFromText } from './pythonOcrService.js';
import { extractTextFromImage as extractTextWithGeminiOcr } from './geminiOcrService.js';

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

// Function to analyze ingredients list image and evaluate ingredient safety
async function analyzeIngredientsImage(imagePath) {
  try {
    // Validate image file
    validateImageFile(imagePath);

    console.log('Starting ingredients analysis process...');

    // Step 1: Extract text from image using Python OCR
    let extractedText = '';
    let parsedIngredients = [];

    try {
      // First try Python OCR extraction
      console.log('Attempting to extract text using Python OCR...');
      extractedText = await extractTextWithPythonOcr(imagePath);

      // If Python OCR failed or returned an error message
      if (extractedText.startsWith('Error:') || extractedText.length < 10) {
        console.warn('Python OCR returned insufficient text, trying Gemini OCR fallback...');
        extractedText = await extractTextWithGeminiOcr(imagePath);
      }

      parsedIngredients = parseIngredientsFromText(extractedText);

      console.log('OCR extracted text:', extractedText);
      console.log('Parsed ingredients:', parsedIngredients);
    } catch (ocrError) {
      console.error('Primary OCR extraction failed, trying Gemini OCR fallback:', ocrError);

      try {
        // Try Gemini OCR as fallback
        extractedText = await extractTextWithGeminiOcr(imagePath);
        parsedIngredients = parseIngredientsFromText(extractedText);

        console.log('Gemini OCR extracted text:', extractedText);
        console.log('Parsed ingredients:', parsedIngredients);
      } catch (geminiOcrError) {
        console.error('Both OCR methods failed, falling back to direct image analysis:', geminiOcrError);
        // Will fall back to Gemini image analysis
      }
    }

    // Step 2: Analyze ingredients with Gemini
    console.log('Starting ingredients analysis with Gemini API...');

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create prompt for Gemini - using the extracted text if available
    let prompt;

    if (extractedText && extractedText.length > 10) {
      // We have OCR text, so analyze that directly
      prompt = `
        You are a food safety expert analyzing an ingredients list.
        
        Here is an ingredients list extracted from a product label using OCR:
        "${extractedText}"
        
        The OCR process has identified these possible individual ingredients:
        ${parsedIngredients.map(i => `- ${i}`).join('\n')}
        
        IMPORTANT TASKS:
        1. Correct any obvious OCR errors in the ingredients list.
        2. If the extracted list seems incomplete or garbled, note this in your analysis.
        3. Analyze each ingredient for potential health concerns.
        4. Categorize each as "harmful", "safe", or "unknown".
        5. For harmful ingredients, provide detailed explanation of concerns and rate severity (low/medium/high).
        6. Assign an overall safety score from 0-100.
        7.Assign an overall Nutrition score for whole product from 0-100.
        8. Assign an overall Sustainability score for whole product from 0-100.
        9. Assign an overall Processing Level tag for whole product .
        
        YOUR RESPONSE MUST BE IN THIS JSON FORMAT:
        {
          "extractedText": "the corrected OCR text",
          "ingredients": ["ingredient1", "ingredient2", ...],
          "harmfulIngredients": [
            {
              "name": "ingredient name",
              "reason": "detailed explanation of health concerns",
              "severity": "low/medium/high"
            }
          ],
          "safeIngredients": ["ingredient1", "ingredient2", ...],
          "unknownIngredients": ["ingredient1", "ingredient2", ...],
          "safetyScore": number from 0-100,
          "overallSafety": "detailed summary of overall safety assessment",
          "detailedAnalysis": "comprehensive explanation of all ingredient findings",
          "nutritionScore": number from 0-100,
          "sustainabilityScore": number from 0-100,
          "processingLevel": "minimally processed", "processed", "highly processed", or "ultra-processed"
        }
        
        IMPORTANT: safetyScore, nutritionScore, and sustainabilityScore MUST be numbers, not strings. Do not wrap them in quotes.
      `;
    } else {
      // No good OCR text, fall back to base64 image analysis
      const base64Image = encodeImageToBase64(imagePath);

      prompt = `
        You are a food safety expert specializing in extracting and analyzing ingredient lists from product labels.
        
        I am providing a food product ingredient list image (encoded as base64).
        The base64 encoded image is: ${base64Image}
        
        EXTRACTION TASK FIRST:
        1. Look at this image VERY CAREFULLY and extract ALL TEXT visible in the ingredients list.
        2. Pay close attention to small text, difficult-to-read portions, and chemical names.
        3. For any text that is partially visible or unclear, note it as [unclear].
        4. Format the extracted ingredients as a comma-separated list.
        
        ANALYSIS TASK SECOND (only after thorough text extraction):
        1. Analyze each extracted ingredient individually for safety concerns.
        2. Categorize ingredients as "harmful", "safe", or "unknown".
        3. For harmful ingredients, provide detailed health concern explanation and rate severity (low/medium/high).
        4. Assign an overall safety score from 0-100.
        5. Assign an overall Nutrition score for whole product from 0-100.
        6. Assign an overall Sustainability score for whole product from 0-100.
        7. Assign an overall Processing Level tag for whole product .
        
        YOUR RESPONSE MUST BE IN THIS JSON FORMAT:
        {
          "extractedText": "full text as visible in the image", 
          "ingredients": ["ingredient1", "ingredient2", ...],
          "harmfulIngredients": [
            {
              "name": "ingredient name",
              "reason": "detailed explanation of health concerns",
              "severity": "low/medium/high"
            }
          ],
          "safeIngredients": ["ingredient1", "ingredient2", ...],
          "unknownIngredients": ["ingredient1", "ingredient2", ...],
          "safetyScore": number from 0-100,
          "overallSafety": "detailed summary of overall safety assessment",
          "detailedAnalysis": "comprehensive explanation of all ingredient findings",
          "nutritionScore": number from 0-100,
          "sustainabilityScore": number from 0-100,
          "processingLevel": "minimally processed", "processed", "highly processed", or "ultra-processed"
        }
        
        If you cannot read the ingredients clearly, include the text "Unable to clearly read all ingredients" in the extractedText field, but still make your best attempt at analyzing any ingredients you can identify.
      `;
    }

    // Generate text with the model
    try {
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('Received response from Gemini API');
      console.log('Full response text from Gemini API:', text);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not extract JSON from response:', text.substring(0, 500));
        throw new Error('Failed to extract valid JSON from Gemini response');
      }

      try {
        const analysis = JSON.parse(jsonMatch[0]);

        // Log the extracted text for debugging
        if (analysis.extractedText) {
          console.log('Final extracted text:', analysis.extractedText);
        }

        console.log('Raw scores from API:', {
          nutritionScore: analysis.nutritionScore,
          sustainabilityScore: analysis.sustainabilityScore,
          processingLevel: analysis.processingLevel,
          safetyScore: analysis.safetyScore
        });

        // Ensure required fields are present
        if (!analysis.ingredients || analysis.ingredients.length === 0) {
          console.warn('No ingredients detected in the image');
          // If extractedText is available but ingredients array is empty, try to parse it
          if (analysis.extractedText) {
            analysis.ingredients = parseIngredientsFromText(analysis.extractedText);
            console.log('Created ingredients list from final extracted text:', analysis.ingredients);
          } else {
            analysis.ingredients = parsedIngredients.length > 0 ? parsedIngredients : [];
          }
        }

        if (!analysis.harmfulIngredients) analysis.harmfulIngredients = [];
        if (!analysis.safeIngredients) analysis.safeIngredients = [];
        if (!analysis.unknownIngredients) analysis.unknownIngredients = [];
        if (!analysis.safetyScore) analysis.safetyScore = 50;
        if (!analysis.overallSafety) {
          analysis.overallSafety = analysis.ingredients.length === 0
            ? "Unable to determine safety due to unclear ingredient list"
            : "Moderate safety rating based on identified ingredients";
        }
        if (!analysis.detailedAnalysis) {
          analysis.detailedAnalysis = analysis.ingredients.length === 0
            ? "Could not read ingredients clearly from the provided image"
            : "Analysis based on identified ingredients";
        }

        // Ensure nutrition, sustainability and processing level fields are present
        if (!analysis.nutritionScore) analysis.nutritionScore = 50;
        if (!analysis.sustainabilityScore) analysis.sustainabilityScore = 50;
        if (!analysis.processingLevel) analysis.processingLevel = "processed";

        return analysis;
      } catch (jsonError) {
        console.error('Error parsing JSON from Gemini response:', jsonError);
        throw new Error('Failed to parse JSON from Gemini response');
      }
    } catch (genaiError) {
      console.error('Error calling Gemini API:', genaiError);
      throw new Error(`Gemini API error: ${genaiError.message}`);
    }
  } catch (error) {
    console.error('Error in analyzeIngredientsImage:', error);
    throw new Error(`Failed to analyze ingredients: ${error.message}`);
  }
}

// Function to analyze product image and provide nutritional insights
async function analyzeProductImage(imagePath, productData) {
  try {
    // Validate image file
    validateImageFile(imagePath);

    console.log('Starting product analysis with Gemini API...');

    // Encode image to base64
    const base64Image = encodeImageToBase64(imagePath);

    // Initialize the model - using gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create prompt for Gemini to analyze the product
    const prompt = `
      You are a nutritionist and food science expert analyzing a food product.
      
      I'm providing a food product image and data for analysis.
      The base64 encoded image is: ${base64Image}
      
      Here is additional product data:
      ${JSON.stringify(productData, null, 2)}
      
      IMPORTANT INSTRUCTIONS:
      Carefully examine the image and provided data, then provide a comprehensive analysis including:
      1. Nutrition analysis - evaluate the healthiness on a scale of 0-100 with detailed explanation
      2. Allergenic content - identify ALL potential allergens present
      3. Additives and preservatives - identify ALL additives with health impact notes
      4. Sustainability score - evaluate environmental impact on a scale of 0-100
      5. Processing level - classify as "minimally processed", "processed", "highly processed", or "ultra-processed"
      
      YOUR RESPONSE MUST BE IN THIS JSON FORMAT AND NOTHING ELSE:
      {
        "nutritionScore": number between 0-100 (required),
        "nutritionEvaluation": detailed explanation (required),
        "allergens": ["allergen1", "allergen2", ...] (required),
        "additives": ["additive1", "additive2", ...] (required),
        "sustainabilityScore": number between 0-100 (required),
        "processingLevel": classification string (required),
        "overallRecommendation": comprehensive summary of findings (required)
      }
      
      Be sure to provide a number (not a string) for nutritionScore and sustainabilityScore.
      IMPORTANT: nutritionScore and sustainabilityScore MUST be numbers, not strings. Do not wrap them in quotes.
      Always include ALL fields in your response, even if empty (use [] for empty lists and 50 for uncertain scores).
    `;

    // Generate text with the model
    try {
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('Received response from Gemini API. First 500 chars:', text.substring(0, 500));
      console.log('Full response text from Gemini API:', text);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not extract JSON from response:', text.substring(0, 500));
        // Provide default values if no JSON response
        return createDefaultAnalysis("Could not extract JSON from Gemini response");
      }

      try {
        const jsonText = jsonMatch[0];
        console.log('Extracted JSON text:', jsonText.substring(0, 500));

        const analysis = JSON.parse(jsonText);
        console.log('Parsed analysis object:', analysis);

        console.log('Raw scores from API:', {
          nutritionScore: analysis.nutritionScore,
          sustainabilityScore: analysis.sustainabilityScore,
          processingLevel: analysis.processingLevel
        });

        // Validate the analysis object to ensure it has the required fields
        const validatedAnalysis = validateAndNormalizeAnalysis(analysis);
        console.log('Validated analysis object:', validatedAnalysis);

        return validatedAnalysis;
      } catch (jsonError) {
        console.error('Error parsing JSON from Gemini response:', jsonError);
        // Provide default values if JSON parsing fails
        return createDefaultAnalysis(`JSON parsing error: ${jsonError.message}`);
      }
    } catch (genaiError) {
      console.error('Error calling Gemini API:', genaiError);
      // Provide default values if Gemini API fails
      return createDefaultAnalysis(`Gemini API error: ${genaiError.message}`);
    }
  } catch (error) {
    console.error('Error in analyzeProductImage:', error);
    // Provide default values for any general error
    return createDefaultAnalysis(`General error: ${error.message}`);
  }
}

// Helper function to create a default analysis object with a reason
function createDefaultAnalysis(reason) {
  console.log(`Creating default analysis due to: ${reason}`);
  return {
    nutritionScore: 50,
    nutritionEvaluation: `Unable to evaluate nutrition. Reason: ${reason}`,
    allergens: [],
    additives: [],
    sustainabilityScore: 50,
    processingLevel: "processed",
    overallRecommendation: `Analysis could not be completed. Reason: ${reason}`
  };
}

// Helper function to validate and normalize the analysis object
function validateAndNormalizeAnalysis(analysis) {
  // Create a new object with normalized values
  const normalized = {
    nutritionScore: 50, // Default value
    nutritionEvaluation: "No detailed evaluation available",
    allergens: [],
    additives: [],
    sustainabilityScore: 50, // Default value
    processingLevel: "processed", // Default value
    overallRecommendation: "No specific recommendation available"
  };

  // Process nutritionScore - ensure it's a number between 0-100
  if (analysis.nutritionScore !== undefined && analysis.nutritionScore !== null) {
    let score = analysis.nutritionScore;
    console.log('Original nutritionScore from API:', score, 'type:', typeof score);

    if (typeof score === 'string') {
      // Try to convert string to number
      score = parseFloat(score);
      console.log('Converted nutritionScore from string:', score);
    }

    if (!isNaN(score) && score >= 0 && score <= 100) {
      normalized.nutritionScore = score;
      console.log('Final normalized nutritionScore:', normalized.nutritionScore);
    } else {
      console.warn('Invalid nutritionScore value, using default:', score);
    }
  } else {
    console.warn('nutritionScore is undefined or null, using default');
  }

  // Process sustainabilityScore - ensure it's a number between 0-100
  if (analysis.sustainabilityScore !== undefined && analysis.sustainabilityScore !== null) {
    let score = analysis.sustainabilityScore;
    console.log('Original sustainabilityScore from API:', score, 'type:', typeof score);

    if (typeof score === 'string') {
      // Try to convert string to number
      score = parseFloat(score);
      console.log('Converted sustainabilityScore from string:', score);
    }

    if (!isNaN(score) && score >= 0 && score <= 100) {
      normalized.sustainabilityScore = score;
      console.log('Final normalized sustainabilityScore:', normalized.sustainabilityScore);
    } else {
      console.warn('Invalid sustainabilityScore value, using default:', score);
    }
  } else {
    console.warn('sustainabilityScore is undefined or null, using default');
  }

  // Process other string fields
  if (analysis.nutritionEvaluation) {
    normalized.nutritionEvaluation = analysis.nutritionEvaluation;
  }

  if (analysis.processingLevel) {
    normalized.processingLevel = analysis.processingLevel;
  }

  if (analysis.overallRecommendation) {
    normalized.overallRecommendation = analysis.overallRecommendation;
  }

  // Process array fields
  if (Array.isArray(analysis.allergens)) {
    normalized.allergens = analysis.allergens;
  }

  if (Array.isArray(analysis.additives)) {
    normalized.additives = analysis.additives;
  }

  return normalized;
}

// Function to analyze manually entered ingredients
async function analyzeManualIngredients(ingredientsText) {
  try {
    console.log('Starting manual ingredients analysis with Gemini API...');

    // Validate and sanitize input
    if (!ingredientsText || typeof ingredientsText !== 'string') {
      console.error('Invalid ingredients text provided:', ingredientsText);
      throw new Error('Invalid ingredients text: must be a non-empty string');
    }

    // Sanitize the ingredients text
    const sanitizedText = String(ingredientsText)
      .trim()
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/(\d+\.?\d*)\s*%/g, '') // Remove percentages
      .replace(/\([^)]*\)/g, '')      // Remove content in parentheses
      .replace(/\s*,\s*/g, ', ');     // Standardize commas

    if (sanitizedText.length < 3) {
      console.error('Ingredients text too short after sanitization:', sanitizedText);
      throw new Error('Ingredients text too short or invalid after sanitization');
    }

    console.log('Sanitized ingredients text:', sanitizedText);

    // Initialize the model - using gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create prompt for Gemini to analyze the ingredients
    const prompt = `
      You are a food safety expert specialized in analyzing ingredient lists.
      
      I'm providing a list of ingredients from a food product:
      "${sanitizedText}"
      
      IMPORTANT INSTRUCTIONS:
      1. First, carefully parse this text into individual ingredients.
      2. Separate any combined ingredients into their individual components where appropriate.
      3. For EACH ingredient, determine if it's potentially harmful or concerning to human health.
      4. Categorize each as "harmful", "safe", or "unknown".
      5. For harmful ingredients, explain precisely why they're concerning and rate severity (low, medium, high).
      6. Assign an evidence-based overall safety score from 0-100.
      7. Assign an overall Nutrition score for the whole product from 0-100.
      8. Assign an overall Sustainability score for the whole product from 0-100.
      9. Assign an overall Processing Level tag for the whole product.
      
      YOUR RESPONSE MUST BE IN THIS JSON FORMAT:
      {
        "ingredients": ["ingredient1", "ingredient2", ...],
        "harmfulIngredients": [
          {
            "name": "ingredient name",
            "reason": "detailed explanation of health concerns",
            "severity": "low/medium/high"
          }
        ],
        "safeIngredients": ["ingredient1", "ingredient2", ...],
        "unknownIngredients": ["ingredient1", "ingredient2", ...],
        "safetyScore": number from 0-100,
        "overallSafety": "detailed summary of overall safety assessment",
        "detailedAnalysis": "comprehensive explanation of all ingredient findings",
        "nutritionScore": number from 0-100,
        "sustainabilityScore": number from 0-100,
        "processingLevel": "minimally processed", "processed", "highly processed", or "ultra-processed"
      }
      
      IMPORTANT: safetyScore, nutritionScore, and sustainabilityScore MUST be numbers, not strings. Do not wrap them in quotes.
    `;

    // Generate text with the model
    try {
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('Received response from Gemini API');
      console.log('Full response text from Gemini API:', text);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not extract JSON from response:', text.substring(0, 500));
        throw new Error('Failed to extract valid JSON from Gemini response');
      }

      try {
        const analysis = JSON.parse(jsonMatch[0]);

        // Ensure required fields are present
        if (!analysis.ingredients || analysis.ingredients.length === 0) {
          console.warn('No ingredients detected in the provided text');
          // Extract ingredients from the text as a fallback
          analysis.ingredients = sanitizedText
            .split(/,|;/)
            .map(item => item.trim())
            .filter(item => item.length > 0);

          console.log('Created ingredients list from manual text:', analysis.ingredients);
        }

        console.log('Raw scores from API:', {
          nutritionScore: analysis.nutritionScore,
          sustainabilityScore: analysis.sustainabilityScore,
          processingLevel: analysis.processingLevel,
          safetyScore: analysis.safetyScore
        });

        if (!analysis.harmfulIngredients) analysis.harmfulIngredients = [];
        if (!analysis.safeIngredients) analysis.safeIngredients = [];
        if (!analysis.unknownIngredients) analysis.unknownIngredients = [];
        if (!analysis.safetyScore) analysis.safetyScore = 50;
        if (!analysis.overallSafety) {
          analysis.overallSafety = analysis.ingredients.length === 0
            ? "Unable to determine safety due to unclear ingredient list"
            : "Moderate safety rating based on identified ingredients";
        }
        if (!analysis.detailedAnalysis) {
          analysis.detailedAnalysis = "Analysis based on the provided ingredients list";
        }

        // Ensure nutrition, sustainability and processing level fields are present
        if (!analysis.nutritionScore) analysis.nutritionScore = 50;
        if (!analysis.sustainabilityScore) analysis.sustainabilityScore = 50;
        if (!analysis.processingLevel) analysis.processingLevel = "processed";

        return analysis;
      } catch (jsonError) {
        console.error('Error parsing JSON from Gemini response:', jsonError);
        throw new Error('Failed to parse JSON from Gemini response');
      }
    } catch (genaiError) {
      console.error('Error calling Gemini API:', genaiError);
      throw new Error(`Gemini API error: ${genaiError.message}`);
    }
  } catch (error) {
    console.error('Error in analyzeManualIngredients:', error);

    // Return a fallback analysis object rather than throwing an error
    const fallbackIngredients = ingredientsText
      ? ingredientsText.split(/,|;/).map(i => i.trim()).filter(i => i.length > 0)
      : [];

    return {
      ingredients: fallbackIngredients,
      harmfulIngredients: [],
      safeIngredients: fallbackIngredients,
      unknownIngredients: [],
      safetyScore: 50,
      overallSafety: "Unable to perform full analysis on ingredients",
      detailedAnalysis: `Could not complete analysis due to: ${error.message}. The product contains: ${fallbackIngredients.join(', ')}`,
      nutritionScore: 50,
      sustainabilityScore: 50,
      processingLevel: "processed"
    };
  }
}

export { analyzeProductImage, analyzeIngredientsImage, analyzeManualIngredients };