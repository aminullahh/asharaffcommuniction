const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "logo.png"), // Uses your Amtech logo for the taskbar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // 🌟 CRITICAL FIX: Forces Electron to save IndexedDB to a permanent local directory instead of a temporary session
      partition: "persist:amtech-phone-manager",
    },
  });

  // Hides the default "File, Edit, View" Windows menu for a cleaner look
  mainWindow.setMenuBarVisibility(false);

  // If in development, load the local React server. If built, load the final files.
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`,
  );

  // Open the DevTools automatically so we can see any hidden errors!
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
