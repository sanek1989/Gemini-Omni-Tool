const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Import the server module to run it within the Electron process
// We use a try-catch block to handle potential server startup issues
let serverInstance;
try {
  // Check if we are in production resources or local
  const serverPath = path.join(__dirname, 'server.js');
  console.log('Starting local server from:', serverPath);
  serverInstance = require(serverPath);
} catch (e) {
  console.error('Failed to start internal server:', e);
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "Gemini Omni-Tool",
    backgroundColor: '#020617', // Matches slate-950
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true,
      webSecurity: false // Allow loading local resources if needed, though we use localhost
    }
  });

  // The server.js starts on port 3000 (or env PORT). 
  // We load the localhost URL.
  // We add a small delay to ensure Express is listening.
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 1000);

  // Open links in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Auto Update Events
  autoUpdater.checkForUpdatesAndNotify();
}

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Auto Updater Event Listeners
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available. It will be downloaded in the background.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Update Ready',
    message: 'Update downloaded. Restart now to install?',
    buttons: ['Yes', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});