import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from '@google/genai';

dotenv.config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const userInput = req.body.prompt;
    const imagePath = req.file?.path;
    const imageMime = req.file?.mimetype;

    const contentParts = [];

    // If image is provided, upload it to Gemini and add to parts
    if (imagePath && imageMime) {
      const uploaded = await ai.files.upload({
        file: imagePath,
        purpose: 'grounding',
        config: { mimeType: imageMime },
      });

      const imagePart = createPartFromUri(uploaded.uri, uploaded.mimeType, uploaded.id);
      contentParts.push(imagePart);
      fs.unlinkSync(imagePath);  // Delete the file after processing
    }

    // Add the user's prompt
    contentParts.push(
      `You are a helpful food assistant on the FoodLens platform.`,
      `\n\nUser query: ${userInput}`
    );

    const contents = createUserContent(contentParts);

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
    });
    console.log('Gemini response:', result.text);
    res.json({ response: result.text?.trim() || 'No response generated.' });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to process chatbot request.' });
  }
});

export default router;
