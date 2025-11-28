const STORAGE_KEY_PREFIX = 'odometer:';

const getStorageKey = (vehicleId) => `${STORAGE_KEY_PREFIX}${vehicleId}`;

export const getOdometer = (vehicleId) => {
  if (!vehicleId) {
    return null;
  }
  try {
    const raw = localStorage.getItem(getStorageKey(vehicleId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    console.error('Failed to parse odometer data:', error);
    return null;
  }
};

export const saveOdometer = (vehicleId, odometerData) => {
  if (!vehicleId) {
    return;
  }
  localStorage.setItem(getStorageKey(vehicleId), JSON.stringify(odometerData));
};

export const updateOdometer = (vehicleId, reading, date) => {
  if (!vehicleId) {
    return null;
  }
  const odometerData = {
    reading: Number(reading),
    date: date || new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString(),
  };
  saveOdometer(vehicleId, odometerData);
  return odometerData;
};

