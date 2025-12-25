/**
 * Migration utility to restore data from HTTP localStorage to HTTPS localStorage
 * 
 * IMPORTANT: This migration must be run from the browser console while on the HTTPS site.
 * The data from HTTP localStorage cannot be automatically accessed from HTTPS context,
 * so you'll need to manually copy the data.
 * 
 * Instructions:
 * 1. Open your browser's Developer Tools (F12)
 * 2. Go to the Application/Storage tab
 * 3. In the left sidebar, find "Local Storage"
 * 4. Click on "http://localhost:5173"
 * 5. Copy all the keys that start with: fuelLogs:, maintenanceLogs:, insuranceLogs:, odometer:, reminders:
 * 6. Switch to "https://localhost:5173" in the Local Storage section
 * 7. Paste the copied data
 * 
 * OR use this automated script in the console:
 */

/**
 * Automated migration function
 * Run this in the browser console on https://localhost:5173
 * 
 * Note: This will only work if you can access both HTTP and HTTPS localStorage
 * from the same browser session. If not, use the manual method above.
 */
export const migrateLocalStorageData = () => {
  const prefixes = [
    'fuelLogs:',
    'maintenanceLogs:',
    'insuranceLogs:',
    'odometer:',
    'reminders:',
  ];

  let migratedCount = 0;
  let skippedCount = 0;

  // Try to access HTTP localStorage (this may not work due to browser security)
  try {
    // Get all keys from current localStorage
    const allKeys = Object.keys(localStorage);
    
    // Check if we already have data (migration already done)
    const hasExistingData = allKeys.some(key => 
      prefixes.some(prefix => key.startsWith(prefix))
    );

    if (hasExistingData) {
      console.log('✅ Migration check: Data already exists in HTTPS localStorage.');
      console.log('If you need to restore from HTTP, use the manual method in the instructions.');
      return { migrated: 0, skipped: 0, message: 'Data already exists' };
    }

    // Since we can't directly access HTTP localStorage from HTTPS context,
    // we provide instructions
    console.log('⚠️  Automatic migration is not possible due to browser security restrictions.');
    console.log('📋 Please follow these manual steps:');
    console.log('');
    console.log('1. Open Developer Tools (F12)');
    console.log('2. Go to Application/Storage tab → Local Storage');
    console.log('3. Select "http://localhost:5173"');
    console.log('4. Copy all keys starting with:', prefixes.join(', '));
    console.log('5. Select "https://localhost:5173"');
    console.log('6. Paste the copied data');
    console.log('');
    console.log('OR use the helper function below in the console:');

    return {
      migrated: 0,
      skipped: 0,
      message: 'Manual migration required',
      instructions: 'See console for detailed steps'
    };
  } catch (error) {
    console.error('Migration error:', error);
    return { migrated: 0, skipped: 0, error: error.message };
  }
};

/**
 * Helper function to restore data from a JSON object
 * Use this if you've exported your HTTP localStorage data
 * 
 * @param {Object} data - Object with keys and values from HTTP localStorage
 */
export const restoreFromJSON = (data) => {
  if (!data || typeof data !== 'object') {
    console.error('Invalid data format. Expected an object with localStorage keys and values.');
    return { migrated: 0, error: 'Invalid data format' };
  }

  const prefixes = [
    'fuelLogs:',
    'maintenanceLogs:',
    'insuranceLogs:',
    'odometer:',
    'reminders:',
  ];

  let migratedCount = 0;
  let skippedCount = 0;

  Object.keys(data).forEach(key => {
    // Only migrate keys that match our prefixes
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      try {
        // If the value is already a string, use it directly
        // If it's an object, stringify it
        const value = typeof data[key] === 'string' 
          ? data[key] 
          : JSON.stringify(data[key]);
        
        localStorage.setItem(key, value);
        migratedCount++;
        console.log(`✅ Migrated: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${key}:`, error);
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  });

  console.log(`\n📊 Migration complete:`);
  console.log(`   ✅ Migrated: ${migratedCount} items`);
  console.log(`   ⏭️  Skipped: ${skippedCount} items`);

  return { migrated: migratedCount, skipped: skippedCount };
};

/**
 * Export current localStorage data to JSON
 * Useful for backing up data before migration
 */
export const exportLocalStorageData = () => {
  const prefixes = [
    'fuelLogs:',
    'maintenanceLogs:',
    'insuranceLogs:',
    'odometer:',
    'reminders:',
  ];

  const data = {};
  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      data[key] = localStorage.getItem(key);
    }
  });

  const jsonString = JSON.stringify(data, null, 2);
  console.log('📋 Copy the following JSON data:');
  console.log(jsonString);
  
  // Also create a downloadable file
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fleetpulse-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return data;
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  window.migrateLocalStorageData = migrateLocalStorageData;
  window.restoreFromJSON = restoreFromJSON;
  window.exportLocalStorageData = exportLocalStorageData;
}

