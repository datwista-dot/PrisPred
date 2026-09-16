const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron'); // Added dialog here
const path = require('path');
const fs = require('fs');
const os = require('os'); // Added os for desktop path logic

let splash;
let mainWindow;

// =========================
// IN-MEMORY STATE
// =========================
let dinoData = [];
let playerData = [];
let notesData = [];
let breedingData = [];
let parserData = {};

// =========================
// PATHS & DOCUMENTS SETUP
// =========================
const splashPath = path.join(__dirname, '../renderer/windows/splash.html');
const mainPath = path.join(__dirname, '../renderer/windows/index.html');

// Create the folder in Documents if it doesn't exist
const appDocDir = path.join(app.getPath('documents'), 'PrisPredAppData');
if (!fs.existsSync(appDocDir)) {
    fs.mkdirSync(appDocDir, { recursive: true });
}

const dinoFilePath = path.join(appDocDir, 'dinoData.js');
const playerFilePath = path.join(appDocDir, 'playerdata.js');
const notesFilePath = path.join(appDocDir, 'notesdata.js'); 
const breedingFilePath = path.join(appDocDir, 'breedingdata.js');
const parserFilePath = path.join(appDocDir, 'parsar.json');

// =========================
// WINDOW CONTROLS
// =========================
ipcMain.on("window-close", () => mainWindow?.close());
ipcMain.on("window-minimize", () => mainWindow?.minimize());

ipcMain.on("set-always-on-top", (event, enabled) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(false); 
    if (enabled) {
      mainWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
    }
  }
});

// =========================
// DATA HANDLERS (IPC)
// =========================

// --- NEW: AD IMAGE SAVER ---
ipcMain.handle('save-ad-image', async (event, base64Data) => {
    // 1. Prepare the image data (Strip the header)
    const base64Image = base64Data.split(';base64,').pop();

    // 2. Open the "Save As" Dialog
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Ad Image',
        defaultPath: path.join(os.homedir(), 'Desktop', 'DinoAd.png'),
        filters: [{ name: 'Images', extensions: ['png'] }]
    });

    // 3. Write the file to the chosen path
    if (filePath) {
        try {
            fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
            return true;
        } catch (err) {
            console.error("Failed to save image:", err);
            return false;
        }
    }
    return false;
});

// Dinos
ipcMain.handle("get-dinos", () => dinoData);
ipcMain.on("set-dinos", (event, data) => {
  if (!Array.isArray(data)) return;
  dinoData = data;
  const safe = (str) => String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  let content = "window.DINO_DATA = [\n";
  data.forEach((d, i) => {
    content += `  {
    name: "${safe(d.name)}",
    full: "${safe(d.full)}",
    price: ${Number(d.price)},
    freeInBooster: ${Boolean(d.freeInBooster)},
	male: ${Number(d.male) || 0},
    female: ${Number(d.female) || 0}
  }`;
    if (i < data.length - 1) content += ",";
    content += "\n";
  });
  content += "];";
  try {
    fs.writeFileSync(dinoFilePath, content, "utf8");
  } catch (err) { console.error("Failed to save dinoData:", err); }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send("dinos-updated", dinoData));
});

// Players
ipcMain.handle("get-players", () => playerData);
ipcMain.on("set-players", (event, data) => {
  if (!Array.isArray(data)) return;
  playerData = data;
  const content = "window.PLAYER_DATA = " + JSON.stringify(data, null, 2) + ";";
  try {
    fs.writeFileSync(playerFilePath, content, "utf8");
  } catch (err) { console.error("Failed to save playerData:", err); }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send("players-updated", playerData));
});

// Notes
ipcMain.handle("get-notes", () => notesData);
ipcMain.on("set-notes", (event, data) => {
  if (!Array.isArray(data)) return;
  notesData = data;
  const content = "window.NOTES_DATA = " + JSON.stringify(data, null, 2) + ";";
  try {
    fs.writeFileSync(notesFilePath, content, "utf8");
  } catch (err) { console.error("Failed to save notesData:", err); }
});

// Breeding
ipcMain.handle("get-breeding", () => breedingData);
ipcMain.on("set-breeding", (event, data) => {
  if (!Array.isArray(data)) return;
  breedingData = data;
  const content = "window.BREEDING_DATA = " + JSON.stringify(data, null, 2) + ";";
  try {
    fs.writeFileSync(breedingFilePath, content, "utf8");
    BrowserWindow.getAllWindows().forEach(win => win.webContents.send("breeding-updated", breedingData));
  } catch (err) { console.error("Failed to save breedingData:", err); }
});

// Parser Memory
ipcMain.handle("get-parser-data", () => parserData);
ipcMain.on("set-parser-data", (event, data) => {
  if (typeof data !== 'object') return;
  parserData = data;
  try {
    fs.writeFileSync(parserFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) { 
    console.error("Failed to save parserData:", err); 
  }
});

// =========================
// WINDOW CREATION
// =========================
function createWindows() {
  Menu.setApplicationMenu(null);

  splash = new BrowserWindow({
    width: 600, height: 400, frame: false, alwaysOnTop: true, resizable: false
  });
  splash.loadFile(splashPath);

  mainWindow = new BrowserWindow({
    width: 1200, height: 800, show: false, frame: false,
    icon: path.join(__dirname, "../assets/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(mainPath);

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash?.close();
      splash = null;
      mainWindow.show();
      mainWindow.maximize();
    }, 5000);
  });

  // LOAD DATA FROM DISK ON STARTUP
  try {
    if (fs.existsSync(dinoFilePath)) {
      const raw = fs.readFileSync(dinoFilePath, "utf8");
      const match = raw.match(/window\.DINO_DATA\s*=\s*(\[[\s\S]*\]);/);
      if (match) dinoData = Function(`return ${match[1]}`)();
    }
  } catch { dinoData = []; }

  try {
    if (fs.existsSync(playerFilePath)) {
      const raw = fs.readFileSync(playerFilePath, "utf8");
      const match = raw.match(/window\.PLAYER_DATA\s*=\s*(\[[\s\S]*\]);/);
      if (match) playerData = Function(`return ${match[1]}`)();
    }
  } catch { playerData = []; }

  try {
    if (fs.existsSync(notesFilePath)) {
      const raw = fs.readFileSync(notesFilePath, "utf8");
      const match = raw.match(/window\.NOTES_DATA\s*=\s*(\[[\s\S]*\]);/);
      if (match) notesData = Function(`return ${match[1]}`)();
    }
  } catch { notesData = []; }

  try {
    if (fs.existsSync(breedingFilePath)) {
      const raw = fs.readFileSync(breedingFilePath, "utf8");
      const match = raw.match(/window\.BREEDING_DATA\s*=\s*(\[[\s\S]*\]);/);
      if (match) breedingData = Function(`return ${match[1]}`)();
    }
  } catch { breedingData = []; }
  
  try {
    if (fs.existsSync(parserFilePath)) {
      const raw = fs.readFileSync(parserFilePath, "utf8");
      parserData = JSON.parse(raw);
    } else {
      // If the file doesn't exist yet, make one automatically!
      fs.writeFileSync(parserFilePath, "{}", "utf8");
    }
  } catch { parserData = {}; }
}

// =========================
// APP START
// =========================
app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});