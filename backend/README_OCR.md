# FoodLens OCR Implementation

This directory contains the OCR (Optical Character Recognition) services used by FoodLens to extract text from ingredient images.

## Overview

FoodLens uses a dual OCR approach for processing ingredient images:

1. **Python-based OCR** (Primary method)

   - Uses `pytesseract` (Python wrapper for Tesseract OCR)
   - Includes image preprocessing for better text recognition
   - Offers better accuracy for clear images

2. **Gemini OCR** (Fallback method)
   - Uses Google's Gemini API Vision capabilities
   - May work better on complex or low-quality images
   - Used automatically if Python OCR fails

## Requirements

### For Python OCR:

1. **Python 3.6+**
2. **Tesseract OCR**
   - Windows: Download from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
   - Add to PATH or update path in `ocr_script.py`
3. **Python packages**:
   - opencv-python-headless
   - pytesseract
   - pillow

Install Python packages:

```
pip install opencv-python-headless pytesseract pillow
```

### For Gemini OCR:

- Google Gemini API key (stored in `.env` file)

## Files

- `pythonOcrService.js` - JavaScript service for Python OCR integration
- `ocr_script.py` - Python script for OCR (auto-generated)
- `geminiOcrService.js` - JavaScript service for Gemini OCR
- `geminiService.js` - Main service that combines both OCR methods
- `testOcr.js` - Test script for trying both OCR methods

## Testing OCR

1. Create a directory named `test_images` in the project root
2. Add some image files with ingredients text
3. Run the test script:
   ```
   node backend/testOcr.js
   ```

## Troubleshooting

### Python OCR issues:

- Check if Tesseract is properly installed and in PATH
- Try uncommenting and updating the Tesseract path in `ocr_script.py`
- Make sure all required Python packages are installed

### Gemini OCR issues:

- Verify your Gemini API key is valid
- Check for rate limiting issues

## OCR Processing Steps

1. Image preprocessing (Python OCR only):
   - Grayscale conversion
   - Thresholding
   - Noise removal
2. Text extraction:
   - Extract raw text from the image
3. Text cleaning:
   - Remove excessive whitespace
   - Format ingredients lists
   - Remove OCR artifacts
4. Ingredient parsing:
   - Split text into individual ingredients
   - Clean up ingredients (remove percentages, etc.)

## Implementation Details

The system first attempts to use Python OCR. If that fails (returns an error or insufficient text), it automatically falls back to Gemini OCR. If both OCR methods fail, the system will use direct image analysis with Gemini API.
