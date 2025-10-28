import React from 'react';

const MaintenanceLogCard = ({ vehicleId }) => {
  // In a real application, you would fetch maintenance log data for the given vehicleId
  // For now, let's display some placeholder content.
  const maintenanceLogs = [
    { id: 1, date: '2025-09-15', type: 'Oil Change', cost: 75, odometer: 123000 },
    { id: 2, date: '2025-03-01', type: 'Tire Rotation', cost: 40, odometer: 118000 },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Maintenance Log</h2>
      {maintenanceLogs.length > 0 ? (
        <ul className="space-y-3">
          {maintenanceLogs.map((log) => (
            <li key={log.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="text-slate-300">Date: {log.date}</p>
                <p className="text-slate-400 text-sm">Type: {log.type}, Cost: ${log.cost}, Odometer: {log.odometer} km</p>
              </div>
              {/* Add edit/delete buttons here in a real app */}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">No maintenance logs available for this vehicle.</p>
      )}
      <button className="mt-4 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200">Add Maintenance Entry</button>
    </div>
  );
};

export default MaintenanceLogCard;
