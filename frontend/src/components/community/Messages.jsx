import { useState } from 'react';
import MarkDown from 'react-markdown';

const Messages = () => {
  const [userInput, setUserInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [geminiOutput, setGeminiOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
  };

  const handleGeminiSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setGeminiOutput('');

    const formData = new FormData();
    formData.append('prompt', userInput);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setGeminiOutput(data.response || 'No response received.');
    } catch (err) {
      console.error('Error sending request:', err);
      setGeminiOutput('An error occurred while contacting Gemini.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#294c25] mb-4">Seek AI assistance</h1>

      <form onSubmit={handleGeminiSubmit} className="mb-6 space-y-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Your query here ..."
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#294c25]"
          rows={4}
        />

        <div>
          <label
            htmlFor="image-upload"
            className="inline-block cursor-pointer px-4 py-2 bg-white text-[#294c25] border border-[#294c25] rounded-md hover:bg-[#294c25] hover:text-white transition"
          >
            {imageFile ? 'Change Image' : 'Upload Image'}
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {imageFile && (
            <div className="mt-2 flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                Selected: <strong>{imageFile.name}</strong>
              </p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="border bg-red-600 rounded text-white p-1 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !userInput.trim()}
          className={`mt-2 px-4 py-2 bg-[#294c25] text-white rounded-md ${
            loading || !userInput.trim()
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#1a3317]'
          }`}
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {geminiOutput && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Gemini Output:</h2>
          <MarkDown>{geminiOutput}</MarkDown>
        </div>
      )}
    </div>
  );
};

export default Messages;
