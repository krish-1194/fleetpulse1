import React from 'react';

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white overflow-hidden">
      <div className="text-center flex flex-col items-center">
        <img src="/logo192.png" alt="FleetPulse Logo" className="w-24 h-24 mb-4 animate-fadeInUp rounded-full" />
        <h1 className="text-5xl md:text-6xl font-bold text-sky-400 tracking-wider animate-fadeInUp [animation-delay:200ms]">
          FleetPulse
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mt-4 animate-fadeIn [animation-delay:700ms]">
          Your Fleet, At Your Fingertips
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
