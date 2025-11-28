import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getMaintenanceLogs, saveMaintenanceLogs } from '../utils/maintenanceLogs';
import { formatINR } from '../utils/currency';
import { fetchWithAuth, clearTokens } from '../utils/api';
import { addReminder, getActiveReminders, deleteReminder } from '../utils/reminders';
import { getOdometer } from '../utils/odometer';

const MaintenanceLogsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    date: '',
    type: '',
    cost: '',
    odometer: '',
  });
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderType, setReminderType] = useState('date'); // 'date' or 'odometer'
  const [reminderDate, setReminderDate] = useState('');
  const [reminderOdometer, setReminderOdometer] = useState('');
  const [activeReminders, setActiveReminders] = useState([]);

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
      const existingLogs = getMaintenanceLogs(id);
      setMaintenanceLogs(existingLogs);
      
      // Load active reminders
      const currentOdometer = getOdometer(id);
      const active = getActiveReminders(id, currentOdometer);
      setActiveReminders(active);
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
      type: formValues.type,
      cost: Number(formValues.cost),
      odometer: Number(formValues.odometer),
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...maintenanceLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    setMaintenanceLogs(updatedLogs);
    saveMaintenanceLogs(id, updatedLogs);

    // Add reminder if enabled
    if (enableReminder) {
      if (reminderType === 'date' && reminderDate) {
        addReminder(id, {
          type: 'date',
          reminderDate: reminderDate,
          logType: formValues.type,
          logId: newLog.id,
          description: `Next ${formValues.type}`,
          category: 'maintenance',
        });
      } else if (reminderType === 'odometer' && reminderOdometer) {
        addReminder(id, {
          type: 'odometer',
          reminderOdometer: Number(reminderOdometer),
          logType: formValues.type,
          logId: newLog.id,
          description: `Next ${formValues.type}`,
          category: 'maintenance',
        });
      }
      
      // Refresh active reminders
      const currentOdometer = getOdometer(id);
      const active = getActiveReminders(id, currentOdometer);
      setActiveReminders(active);
    }

    // Reset form
    setFormValues({
      date: '',
      type: '',
      cost: '',
      odometer: '',
    });
    setEnableReminder(false);
    setReminderType('date');
    setReminderDate('');
    setReminderOdometer('');
  };

  const handleDismissReminder = (reminderId) => {
    deleteReminder(id, reminderId);
    const currentOdometer = getOdometer(id);
    const active = getActiveReminders(id, currentOdometer);
    setActiveReminders(active);
  };

  const hasLogs = maintenanceLogs.length > 0;

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
          <p className="text-sm text-slate-400 uppercase tracking-widest">Maintenance Management</p>
          <h1 className="text-4xl font-bold mt-2">Maintenance Logs</h1>
          <p className="text-slate-400 mt-2">
            Manage maintenance entries for vehicle <span className="font-semibold text-slate-100">{vehicle?.name || 'Unknown Vehicle'}</span>.
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
              <span className="text-sm text-slate-400 mb-1">Type</span>
              <input
                type="text"
                name="type"
                value={formValues.type}
                onChange={handleChange}
                placeholder="e.g., Oil Change, Tire Rotation"
                required
                className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-col text-slate-200">
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
            
            {/* Reminder Section */}
            <div className="md:col-span-2 border-t border-gray-700 pt-4 mt-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300 font-semibold">Reminder Settings</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                Get notified when it's time for the next maintenance. Choose date-based or odometer-based reminders.
              </p>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-900/50 rounded-md hover:bg-gray-900/70 transition-colors">
                <input
                  type="checkbox"
                  checked={enableReminder}
                  onChange={(e) => setEnableReminder(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-sky-600 focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-slate-200 font-semibold">Set Reminder for Next {formValues.type || 'Maintenance'}</span>
              </label>

              {enableReminder && (
                <div className="bg-gray-900/50 rounded-md p-4 space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reminderType"
                        value="date"
                        checked={reminderType === 'date'}
                        onChange={(e) => setReminderType(e.target.value)}
                        className="w-4 h-4 text-sky-600 focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="text-slate-300">Date Based</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reminderType"
                        value="odometer"
                        checked={reminderType === 'odometer'}
                        onChange={(e) => setReminderType(e.target.value)}
                        className="w-4 h-4 text-sky-600 focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="text-slate-300">Odometer Based</span>
                    </label>
                  </div>

                  {reminderType === 'date' && (
                    <label className="flex flex-col text-slate-200">
                      <span className="text-sm text-slate-400 mb-1">Reminder Date</span>
                      <input
                        type="date"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        min={formValues.date || new Date().toISOString().split('T')[0]}
                        className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </label>
                  )}

                  {reminderType === 'odometer' && (
                    <label className="flex flex-col text-slate-200">
                      <span className="text-sm text-slate-400 mb-1">Reminder at Odometer (km)</span>
                      <input
                        type="number"
                        value={reminderOdometer}
                        onChange={(e) => setReminderOdometer(e.target.value)}
                        min={formValues.odometer || 0}
                        placeholder="Enter odometer reading"
                        className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      {formValues.odometer && (
                        <p className="text-xs text-slate-500 mt-1">
                          Current entry: {formValues.odometer} km
                        </p>
                      )}
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
              >
                Save Maintenance Entry
              </button>
            </div>
          </form>

          {/* Active Reminders */}
          {activeReminders.length > 0 && (
            <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Active Reminders
              </h3>
              {activeReminders.map((reminder) => (
                <div key={reminder.id} className="bg-gray-900 rounded-md p-3 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-amber-200 font-medium">{reminder.description}</p>
                    <p className="text-sm text-amber-300/70 mt-1">
                      {reminder.type === 'date' && reminder.alert.daysOverdue !== undefined && (
                        <>
                          {reminder.alert.daysOverdue > 0
                            ? `${reminder.alert.daysOverdue} days overdue`
                            : 'Due today'}
                          {' · '}
                          Scheduled for: {new Date(reminder.reminderDate).toLocaleDateString()}
                        </>
                      )}
                      {reminder.type === 'odometer' && reminder.alert.kmOverdue !== undefined && (
                        <>
                          {reminder.alert.kmOverdue.toFixed(0)} km overdue · 
                          Due at: {reminder.reminderOdometer.toLocaleString()} km
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismissReminder(reminder.id)}
                    className="ml-4 text-amber-300 hover:text-amber-200 transition-colors"
                    title="Dismiss reminder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-4">Log History</h2>
            {hasLogs ? (
              <ul className="space-y-3">
                {maintenanceLogs.map((log) => (
                  <li key={log.id} className="bg-gray-900 border border-gray-700 rounded-md p-4 flex flex-col gap-1">
                    <p className="text-slate-300 font-medium">{log.date}</p>
                    <p className="text-slate-400 text-sm">
                      Type: {log.type} · Cost: {formatINR(log.cost)} · Odometer: {log.odometer} km
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

export default MaintenanceLogsPage;


