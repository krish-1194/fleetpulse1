import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { fetchWithAuth, clearTokens } from '../utils/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await clearTokens(); // Clear tokens (including backend cookie)
    navigate('/login');
  };

  const handleUpdateProfile = () => {
    navigate('/profile/edit');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        } else {
          console.error("Failed to fetch user data:", response.statusText); // Log actual error
          setError('Failed to fetch user profile.');
          if (response.status === 401) {
            navigate('/login'); // Redirect to login if unauthorized even after refresh attempt
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err); // Log actual error
        setError('Could not connect to the server or authentication failed.');
        await clearTokens(); // Clear tokens if an error occurs (e.g., refresh token expired/invalid)
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white text-center p-8">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header currentUser={currentUser} />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center relative">
        <Link
          to="/"
          className="absolute top-4 left-4 md:top-8 md:left-8 text-slate-400 hover:text-sky-400 transition-colors z-10"
          aria-label="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        {error ? (
          <p className="text-red-500 text-center text-lg">{error}</p>
        ) : currentUser ? (
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 relative">
            {/* Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full border-4 border-sky-500 overflow-hidden shadow-lg mb-4">
                <img 
                  src={`https://placehold.co/160x160/94a3b8/1e293b?text=${currentUser.username ? currentUser.username.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}`}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold text-slate-100 mt-2">{currentUser.username || currentUser.email}</h1>
            </div>

            {/* User Details Section */}
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-semibold text-slate-100 mb-4 md:mt-0">User Information</h2>
              <p className="text-lg text-slate-300 mt-2 flex items-center gap-2 justify-center md:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sky-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h16.5m-16.5 0a2.25 2.25 0 000 4.5h16.5m-16.5-4.5a2.25 2.25 0 010-4.5h16.5m-16.5 4.5v-4.5m16.5 4.5v-4.5m-16.5 0a2.25 2.25 0 00-2.25 2.25v2.25A2.25 2.25 0 001.5 13.5m18 0a2.25 2.25 0 002.25 2.25v2.25A2.25 2.25 0 0022.5 13.5m-18 0v-2.25m18 2.25v-2.25m-10.5-6l4.5-4.5m0 0l-4.5-4.5M18 10.5H3.75" />
                </svg>
                {currentUser.email}
              </p>
              {currentUser.phoneNumber && (
                <p className="text-lg text-slate-300 mt-2 flex items-center gap-2 justify-center md:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sky-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.106l-1.412-.353a1.125 1.125 0 01-.823-.39L16.5 13.5m-11.25-4.5L11 6.75m0 0l-4.5-4.5M11 6.75V1.5m6 2.25V1.5m-3 2.25V1.5" />
                  </svg>
                  {currentUser.phoneNumber}
                </p>
              )}
            </div>

            {/* Buttons Section */}
            <div className="mt-8 md:mt-0 md:self-end flex flex-col space-y-4 md:space-y-0 md:space-x-4 md:flex-row">
              <button
                onClick={handleUpdateProfile}
                className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-colors duration-200 w-full md:w-auto"
              >
                Update Profile
              </button>
              <button onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors duration-200 w-full md:w-auto"
              >
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
