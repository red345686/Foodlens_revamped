import { useState } from "react";

const GetInfoWithBarcode = () => {
  const [file, setFile] = useState(null);
  const [barcode, setBarcode] = useState('');
  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value);
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const [text, setText] = useState('');
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  const getData = async () => {
    if (!barcode) {
      alert('Please provide barcode.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/product/${barcode}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Product Details:', result);
        setText(JSON.stringify(result, null, 2)); // Display the product details in a readable format
      } else {
        console.error('Failed to fetch product details.');
        alert('Failed to fetch product details. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert('An error occurred while fetching product details.');
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please provide file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    // formData.append('text', text);
    try {
      const response = await fetch('http://localhost:5000/getbarcode', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        if (result.status === 'failed') {
          alert('Failed to extract barcode. Please try again.');
          return;
        } else {
          // alert('Upload successful!');
          setBarcode(result.barcode);
        }
      } else {
        console.error('Upload failed.');
        // alert('Upload failed.');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('An error occurred while uploading.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center">Temporary Upload Form</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Choose a File</label>
          <input type="file" onChange={handleFileChange} className="mt-1" />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Try extracting barcode
        </button>
      </form>
      <div className="mt-4 text-center">

        <div className="bg-gray-200 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Barcode:</h3>
          <input placeholder='Manually enter barcode' value={barcode} onChange={handleBarcodeChange} className="text-gray-700" />
          <button onClick={getData}>Fetch data</button>
        </div>

        {text && (
          <div className="bg-gray-200 p-4 rounded-md mt-4">
            <h3 className="text-lg font-semibold">Extracted Text:</h3>
            <p className="text-gray-700">{text}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GetInfoWithBarcode
