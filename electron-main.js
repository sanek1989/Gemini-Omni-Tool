const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Start the internal server
// In production, this server serves the built React files from 'dist'
// In development, it provides the API proxy, while Vite serves the frontend
let serverInstance;
try {
  const serverPath = path.join(__dirname, 'server.js');
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
    backgroundColor: '#020617',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Security: In a real app, configure CSP. 
      // For this local tool, we allow local resources.
      webSecurity: false 
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    // In development, load from Vite dev server
    // The 'wait-on' script in package.json ensures this port is ready before Electron launches
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the local Express server (which serves 'dist')
    // We use a small timeout to ensure Express has bound to the port
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000');
    }, 500);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Only check for updates if packaged
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

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