import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FuelLogCard from '../components/FuelLogCard';
import MaintenanceLogCard from '../components/MaintenanceLogCard';
import InsuranceLogCard from '../components/InsuranceLogCard';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // New state for currentUser
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          } else {
            console.error("Failed to fetch user data:", response.statusText);
            // Optionally, handle token expiration or invalid token by logging out user
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        navigate('/login'); // Redirect if no token
      }
    };

    const fetchVehicle = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setVehicle(data);
        } else {
          setError('Vehicle not found or you do not have permission to view it.');
        }
      } catch (err) {
        setError('Could not connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchVehicle();
  }, [id, navigate]); // Add navigate to dependency array

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white text-center p-8">Loading vehicle details...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentUser={currentUser} />
      <main className="container mx-auto p-4 md:p-8 relative">
        <Link
          to="/"
          className="absolute top-4 left-4 md:top-8 md:left-8 text-slate-400 hover:text-sky-400 transition-colors z-10"
          aria-label="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        {vehicle ? (
          <div className="space-y-8">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-slate-100 flex items-center justify-between">
                {vehicle.name}
                <button
                  onClick={() => navigate(`/vehicle/${id}/edit`)}
                  className="px-4 py-2 bg-sky-600 text-white text-base font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-colors duration-200"
                >
                  Update
                </button>
              </h1>
              <p className="text-lg text-slate-400 mt-2">{vehicle.year} - {vehicle.location}</p>
              <img src={vehicle.imageUrl || "https://placehold.co/600x400/1e293b/94a3b8?text=Image+Not+Found"} alt={vehicle.name} className="mt-6 rounded-lg w-full object-cover" />
              {vehicle.fuelType && (
                <p className="text-md text-slate-400 mt-1">Fuel Type: {vehicle.fuelType}</p>
              )}
              {vehicle.registeredName && (
                <p className="text-md text-slate-400 mt-1">Registered Name: {vehicle.registeredName}</p>
              )}
              {vehicle.transmissionType && (
                <p className="text-md text-slate-400 mt-1">Transmission Type: {vehicle.transmissionType}</p>
              )}
              {vehicle.registrationNo && (
                <p className="text-md text-slate-400 mt-1">Registration No.: {vehicle.registrationNo}</p>
              )}
              {/* TODO: Add more vehicle details, edit/delete buttons, etc. */}
            </div>
            <FuelLogCard vehicleId={vehicle._id} />
            <MaintenanceLogCard vehicleId={vehicle._id} />
            <InsuranceLogCard vehicleId={vehicle._id} />
          </div>
        ) : (
          <p>No vehicle data found.</p>
        )}
      </main>
    </div>
  );
};

export default VehicleDetailPage;

