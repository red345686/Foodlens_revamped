import cv2
import pytesseract
from PIL import Image
import os
import json
import sys

# On Windows, you might need to set the tesseract path
# Uncomment and update the path if Tesseract is not in your PATH
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

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
        
        if not preprocess:
            # Direct OCR without preprocessing
            return pytesseract.image_to_string(Image.open(image_path))
        
        # We'll try multiple preprocessing techniques and combine results
        all_results = []
        
        # Method 1: Basic grayscale and binary thresholding
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply binary thresholding
            binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            
            # Save the processed image temporarily
            temp_binary = f"temp_binary_{os.path.basename(image_path)}"
            cv2.imwrite(temp_binary, binary)
            
            # Extract text using pytesseract
            binary_text = pytesseract.image_to_string(Image.open(temp_binary))
            all_results.append(binary_text)
            
            # Clean up
            if os.path.exists(temp_binary):
                os.remove(temp_binary)
        except Exception as e:
            print(f"Binary method failed: {str(e)}")
        
        # Method 2: Adaptive thresholding
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply adaptive thresholding
            adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            
            # Save the processed image temporarily
            temp_adaptive = f"temp_adaptive_{os.path.basename(image_path)}"
            cv2.imwrite(temp_adaptive, adaptive)
            
            # Extract text using pytesseract
            adaptive_text = pytesseract.image_to_string(Image.open(temp_adaptive))
            all_results.append(adaptive_text)
            
            # Clean up
            if os.path.exists(temp_adaptive):
                os.remove(temp_adaptive)
        except Exception as e:
            print(f"Adaptive method failed: {str(e)}")
        
        # Method 3: Denoising + thresholding
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply denoising
            denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
            
            # Apply thresholding
            denoised_binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            
            # Save the processed image temporarily
            temp_denoised = f"temp_denoised_{os.path.basename(image_path)}"
            cv2.imwrite(temp_denoised, denoised_binary)
            
            # Extract text using pytesseract
            denoised_text = pytesseract.image_to_string(Image.open(temp_denoised))
            all_results.append(denoised_text)
            
            # Clean up
            if os.path.exists(temp_denoised):
                os.remove(temp_denoised)
        except Exception as e:
            print(f"Denoising method failed: {str(e)}")
        
        # Choose the best result (longest non-empty text)
        all_results = [text for text in all_results if text.strip()]
        if not all_results:
            return "No text was detected in the image after multiple processing attempts."
        
        # Select longest result which likely contains most information
        best_result = max(all_results, key=len)
        return best_result
        
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
