const STORAGE_KEY_PREFIX = 'reminders:';

const getStorageKey = (vehicleId) => `${STORAGE_KEY_PREFIX}${vehicleId}`;

export const getReminders = (vehicleId) => {
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
    console.error('Failed to parse reminders data:', error);
    return [];
  }
};

export const saveReminders = (vehicleId, reminders) => {
  if (!vehicleId) {
    return;
  }
  localStorage.setItem(getStorageKey(vehicleId), JSON.stringify(reminders));
};

export const addReminder = (vehicleId, reminder) => {
  if (!vehicleId) {
    return null;
  }
  const current = getReminders(vehicleId);
  const newReminder = {
    id: Date.now(),
    ...reminder,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  const updated = [newReminder, ...current];
  saveReminders(vehicleId, updated);
  return newReminder;
};

export const deleteReminder = (vehicleId, reminderId) => {
  if (!vehicleId) {
    return [];
  }
  const current = getReminders(vehicleId);
  const updated = current.filter((r) => r.id !== reminderId);
  saveReminders(vehicleId, updated);
  return updated;
};

export const updateReminderStatus = (vehicleId, reminderId, isActive) => {
  if (!vehicleId) {
    return [];
  }
  const current = getReminders(vehicleId);
  const updated = current.map((r) =>
    r.id === reminderId ? { ...r, isActive } : r
  );
  saveReminders(vehicleId, updated);
  return updated;
};

// Check if a reminder should be triggered
export const checkReminder = (reminder, currentOdometer) => {
  if (!reminder.isActive) {
    return { shouldAlert: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (reminder.type === 'date') {
    const reminderDate = new Date(reminder.reminderDate);
    reminderDate.setHours(0, 0, 0, 0);
    
    if (today >= reminderDate) {
      return {
        shouldAlert: true,
        message: `Reminder: ${reminder.description || reminder.logType || 'Action'} is due!`,
        daysOverdue: Math.floor((today - reminderDate) / (1000 * 60 * 60 * 24)),
      };
    } else {
      const daysUntil = Math.floor((reminderDate - today) / (1000 * 60 * 60 * 24));
      return {
        shouldAlert: false,
        daysUntil,
      };
    }
  } else if (reminder.type === 'odometer') {
    if (currentOdometer && currentOdometer.reading >= reminder.reminderOdometer) {
      const kmOverdue = currentOdometer.reading - reminder.reminderOdometer;
      return {
        shouldAlert: true,
        message: `Reminder: ${reminder.description || reminder.logType || 'Action'} is due!`,
        kmOverdue,
      };
    } else if (currentOdometer) {
      const kmRemaining = reminder.reminderOdometer - currentOdometer.reading;
      return {
        shouldAlert: false,
        kmRemaining,
      };
    }
  }

  return { shouldAlert: false };
};

// Get all active reminders that should alert
export const getActiveReminders = (vehicleId, currentOdometer) => {
  const reminders = getReminders(vehicleId);
  const active = reminders
    .map((reminder) => ({
      reminder,
      check: checkReminder(reminder, currentOdometer),
    }))
    .filter(({ check }) => check.shouldAlert);

  return active.map(({ reminder, check }) => ({
    ...reminder,
    alert: check,
  }));
};

