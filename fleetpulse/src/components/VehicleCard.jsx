import React, { memo, useState } from 'react';
import PropTypes, { bool } from 'prop-types';
import { Link } from 'react-router-dom';

// --- SVG Icons ---
const HeartIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
));

const LocationIcon = memo(({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
));

const FavoriteButton = ({ isFavorite: initialIsFavorite, vehicleId, onToggle }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Prevent Link navigation when favoriting
    e.stopPropagation(); // Stop event propagation to avoid triggering parent Link

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    if (onToggle) {
      onToggle(vehicleId, newFavoriteStatus);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 z-10 ${isFavorite ? 'text-red-500 bg-red-500/10 fill-current' : 'text-slate-400 bg-slate-900/50 hover:bg-slate-700/70'}`}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <HeartIcon />
    </button>
  );
};

FavoriteButton.propTypes = {
  isFavorite: PropTypes.bool.isRequired,
  vehicleId: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const VehicleCard = memo(({ vehicle, onToggleFavorite }) => {
  const { 
    id,
    imageUrl,
    name = 'Vehicle Name', 
    year = 'Year', 
    location = 'Unknown Location', 
    isFavorited = false // Ensure isFavorited defaults to false
  } = vehicle || {};

  return (
    <Link to={`/vehicle/${id}`} className="block group">
      <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-sky-500/20 group-hover:-translate-y-1 relative">
        <FavoriteButton 
          isFavorite={isFavorited} 
          vehicleId={id} 
          onToggle={onToggleFavorite} 
        />
        <div className="relative h-[180px]">
          <img
            src={imageUrl || "https://placehold.co/600x400/1e293b/94a3b8?text=Image+Not+Found"}
            alt={`Vehicle: ${name}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/1e293b/94a3b8?text=Image+Not+Found"; }}
          />
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-slate-100 truncate tracking-wide">{name}</h2>
          <div className="mt-2 flex items-center justify-between text-slate-400 text-sm">
              <p className="font-medium bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-300">
                  {year}
              </p>
              <p className="flex items-center gap-1 font-light">
                  <LocationIcon className="w-4 h-4" />
                  <span>{location}</span>
              </p>
          </div>
        </div>
      </div>
    </Link>
  );
});

VehicleCard.propTypes = {
  vehicle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imageUrl: PropTypes.string,
    name: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    location: PropTypes.string,
  }).isRequired,
  isInitiallyFavorited: bool
};

export default VehicleCard;
