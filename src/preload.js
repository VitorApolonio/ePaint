// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('electronAPI', {
  mainWinReady: () => ipcRenderer.send('main-win-ready'),
  newCanvasWinReady: () => ipcRenderer.send('new-canvas-win-ready'),
  onUndoShortcut: (callback) => ipcRenderer.on('undo-shortcut', (_event) => callback()),
  onRedoShortcut: (callback) => ipcRenderer.on('redo-shortcut', (_event) => callback()),
  onSaveImage: (callback) => ipcRenderer.on('save-image', (_event, path) => callback(path)),
  saveImageToFile: (path, arrBuffer) => ipcRenderer.send('save-image-to-file', path, arrBuffer),
  cancelNew: () => ipcRenderer.send('cancel-new')
})