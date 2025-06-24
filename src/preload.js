// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('electronAPI', {
  mainWinReady: () => ipcRenderer.send('main-win-ready'),
  onUndoShortcut: callback => ipcRenderer.on('undo-shortcut', callback),
  onRedoShortcut: callback => ipcRenderer.on('redo-shortcut', callback),
  onSaveImage: callback => ipcRenderer.on('save-image', (_event, path) => callback(path)),
  saveImageToFile: (path, arrBuffer) => ipcRenderer.send('save-image-to-file', path, arrBuffer),
  cancelNew: () => ipcRenderer.send('cancel-new'),
  onClearNewFields: callback => ipcRenderer.on('clear-new-fields', callback),
  resizeCanvas: (width, height) => ipcRenderer.send('canvas-resize', width, height),
  onResizeCanvas: callback => ipcRenderer.on('canvas-resize', (_event, width, height) => callback(width, height))
})