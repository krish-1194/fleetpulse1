import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

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
      <main className="container mx-auto p-4 md:p-8">
        {vehicle ? (
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-100">{vehicle.name}</h1>
            <p className="text-lg text-slate-400 mt-2">{vehicle.year} - {vehicle.location}</p>
            <img src={vehicle.imageUrl || "https://placehold.co/600x400/1e293b/94a3b8?text=Image+Not+Found"} alt={vehicle.name} className="mt-6 rounded-lg w-full object-cover" />
            {/* TODO: Add more vehicle details, edit/delete buttons, etc. */}
          </div>
        ) : (
          <p>No vehicle data found.</p>
        )}
      </main>
    </div>
  );
};

export default VehicleDetailPage;

