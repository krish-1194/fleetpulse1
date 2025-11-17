import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInsuranceLogs } from '../utils/insuranceLogs';
import { formatINR } from '../utils/currency';

const InsuranceLogCard = ({ vehicleId }) => {
  const [insuranceLogs, setInsuranceLogs] = useState([]);
  const { id: routeVehicleId } = useParams();
  const effectiveVehicleId = vehicleId || routeVehicleId;

  useEffect(() => {
    if (!effectiveVehicleId) {
      setInsuranceLogs([]);
      return;
    }
    const logs = getInsuranceLogs(effectiveVehicleId);
    setInsuranceLogs(logs.slice(0, 2));
  }, [effectiveVehicleId]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Insurance Log</h2>
      {insuranceLogs.length > 0 ? (
        <ul className="space-y-3">
          {insuranceLogs.map((log) => (
            <li key={log.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="text-slate-300">Provider: {log.provider}</p>
                <p className="text-slate-400 text-sm">
                  Policy: {log.policyNumber}, Dates: {log.startDate} to {log.endDate}, Cost: {formatINR(log.cost)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">No insurance logs available for this vehicle.</p>
      )}
      {effectiveVehicleId ? (
        <Link
          to={`/vehicle/${effectiveVehicleId}/insurance-logs`}
          className="inline-flex justify-center mt-4 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
        >
          Add Insurance Entry
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md opacity-50 cursor-not-allowed"
        >
          Add Insurance Entry
        </button>
      )}
    </div>
  );
};

export default InsuranceLogCard;
