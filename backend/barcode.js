import dotenv from 'dotenv';
dotenv.config();
import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function extractBarcodeFromImage(filePath) {
  try {
    const myfile = await ai.files.upload({
      file: filePath,
      purpose: 'ocr',
      config: {
        mimeType: 'image/jpeg',
      },
    });
    // console.log('File uploaded:', myfile);
    console.log('Uploaded file:', myfile);

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType, myfile.id),
        '\n\n',
        'Can you extract the barcode from the image? Please provide only barcode without any spaces and no other text.',
      ]),
    });

    console.log('Result:', result.text);
    return result.text.trim();
  } catch (error) {
    console.error('Error extracting barcode:', error);
    throw error;
  }
}

export default extractBarcodeFromImage;
