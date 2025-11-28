import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMaintenanceLogs } from '../utils/maintenanceLogs';
import { formatINR } from '../utils/currency';

const MaintenanceLogCard = ({ vehicleId }) => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const { id: routeVehicleId } = useParams();
  const effectiveVehicleId = vehicleId || routeVehicleId;

  useEffect(() => {
    if (!effectiveVehicleId) {
      setMaintenanceLogs([]);
      return;
    }
    const logs = getMaintenanceLogs(effectiveVehicleId);
    setMaintenanceLogs(logs.slice(0, 2));
  }, [effectiveVehicleId]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Maintenance Log</h2>
      {maintenanceLogs.length > 0 ? (
        <ul className="space-y-3">
          {maintenanceLogs.map((log) => (
            <li key={log.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="text-slate-300">Date: {log.date}</p>
                <p className="text-slate-400 text-sm">
                  Type: {log.type}, Cost: {formatINR(log.cost)}, Odometer: {log.odometer} km
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">No maintenance logs available for this vehicle.</p>
      )}
      {effectiveVehicleId ? (
        <div className="flex gap-3 mt-4">
          <Link
            to={`/vehicle/${effectiveVehicleId}/maintenance-logs`}
            className="inline-flex justify-center px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
          >
            Open
          </Link>
          <Link
            to={`/vehicle/${effectiveVehicleId}/log-summary`}
            className="inline-flex justify-center px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors duration-200"
          >
            Summary
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md opacity-50 cursor-not-allowed"
          >
            Open
          </button>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md opacity-50 cursor-not-allowed"
          >
            Summary
          </button>
        </div>
      )}
    </div>
  );
};

export default MaintenanceLogCard;
