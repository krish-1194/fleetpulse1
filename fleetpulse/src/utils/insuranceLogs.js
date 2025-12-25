const STORAGE_KEY_PREFIX = 'insuranceLogs:';

const getStorageKey = (vehicleId) => `${STORAGE_KEY_PREFIX}${vehicleId}`;

export const getInsuranceLogs = (vehicleId) => {
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
    console.error('Failed to parse insurance log data:', error);
    return [];
  }
};

export const saveInsuranceLogs = (vehicleId, logs) => {
  if (!vehicleId) {
    return;
  }
  localStorage.setItem(getStorageKey(vehicleId), JSON.stringify(logs));
};

export const addInsuranceLog = (vehicleId, log) => {
  if (!vehicleId) {
    return [];
  }
  const current = getInsuranceLogs(vehicleId);
  const next = [log, ...current].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  saveInsuranceLogs(vehicleId, next);
  return next;
};





