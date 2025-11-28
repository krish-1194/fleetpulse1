const STORAGE_KEY_PREFIX = 'maintenanceLogs:';

const getStorageKey = (vehicleId) => `${STORAGE_KEY_PREFIX}${vehicleId}`;

export const getMaintenanceLogs = (vehicleId) => {
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
    console.error('Failed to parse maintenance log data:', error);
    return [];
  }
};

export const saveMaintenanceLogs = (vehicleId, logs) => {
  if (!vehicleId) {
    return;
  }
  localStorage.setItem(getStorageKey(vehicleId), JSON.stringify(logs));
};

export const addMaintenanceLog = (vehicleId, log) => {
  if (!vehicleId) {
    return [];
  }
  const current = getMaintenanceLogs(vehicleId);
  const next = [log, ...current].sort((a, b) => new Date(b.date) - new Date(a.date));
  saveMaintenanceLogs(vehicleId, next);
  return next;
};


