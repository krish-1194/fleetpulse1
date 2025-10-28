import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { fetchWithAuth, clearTokens } from '../utils/api';

const UpdateVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fuelType, setFuelType] = useState(''); // New state for fuelType
  const [registeredName, setRegisteredName] = useState(''); // New state for registeredName
  const [transmissionType, setTransmissionType] = useState(''); // New state for transmissionType
  const [registrationNo, setRegistrationNo] = useState(''); // New state for registration number
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // For header avatar

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          console.error("Failed to fetch user data:", response.statusText);
          if (response.status === 401) {
            await clearTokens();
            navigate('/login');
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        await clearTokens();
        navigate('/login');
      }
    };

    const fetchVehicleData = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}`);

        if (response.ok) {
          const data = await response.json();
          setVehicle(data);
          setName(data.name);
          setYear(data.year);
          setLocation(data.location);
          setImageUrl(data.imageUrl);
          setFuelType(data.fuelType || ''); // Initialize fuelType state
          setRegisteredName(data.registeredName || ''); // Initialize registeredName state
          setTransmissionType(data.transmissionType || ''); // Initialize transmissionType state
          setRegistrationNo(data.registrationNo || ''); // Initialize registrationNo state
        } else {
          setError('Vehicle not found or you do not have permission to edit it.');
          if (response.status === 401) {
            await clearTokens();
            navigate('/login');
          }
        }
      } catch (err) {
        setError('Could not connect to the server or authentication failed.');
        await clearTokens();
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchVehicleData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const updatedVehicle = { name, year: parseInt(year), location, imageUrl, fuelType, registeredName, transmissionType, registrationNo };

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVehicle),
      });

      if (response.ok) {
        setMessage('Vehicle updated successfully!');
        setTimeout(() => navigate(`/vehicle/${id}`), 1500); // Redirect to detail page
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update vehicle.');
        if (response.status === 401) {
            await clearTokens();
            navigate('/login');
        }
      }
    } catch (err) {
      console.error("Error updating vehicle:", err);
      setError('Could not connect to the server to update vehicle or authentication failed.');
      await clearTokens();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white text-center p-8">Loading vehicle data...</div>;
  }

  if (error && !vehicle) {
    return <div className="min-h-screen bg-gray-900 text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentUser={currentUser} />
      <main className="container mx-auto p-4 md:p-8 relative">
        <Link
          to={`/vehicle/${id}`}
          className="absolute top-4 left-4 md:top-8 md:left-8 text-slate-400 hover:text-sky-400 transition-colors"
          aria-label="Back to Vehicle Detail"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-100 mb-6 text-center">Update Vehicle</h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {message && <p className="text-green-500 text-center mb-4">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Vehicle Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-slate-300">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-300">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="fuelType" className="block text-sm font-medium text-slate-300">Fuel Type</label>
              <input
                type="text"
                id="fuelType"
                name="fuelType"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="registeredName" className="block text-sm font-medium text-slate-300">Registered Name</label>
              <input
                type="text"
                id="registeredName"
                name="registeredName"
                value={registeredName}
                onChange={(e) => setRegisteredName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="transmissionType" className="block text-sm font-medium text-slate-300">Transmission Type</label>
              <input
                type="text"
                id="transmissionType"
                name="transmissionType"
                value={transmissionType}
                onChange={(e) => setTransmissionType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="registrationNo" className="block text-sm font-medium text-slate-300">Registration No.</label>
              <input
                type="text"
                id="registrationNo"
                name="registrationNo"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-300">Image URL</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors duration-200"
                onClick={() => navigate(`/vehicle/${id}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UpdateVehiclePage;
