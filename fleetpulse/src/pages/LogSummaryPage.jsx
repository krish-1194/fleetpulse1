import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { getFuelLogs } from '../utils/fuelLogs';
import { getMaintenanceLogs } from '../utils/maintenanceLogs';
import { getInsuranceLogs } from '../utils/insuranceLogs';
import { formatINR } from '../utils/currency';
import { fetchWithAuth, clearTokens } from '../utils/api';

const LogSummaryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [insuranceLogs, setInsuranceLogs] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [filteredLogs, setFilteredLogs] = useState({
    fuel: [],
    maintenance: [],
    insurance: [],
  });
  const [mileageCalculations, setMileageCalculations] = useState(null);
  const [calculationError, setCalculationError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          console.error("Failed to fetch user data:", response.statusText);
          if (response.status === 401) {
            await clearTokens();
            navigate('/login');
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        await clearTokens();
        navigate('/login');
      }
    };

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

    fetchUserData();
    fetchVehicle();
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      const fuel = getFuelLogs(id);
      const maintenance = getMaintenanceLogs(id);
      const insurance = getInsuranceLogs(id);
      
      setFuelLogs(fuel);
      setMaintenanceLogs(maintenance);
      setInsuranceLogs(insurance);
    }
  }, [id]);

  useEffect(() => {
    // Filter logs based on date range
    const filterLogsByDate = (logs, dateField) => {
      if (!dateRange.startDate && !dateRange.endDate) {
        return logs;
      }

      return logs.filter((log) => {
        const logDateStr = log[dateField];
        if (!logDateStr) return false;
        
        const logDate = new Date(logDateStr);
        logDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        let start = null;
        let end = null;
        
        if (dateRange.startDate) {
          start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
        }
        
        if (dateRange.endDate) {
          end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999); // Include full end date
        }

        if (start && end) {
          return logDate >= start && logDate <= end;
        } else if (start) {
          return logDate >= start;
        } else if (end) {
          return logDate <= end;
        }
        return true;
      });
    };

    const filteredFuel = filterLogsByDate(fuelLogs, 'date').sort((a, b) => new Date(b.date) - new Date(a.date));
    const filteredMaintenance = filterLogsByDate(maintenanceLogs, 'date').sort((a, b) => new Date(b.date) - new Date(a.date));
    const filteredInsurance = filterLogsByDate(insuranceLogs, 'startDate').sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    setFilteredLogs({
      fuel: filteredFuel,
      maintenance: filteredMaintenance,
      insurance: filteredInsurance,
    });
  }, [fuelLogs, maintenanceLogs, insuranceLogs, dateRange]);

  // Auto-calculate mileage when filtered logs change
  useEffect(() => {
    if (filteredLogs.fuel.length > 0) {
      const fuel = filteredLogs.fuel;
      const totalFuelCost = fuel.reduce((sum, log) => sum + (Number(log.price) || 0), 0);
      const totalFuelLiters = fuel.reduce((sum, log) => sum + (Number(log.liters) || 0), 0);
      const averageFuelPrice = totalFuelLiters > 0 ? totalFuelCost / totalFuelLiters : 0;
      
      if (averageFuelPrice > 0) {
        calculateMileage(averageFuelPrice);
      }
    } else {
      setMileageCalculations(null);
      setCalculationError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLogs.fuel]);

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  // Calculate fuel mileage and related metrics
  const calculateMileage = (averageFuelPrice) => {
    try {
      setCalculationError('');
      const fuel = filteredLogs.fuel;
      
      if (fuel.length === 0) {
        setCalculationError('No fuel logs available. Please add fuel logs first.');
        setMileageCalculations(null);
        return;
      }

      // Calculate total fuel consumed
      const totalFuel = fuel.reduce((sum, log) => sum + (Number(log.liters) || 0), 0);
      
      if (totalFuel <= 0) {
        setCalculationError('Total fuel consumed is zero. Please check your fuel log entries.');
        setMileageCalculations(null);
        return;
      }
      
      // Calculate total kilometers run (difference between highest and lowest odometer)
      const odometerReadings = fuel.map(log => Number(log.odometer) || 0).filter(odo => odo > 0);
      
      if (odometerReadings.length < 2) {
        setCalculationError('Need at least 2 fuel log entries with odometer readings to calculate mileage.');
        setMileageCalculations(null);
        return;
      }
      
      const minOdometer = Math.min(...odometerReadings);
      const maxOdometer = Math.max(...odometerReadings);
      const totalKilometers = maxOdometer - minOdometer;
      
      if (totalKilometers <= 0) {
        setCalculationError('Invalid odometer readings. Please ensure odometer values are correct.');
        setMileageCalculations(null);
        return;
      }

      // Calculate fuel mileage (km per liter)
      const fuelMileage = totalKilometers / totalFuel;
      
      // Calculate total fuel cost from logs
      const totalFuelCost = fuel.reduce((sum, log) => sum + (Number(log.price) || 0), 0);
      
      // Calculate cost per kilometer
      const costPerKilometer = totalFuelCost / totalKilometers;
      
      // Calculate cost needed to travel those kilometers at average fuel price
      let costToTravel = null;
      if (averageFuelPrice && averageFuelPrice > 0) {
        const fuelNeeded = totalKilometers / fuelMileage;
        costToTravel = fuelNeeded * averageFuelPrice;
      }

      setMileageCalculations({
        totalFuel,
        totalKilometers,
        fuelMileage,
        costPerKilometer,
        totalFuelCost,
        costToTravel,
        minOdometer,
        maxOdometer,
        averageFuelPrice,
      });
    } catch (error) {
      console.error('Error calculating mileage:', error);
      setCalculationError('An error occurred while calculating. Please check your fuel log data.');
      setMileageCalculations(null);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const fuel = filteredLogs.fuel;
    const maintenance = filteredLogs.maintenance;
    const insurance = filteredLogs.insurance;

    const totalFuelCost = fuel.reduce((sum, log) => sum + (log.price || 0), 0);
    const totalFuelLiters = fuel.reduce((sum, log) => sum + (log.liters || 0), 0);
    const averageFuelPrice = fuel.length > 0 ? totalFuelCost / totalFuelLiters : 0;
    const totalMaintenanceCost = maintenance.reduce((sum, log) => sum + (log.cost || 0), 0);
    const totalInsuranceCost = insurance.reduce((sum, log) => sum + (log.cost || 0), 0);
    const totalCost = totalFuelCost + totalMaintenanceCost + totalInsuranceCost;

    return {
      totalFuelCost,
      totalFuelLiters,
      averageFuelPrice,
      totalMaintenanceCost,
      totalInsuranceCost,
      totalCost,
      fuelCount: fuel.length,
      maintenanceCount: maintenance.length,
      insuranceCount: insurance.length,
    };
  };

  const summary = calculateSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white text-center p-8">
        Loading log summary...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentUser={currentUser} />
      <main className="container mx-auto p-4 md:p-8">
        <Link
          to={`/vehicle/${id}`}
          className="inline-flex items-center text-slate-400 hover:text-sky-400 transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Vehicle
        </Link>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h1 className="text-4xl font-bold text-slate-100 mb-2">Log Summary</h1>
            <p className="text-lg text-slate-400">
              {vehicle?.name || 'Vehicle'} - Comprehensive log overview
            </p>
          </div>

          {/* Date Range Filter */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Filter by Date Range</h2>
            <div className="grid gap-4 md:grid-cols-3 items-end">
              <label className="flex flex-col text-slate-200">
                <span className="text-sm text-slate-400 mb-1">Start Date</span>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="flex flex-col text-slate-200">
                <span className="text-sm text-slate-400 mb-1">End Date</span>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <button
                onClick={clearDateFilter}
                className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Total Fuel Cost</h3>
              <p className="text-3xl font-bold text-sky-400">{formatINR(summary.totalFuelCost)}</p>
              <p className="text-sm text-slate-500 mt-2">{summary.fuelCount} entries</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Total Maintenance Cost</h3>
              <p className="text-3xl font-bold text-green-400">{formatINR(summary.totalMaintenanceCost)}</p>
              <p className="text-sm text-slate-500 mt-2">{summary.maintenanceCount} entries</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Total Insurance Cost</h3>
              <p className="text-3xl font-bold text-purple-400">{formatINR(summary.totalInsuranceCost)}</p>
              <p className="text-sm text-slate-500 mt-2">{summary.insuranceCount} entries</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Total Fuel (Liters)</h3>
              <p className="text-3xl font-bold text-yellow-400">{summary.totalFuelLiters.toFixed(2)} L</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Average Fuel Price</h3>
              <p className="text-3xl font-bold text-orange-400">
                {summary.averageFuelPrice > 0 ? formatINR(summary.averageFuelPrice) : formatINR(0)}/L
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Grand Total Cost</h3>
              <p className="text-3xl font-bold text-red-400">{formatINR(summary.totalCost)}</p>
            </div>
          </div>

          {/* Fuel Mileage Calculator */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Fuel Mileage Calculator
            </h2>
            
            {filteredLogs.fuel.length === 0 ? (
              <p className="text-slate-400">No fuel logs available for calculation. Please add fuel logs first.</p>
            ) : (
              <div className="space-y-6">
                {calculationError && (
                  <div className="p-4 bg-red-900/50 border border-red-700 rounded-md">
                    <p className="text-red-300 text-sm">{calculationError}</p>
                  </div>
                )}
                
                {!calculationError && filteredLogs.fuel.length > 0 && !mileageCalculations && (
                  <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-md">
                    <p className="text-blue-300 text-sm">
                      Calculating mileage from {filteredLogs.fuel.length} fuel log{filteredLogs.fuel.length !== 1 ? 's' : ''}...
                    </p>
                  </div>
                )}

                {/* Results Section */}
                {mileageCalculations && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">Fuel Mileage</h3>
                      <p className="text-2xl font-bold text-green-400">
                        {mileageCalculations.fuelMileage.toFixed(2)} km/L
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {mileageCalculations.totalKilometers.toFixed(0)} km ÷ {mileageCalculations.totalFuel.toFixed(2)} L
                      </p>
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">Cost per Kilometer</h3>
                      <p className="text-2xl font-bold text-yellow-400">
                        {formatINR(mileageCalculations.costPerKilometer)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Based on historical data
                      </p>
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">Total Fuel Consumed</h3>
                      <p className="text-2xl font-bold text-blue-400">
                        {mileageCalculations.totalFuel.toFixed(2)} L
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        From {filteredLogs.fuel.length} fuel entries
                      </p>
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">Total Kilometers</h3>
                      <p className="text-2xl font-bold text-purple-400">
                        {mileageCalculations.totalKilometers.toFixed(0)} km
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Odometer: {mileageCalculations.minOdometer.toLocaleString()} - {mileageCalculations.maxOdometer.toLocaleString()} km
                      </p>
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">Total Fuel Cost</h3>
                      <p className="text-2xl font-bold text-orange-400">
                        {formatINR(mileageCalculations.totalFuelCost)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Historical total
                      </p>
                    </div>

                    {mileageCalculations.costToTravel !== null && (
                      <div className="bg-gray-900 border-2 border-sky-500 rounded-md p-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Cost to Travel Same Distance</h3>
                        <p className="text-2xl font-bold text-sky-400">
                          {formatINR(mileageCalculations.costToTravel)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          At average price: {formatINR(mileageCalculations.averageFuelPrice)}/L
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogSummaryPage;

