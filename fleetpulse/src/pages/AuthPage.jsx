import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAccessToken, fetchWithAuth } from '../utils/api';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // New state for username
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'signup'
  const navigate = useNavigate();

  const handleAuth = async (e, endpoint) => {
    e.preventDefault();
    setError('');

    try {
        const payload = endpoint === 'register' ? { username, email, password } : { email, password };
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // Important: Ensures cookies (refresh token) are sent/received
      });

      const data = await response.json();

      if (response.ok) {
        setAccessToken(data.accessToken); // Store the new accessToken
        navigate('/'); // Redirect to home page on success
      } else {
        setError(data.message || `An error occurred during ${endpoint}.`);
      }
    } catch (err) {
      console.error(`Network error during ${endpoint}:`, err);
      setError('Could not connect to the server. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {currentView === 'login' ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center">
          <img src="/logo192.png" alt="FleetPulse Logo" className="w-20 h-20 mb-4" />
          <h2 className="text-3xl font-bold text-center text-white mb-6">Login to FleetPulse</h2>
          <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-6 w-full">
            <div>
              <label htmlFor="email-login" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email-login"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password-login"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-md shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-all duration-200"
            >
              Login
            </button>
            <p className="text-center text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('signup');
                  setError('');
                  setEmail('');
                  setPassword('');
                  setUsername(''); // Clear username on view switch
                }}
                // Use button styles that look like a link
                className="font-medium text-sky-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center">
          <img src="/logo192.png" alt="FleetPulse Logo" className="w-20 h-20 mb-4" />
          <h2 className="text-3xl font-bold text-center text-white mb-6">Create Your FleetPulse Account</h2>
          <form onSubmit={(e) => handleAuth(e, 'register')} className="space-y-6 w-full">
            <div>
              <label htmlFor="username-signup" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username-signup"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email-signup" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email-signup"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password-signup" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password-signup"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-200"
            >
              Sign Up
            </button>
            <p className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('login');
                  setError('');
                  setEmail('');
                  setPassword('');
                  setUsername('');
                }}
                // Use button styles that look like a link
                className="font-medium text-sky-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
