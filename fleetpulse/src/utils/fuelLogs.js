const STORAGE_KEY_PREFIX = 'fuelLogs:';

const getStorageKey = (vehicleId) => `${STORAGE_KEY_PREFIX}${vehicleId}`;

export const getFuelLogs = (vehicleId) => {
  if (!vehicleId) {
    return [];
  }
  try {
    const raw = localStorage.getItem(getStorageKey(vehicleId));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse fuel log data:', error);
    return [];
  }
};

export const saveFuelLogs = (vehicleId, logs) => {
  if (!vehicleId) {
    return;
  }
  localStorage.setItem(getStorageKey(vehicleId), JSON.stringify(logs));
};

export const addFuelLog = (vehicleId, log) => {
  if (!vehicleId) {
    return [];
  }
  const current = getFuelLogs(vehicleId);
  const next = [log, ...current].sort((a, b) => new Date(b.date) - new Date(a.date));
  saveFuelLogs(vehicleId, next);
  return next;
};


