import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFuelLogs } from '../utils/fuelLogs';
import { formatINR } from '../utils/currency';

const FuelLogCard = ({ vehicleId }) => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const { id: routeVehicleId } = useParams();
  const effectiveVehicleId = vehicleId || routeVehicleId;

  useEffect(() => {
    if (!effectiveVehicleId) {
      setFuelLogs([]);
      return;
    }
    const logs = getFuelLogs(effectiveVehicleId);
    setFuelLogs(logs.slice(0, 2));
  }, [effectiveVehicleId]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Fuel Log</h2>
      {fuelLogs.length > 0 ? (
        <ul className="space-y-3">
          {fuelLogs.map((log) => (
            <li key={log.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="text-slate-300">Date: {log.date}</p>
                <p className="text-slate-400 text-sm">
                  Liters: {log.liters}L, Price: {formatINR(log.price)}, Odometer: {log.odometer} km
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">No fuel logs available for this vehicle.</p>
      )}
      {effectiveVehicleId ? (
        <Link
          to={`/vehicle/${effectiveVehicleId}/fuel-logs`}
          className="inline-flex justify-center mt-4 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
        >
          Add Fuel Entry
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md opacity-50 cursor-not-allowed"
        >
          Add Fuel Entry
        </button>
      )}
    </div>
  );
};

export default FuelLogCard;
