import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        } else {
          console.error("Failed to fetch user data:", response.statusText); // Log actual error
          setError('Failed to fetch user profile.');
        }
      } catch (err) {
        console.error("Error fetching user data:", err); // Log actual error
        setError('Could not connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white text-center p-8">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentUser={currentUser} />
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
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : currentUser ? (
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <img src={`https://placehold.co/150x150/94a3b8/1e293b?text=${currentUser.email.charAt(0).toUpperCase()}`} alt="Profile" className="w-32 h-32 rounded-full mb-4 border-4 border-sky-500" />
              <h1 className="text-3xl font-bold text-slate-100">{currentUser.email}</h1>
              <p className="text-md text-slate-400 mt-1">User ID: {currentUser._id}</p>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-8 flex justify-center">
              <button onClick={handleLogout} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors duration-200">
                Logout
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default ProfilePage;
