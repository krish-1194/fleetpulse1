import React from 'react';

const InsuranceLogCard = ({ vehicleId }) => {
  // In a real application, you would fetch insurance log data for the given vehicleId
  // For now, let's display some placeholder content.
  const insuranceLogs = [
    { id: 1, provider: 'SafeDrive Insurance', policyNumber: 'POL123456', startDate: '2025-01-01', endDate: '2025-12-31', cost: 700 },
    { id: 2, provider: 'AutoSecure', policyNumber: 'AS789012', startDate: '2024-01-01', endDate: '2024-12-31', cost: 650 },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Insurance Log</h2>
      {insuranceLogs.length > 0 ? (
        <ul className="space-y-3">
          {insuranceLogs.map((log) => (
            <li key={log.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="text-slate-300">Provider: {log.provider}</p>
                <p className="text-slate-400 text-sm">Policy: {log.policyNumber}, Dates: {log.startDate} to {log.endDate}, Cost: ${log.cost}</p>
              </div>
              {/* Add edit/delete buttons here in a real app */}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">No insurance logs available for this vehicle.</p>
      )}
      <button className="mt-4 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200">Add Insurance Entry</button>
    </div>
  );
};

export default InsuranceLogCard;
