import React from 'react';
import NavBar from './components/NavBar';

const mockProducts = [
  {
    id: 1,
    name: 'Fromage blanc nature',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    score: 75,
    nutrition: ['A', '3', 'Green']
  },
  {
    id: 2,
    name: 'Greek Yogurt',
    image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    score: 82,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 3,
    name: 'Fresh Salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1968&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    score: 90,
    nutrition: ['A', '1', 'Green']
  },
  {
    id: 4,
    name: 'Whole Wheat Bread',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    score: 70,
    nutrition: ['B', '4', 'Yellow']
  },
  {
    id: 5,
    name: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    score: 88,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 6,
    name: 'Fruit Bowl',
    image: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    score: 95,
    nutrition: ['A', '1', 'Green']
  },
  {
    id: 7,
    name: 'Oatmeal',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    score: 80,
    nutrition: ['A', '2', 'Green']
  },
  {
    id: 8,
    name: 'Egg Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    score: 77,
    nutrition: ['B', '3', 'Yellow']
  }
];

const NutriBadge = ({ type }) => {
  if (type === 'A') return <span className="bg-green-600 text-white rounded px-2 py-0.5 text-xs font-bold">A</span>;
  if (type === 'B') return <span className="bg-yellow-400 text-white rounded px-2 py-0.5 text-xs font-bold">B</span>;
  if (type === '1') return <span className="bg-green-200 text-green-900 rounded px-2 py-0.5 text-xs font-bold">1</span>;
  if (type === '2') return <span className="bg-green-300 text-green-900 rounded px-2 py-0.5 text-xs font-bold">2</span>;
  if (type === '3') return <span className="bg-yellow-200 text-yellow-900 rounded px-2 py-0.5 text-xs font-bold">3</span>;
  if (type === '4') return <span className="bg-yellow-400 text-yellow-900 rounded px-2 py-0.5 text-xs font-bold">4</span>;
  if (type === 'Green') return <span className="bg-green-500 text-white rounded px-2 py-0.5 text-xs font-bold">Green</span>;
  if (type === 'Yellow') return <span className="bg-yellow-400 text-white rounded px-2 py-0.5 text-xs font-bold">Yellow</span>;
  return null;
};

const Products = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200">
      <NavBar page="products" />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <br />
        <h1 className="text-3xl font-extrabold text-green-900 mb-8 text-center tracking-tight drop-shadow-lg">Explore products</h1>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Type here to search"
            className="flex-1 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white shadow-sm"
            disabled
          />
          <button className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center text-green-900 shadow-sm" disabled>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 6v12m12-12v12M6 18h12" /></svg>
            Filter
          </button>
          <button className="bg-green-700 text-white rounded-lg px-4 py-2 flex items-center shadow-sm" disabled>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            Upload Your Food
          </button>
        </div>
        <div className="rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {mockProducts.map(product => (
              <div
                key={product.id}
                className="bg-white/80 rounded-2xl shadow-lg p-4 flex flex-col items-center transition transform hover:scale-105 hover:shadow-2xl backdrop-blur-md border border-green-100"
                aria-label={product.name}
              >
                <div className="relative w-24 h-24 mb-2 overflow-hidden rounded-xl shadow-md">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover filter brightness-95 contrast-110 hover:brightness-100 hover:contrast-125 transition"
                    style={{ background: '#e6f4ea' }}
                  />
                  <span className="absolute top-0 right-0 bg-green-700 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow">{product.score}%</span>
                </div>
                <div className="text-green-900 font-semibold text-base mb-1 text-center drop-shadow-sm">{product.name}</div>
                <div className="flex space-x-1 mt-1">
                  {product.nutrition.map((badge, idx) => (
                    <NutriBadge key={idx} type={badge} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
