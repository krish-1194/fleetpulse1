import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard';

const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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
      }
    };

    const fetchVehicles = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      const mappedVehicles = data.map(v => ({ ...v, id: v._id }));
      setVehicles(mappedVehicles);
      setFilteredVehicles(mappedVehicles); // Initialize filtered vehicles with all vehicles
    };

    fetchUserData();
    fetchVehicles().catch(err => console.error("Failed to fetch vehicles:", err));
  }, []);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    let currentVehicles = [...vehicles]; // Create a mutable copy

    if (lowerCaseSearchTerm === '') {
      // When no search term, sort by favorite status
      currentVehicles.sort((a, b) => {
        if (a.isFavorited && !b.isFavorited) return -1;
        if (!a.isFavorited && b.isFavorited) return 1;
        return a.name.localeCompare(b.name); // Alphabetical sort for same favorite status
      });
      setFilteredVehicles(currentVehicles);
      return;
    }

    // When there is a search term, apply search logic
    const exactMatches = currentVehicles.filter(vehicle => vehicle.name.toLowerCase() === lowerCaseSearchTerm);
    const partialMatches = currentVehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(lowerCaseSearchTerm) &&
      !exactMatches.includes(vehicle)
    );

    // Sort partial matches alphabetically
    partialMatches.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredVehicles([...exactMatches, ...partialMatches]);
  }, [searchTerm, vehicles]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const onToggleFavorite = async (vehicleId, newFavoriteStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorited: newFavoriteStatus }),
      });

      if (response.ok) {
        setVehicles(prevVehicles =>
          prevVehicles.map(v => (v.id === vehicleId ? { ...v, isFavorited: newFavoriteStatus } : v))
        );
      } else {
        console.error("Failed to update favorite status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentUser={currentUser} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Your Fleet</h1>
          <p className="text-md text-slate-400 mt-1 mb-4">An overview of your active vehicles.</p>

          {/* Search Bar */}
          <div className="w-full relative max-w-md">
            <input
              type="text"
              placeholder="Search vehicles by name..."
              className="w-full p-2 pl-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ease-in-out"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Responsive Grid for Vehicle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {filteredVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onToggleFavorite={onToggleFavorite} />
          ))}

          {/* Add Vehicle Card */}
          <Link to="/add-vehicle" className="block group h-full">
            <div className="bg-slate-800 rounded-xl shadow-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-600 hover:border-sky-500 hover:bg-slate-700 transition-all duration-300 ease-in-out p-4 h-[212px]">
              <div className="text-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="font-semibold text-lg">Add New Vehicle</span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
