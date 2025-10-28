import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard';

const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);

  // TODO: Fetch vehicle data from the backend when the component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      // Mongoose uses _id, so we map it to id for the frontend component
      setVehicles(data.map(v => ({ ...v, id: v._id })));
    };
    fetchVehicles().catch(err => console.error("Failed to fetch vehicles:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Your Fleet</h1>
          <p className="text-md text-slate-400 mt-1">An overview of your active vehicles.</p>
        </div>

        {/* Responsive Grid for Vehicle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} isInitiallyFavorited={vehicle.isFavorited} />
          ))}

          {/* Add Vehicle Card */}
          <Link to="/add-vehicle" className="block group">
            <div className="h-full bg-slate-800 rounded-xl shadow-lg flex items-center justify-center border-2 border-dashed border-slate-600 hover:border-sky-500 hover:bg-slate-700 transition-all duration-300 ease-in-out">
              <div className="text-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="font-semibold">Add New Vehicle</span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
