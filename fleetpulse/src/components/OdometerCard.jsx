import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOdometer, updateOdometer } from '../utils/odometer';

const OdometerCard = ({ vehicleId }) => {
  const [odometerData, setOdometerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    reading: '',
    date: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const { id: routeVehicleId } = useParams();
  const effectiveVehicleId = vehicleId || routeVehicleId;

  useEffect(() => {
    if (effectiveVehicleId) {
      const data = getOdometer(effectiveVehicleId);
      setOdometerData(data);
      if (data) {
        setFormValues({
          reading: data.reading.toString(),
          date: data.date || '',
        });
      } else {
        setFormValues({
          reading: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [effectiveVehicleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formValues.reading || !formValues.date) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    const reading = Number(formValues.reading);
    if (isNaN(reading) || reading < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid odometer reading.' });
      return;
    }

    if (odometerData && reading < odometerData.reading) {
      const confirmed = window.confirm(
        `The new reading (${reading} km) is less than the previous reading (${odometerData.reading} km). Are you sure you want to update?`
      );
      if (!confirmed) {
        return;
      }
    }

    const updated = updateOdometer(effectiveVehicleId, reading, formValues.date);
    setOdometerData(updated);
    setIsEditing(false);
    setMessage({ type: 'success', text: 'Odometer reading updated successfully!' });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  const handleCancel = () => {
    if (odometerData) {
      setFormValues({
        reading: odometerData.reading.toString(),
        date: odometerData.date || '',
      });
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Odometer Reading</h2>
      
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-900/50 text-green-300 border border-green-700'
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {!isEditing ? (
        <div>
          {odometerData ? (
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Current Reading</p>
                    <p className="text-3xl font-bold text-slate-100">{odometerData.reading.toLocaleString()} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm mb-1">Last Updated</p>
                    <p className="text-slate-300 font-medium">{formatDate(odometerData.date)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
              >
                Update Odometer Reading
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400">No odometer reading recorded yet.</p>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
              >
                Add Odometer Reading
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Odometer Reading (km)</span>
              <input
                type="number"
                name="reading"
                value={formValues.reading}
                onChange={handleChange}
                min="0"
                step="1"
                required
                placeholder="Enter odometer reading"
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
              <span className="text-sm text-slate-400 mb-1">Date</span>
              <input
                type="date"
                name="date"
                value={formValues.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
          </div>
          {odometerData && (
            <p className="text-sm text-slate-400">
              Previous reading: {odometerData.reading.toLocaleString()} km ({formatDate(odometerData.date)})
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OdometerCard;

