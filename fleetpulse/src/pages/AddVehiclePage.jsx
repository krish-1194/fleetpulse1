import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

const AddVehiclePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const vehicleData = { name, year, location, imageUrl };

    // TODO: Implement the backend API call to save the vehicle data.
    // For now, we'll just log it and navigate back to the home page.
    console.log('Submitting vehicle data:', vehicleData);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        navigate('/'); // Redirect to home page on success
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add vehicle.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto p-4 md:p-8 relative">
        <Link
          to="/"
          className="absolute top-4 left-4 md:top-8 md:left-8 text-slate-400 hover:text-sky-400 transition-colors"
          aria-label="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-slate-100 mb-6">Add a New Vehicle</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Vehicle Name (e.g., Ford Transit 250)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="number"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Year (e.g., 2023)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Location (e.g., New York, NY)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <input
              type="url"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-200">
              Add Vehicle
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddVehiclePage;
