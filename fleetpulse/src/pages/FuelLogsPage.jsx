import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getFuelLogs, saveFuelLogs } from '../utils/fuelLogs';
import { formatINR } from '../utils/currency';
import { fetchWithAuth, clearTokens } from '../utils/api';

const FuelLogsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    date: '',
    liters: '',
    price: '',
    odometer: '',
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
      const existingLogs = getFuelLogs(id);
      setFuelLogs(existingLogs);
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
      date: formValues.date,
      liters: Number(formValues.liters),
      price: Number(formValues.price),
      odometer: Number(formValues.odometer),
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...fuelLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    setFuelLogs(updatedLogs);
    saveFuelLogs(id, updatedLogs);

    setFormValues({
      date: '',
      liters: '',
      price: '',
      odometer: '',
    });
  };

  const hasLogs = fuelLogs.length > 0;

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
        <Link
          to={`/vehicle/${id}`}
          className="inline-flex items-center text-slate-400 hover:text-sky-400 transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Vehicle Details
        </Link>
        <header className="mb-8">
          <p className="text-sm text-slate-400 uppercase tracking-widest">Fuel Management</p>
          <h1 className="text-4xl font-bold mt-2">Fuel Logs</h1>
          <p className="text-slate-400 mt-2">
            Manage fuel entries for vehicle <span className="font-semibold text-slate-100">{vehicle?.name || 'Unknown Vehicle'}</span>.
          </p>
        </header>

        <section className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddLog}>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Date</span>
              <input
                type="date"
                name="date"
                value={formValues.date}
                onChange={handleChange}
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Liters</span>
              <input
                type="number"
                name="liters"
                value={formValues.liters}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Price (₹)</span>
              <input
                type="number"
                name="price"
                value={formValues.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Odometer (km)</span>
              <input
                type="number"
                name="odometer"
                value={formValues.odometer}
                onChange={handleChange}
                min="0"
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
              >
                Save Fuel Entry
              </button>
            </div>
          </form>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Log History</h2>
            {hasLogs ? (
              <ul className="space-y-3">
                {fuelLogs.map((log) => (
                  <li key={log.id} className="bg-gray-900 border border-gray-700 rounded-md p-4 flex flex-col gap-1">
                    <p className="text-slate-300 font-medium">{log.date}</p>
                    <p className="text-slate-400 text-sm">
                      {log.liters}L · {formatINR(log.price)} · {log.odometer} km
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

export default FuelLogsPage;


