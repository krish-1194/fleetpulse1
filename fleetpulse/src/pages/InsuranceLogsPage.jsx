import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInsuranceLogs, saveInsuranceLogs } from '../utils/insuranceLogs';
import { formatINR } from '../utils/currency';
import { fetchWithAuth, clearTokens } from '../utils/api';

const InsuranceLogsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [insuranceLogs, setInsuranceLogs] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    provider: '',
    policyNumber: '',
    startDate: '',
    endDate: '',
    cost: '',
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setVehicle(data);
        } else {
          if (response.status === 401) {
            await clearTokens();
            navigate('/login');
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        await clearTokens();
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      const existingLogs = getInsuranceLogs(id);
      setInsuranceLogs(existingLogs);
    }
  }, [id]);

  const goBackToVehicle = () => {
    navigate(`/vehicle/${id}`);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLog = (event) => {
    event.preventDefault();
    if (!id) {
      return;
    }

    const newLog = {
      id: Date.now(),
      provider: formValues.provider,
      policyNumber: formValues.policyNumber,
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      cost: Number(formValues.cost),
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...insuranceLogs].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    setInsuranceLogs(updatedLogs);
    saveInsuranceLogs(id, updatedLogs);

    setFormValues({
      provider: '',
      policyNumber: '',
      startDate: '',
      endDate: '',
      cost: '',
    });
  };

  const hasLogs = insuranceLogs.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <p className="text-sm text-slate-400 uppercase tracking-widest">Insurance Management</p>
          <h1 className="text-4xl font-bold mt-2">Insurance Logs</h1>
          <p className="text-slate-400 mt-2">
            Manage insurance entries for vehicle <span className="font-semibold text-slate-100">{vehicle?.name || 'Unknown Vehicle'}</span>.
          </p>
        </header>

        <section className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddLog}>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Provider</span>
              <input
                type="text"
                name="provider"
                value={formValues.provider}
                onChange={handleChange}
                placeholder="e.g., SafeDrive Insurance"
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Policy Number</span>
              <input
                type="text"
                name="policyNumber"
                value={formValues.policyNumber}
                onChange={handleChange}
                placeholder="e.g., POL123456"
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Start Date</span>
              <input
                type="date"
                name="startDate"
                value={formValues.startDate}
                onChange={handleChange}
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">End Date</span>
              <input
                type="date"
                name="endDate"
                value={formValues.endDate}
                onChange={handleChange}
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200 md:col-span-2">
              <span className="text-sm text-slate-400 mb-1">Cost (₹)</span>
              <input
                type="number"
                name="cost"
                value={formValues.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
              >
                Save Insurance Entry
              </button>
            </div>
          </form>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Log History</h2>
            {hasLogs ? (
              <ul className="space-y-3">
                {insuranceLogs.map((log) => (
                  <li key={log.id} className="bg-gray-900 border border-gray-700 rounded-md p-4 flex flex-col gap-1">
                    <p className="text-slate-300 font-medium">{log.provider}</p>
                    <p className="text-slate-400 text-sm">
                      Policy: {log.policyNumber} · Dates: {log.startDate} to {log.endDate} · Cost: {formatINR(log.cost)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No logs yet. Add your first entry above.</p>
            )}
          </div>

          <button
            onClick={goBackToVehicle}
            className="w-full px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200"
          >
            Back to Vehicle
          </button>
        </section>
      </div>
    </div>
  );
};

export default InsuranceLogsPage;

