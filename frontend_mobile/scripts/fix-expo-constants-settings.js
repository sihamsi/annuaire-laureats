const fs = require('fs');
const path = require('path');

// Path to the .settings folder that needs to be created
const settingsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-constants',
  'android',
  '.settings'
);

// Create the .settings directory if it doesn't exist
if (!fs.existsSync(settingsPath)) {
  fs.mkdirSync(settingsPath, { recursive: true });
  console.log('Created .settings folder for expo-constants/android');
}

// Create minimal Eclipse configuration files
const prefsPath = path.join(settingsPath, 'org.eclipse.core.resources.prefs');
if (!fs.existsSync(prefsPath)) {
  fs.writeFileSync(prefsPath, 'eclipse.preferences.version=1\nencoding/<project>=UTF-8\n');
  console.log('Created org.eclipse.core.resources.prefs file');
}

const buildshipPrefsPath = path.join(settingsPath, 'org.eclipse.buildship.core.prefs');
if (!fs.existsSync(buildshipPrefsPath)) {
  fs.writeFileSync(buildshipPrefsPath, 'connection.project.dir=\neclipse.preferences.version=1\n');
  console.log('Created org.eclipse.buildship.core.prefs file');
}
