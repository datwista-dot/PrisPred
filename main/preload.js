const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowControls', {
  close: () => ipcRenderer.send('window-close'),
  minimize: () => ipcRenderer.send('window-minimize'),
  setAlwaysOnTop: (enabled) => ipcRenderer.send('set-always-on-top', enabled)
});

contextBridge.exposeInMainWorld("api", {
  // Dinos
  getDinos: () => ipcRenderer.invoke("get-dinos"),
  setDinos: (data) => ipcRenderer.send("set-dinos", data),
  onDinosUpdate: (cb) => ipcRenderer.on("dinos-updated", (_, data) => cb(data)),

  // Players
  getPlayers: () => ipcRenderer.invoke("get-players"),
  setPlayers: (data) => ipcRenderer.send("set-players", data),
  onPlayersUpdate: (cb) => ipcRenderer.on("players-updated", (_, data) => cb(data)),

  // Notes
  getNotes: () => ipcRenderer.invoke("get-notes"),
  setNotes: (data) => ipcRenderer.send("set-notes", data),

  // Breeding
  getBreeding: () => ipcRenderer.invoke("get-breeding"),
  setBreeding: (data) => ipcRenderer.send("set-breeding", data),
  onBreedingUpdate: (cb) => ipcRenderer.on("breeding-updated", (_, data) => cb(data)),
  
  saveAdImage: (base64Data) => ipcRenderer.invoke('save-ad-image', base64Data),
  
  getParserData: () => ipcRenderer.invoke("get-parser-data"),
  setParserData: (data) => ipcRenderer.send("set-parser-data", data)
});