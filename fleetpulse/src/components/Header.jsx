import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto flex justify-between items-center p-4 text-white">
        {/* Left Side: Logo and App Name */}
        <Link to="/" className="flex items-center space-x-4">
          <img src="/logo192.png" alt="FleetPulse Logo" className="w-10 h-10 rounded-full" />
          <span className="text-2xl font-bold tracking-wide font-sans">FleetPulse</span>
        </Link>

        {/* Right Side: Profile Avatar */}
        <Link to="/profile">
          <img
            src="https://placehold.co/40x40/94a3b8/1e293b?text=JD" // Placeholder, will be dynamic later
            alt="User Profile"
            className="w-10 h-10 rounded-full border-2 border-transparent hover:border-sky-500 transition-colors"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
