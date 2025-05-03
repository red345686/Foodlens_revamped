import React from 'react'

const GetInfoWithName = () => {
  const [prodName, setProdName] = React.useState('');
  const [text, setText] = React.useState('');
  const handleProdNameChange = (e) => {
    setProdName(e.target.value);
  }
  const getData = async () => {
    if (!prodName) {
      alert('Please provide product name.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/product/byname/${prodName}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Product Details:', result);
        setText(JSON.stringify(result[0], null, 2)); // Display the product details in a readable format
      } else {
        console.error('Failed to fetch product details.');
        alert('Failed to fetch product details. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert('An error occurred while fetching product details.');
    }
  }
  return (
    <div>
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-4xl font-bold mb-4'>Get Product Information by Name</h1>
        <input
          type='text'
          value={prodName}
          onChange={handleProdNameChange}
          placeholder='Enter product name'
          className='border border-gray-300 rounded-lg p-2 mb-4 w-1/2'
        />
        <button
          onClick={getData} // Replace with your fetch logic
          className='bg-blue-500 text-white px-4 py-2 rounded-lg'
        >
          Get Info
        </button>
        <div className='mt-4'>
          <h2 className='text-2xl font-semibold'>Product Details:</h2>
          <pre className='bg-gray-100 p-4 rounded-lg mt-2'>{text}</pre>
        </div>
      </div>
    </div>
  )
}

export default GetInfoWithName
