import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ currentUser }) => {
  const getAvatarSrc = () => {
    if (currentUser && currentUser.avatar) {
      return currentUser.avatar;
    } else if (currentUser && currentUser.email) {
      const initials = currentUser.email.substring(0, 2).toUpperCase();
      return `https://placehold.co/48x48/94a3b8/1e293b?text=${initials}`;
    }
    return "https://placehold.co/48x48/94a3b8/1e293b?text=JD"; // Default placeholder
  };

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-3 px-4 text-white">
        {/* Top Section: Logo and Profile */}
        <div className="flex justify-between items-center w-full sm:w-auto sm:mb-0">
          {/* Left Side: Logo and App Name */}
          <div className="bg-gray-700 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-4">
              <img src="/logo192.png" alt="FleetPulse Logo" className="w-10 h-10 rounded-full" />
              <span className="text-2xl font-bold tracking-wide font-sans">FleetPulse</span>
            </Link>
          </div>

          {/* Right Side: Profile Avatar (Mobile) */}
          <Link to="/profile" className="sm:hidden">
            <img
              src={getAvatarSrc()}
              alt="User Profile"
              className="w-12 h-12 rounded-full border-2 border-transparent hover:border-sky-500 transition-colors"
            />
          </Link>
        </div>

        {/* Desktop Profile Avatar */}
        <Link to="/profile" className="hidden sm:block">
          <img
            src={getAvatarSrc()}
            alt="User Profile"
            className="w-12 h-12 rounded-full border-2 border-transparent hover:border-sky-500 transition-colors"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
