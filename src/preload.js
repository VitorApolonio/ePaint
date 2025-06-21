// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('electronAPI', {
  onResize: (callback) => ipcRenderer.on('window-resized', (_event, w, h) => callback(w, h)),
  onUndoShortcut: (callback) => ipcRenderer.on('undo-shortcut', (_event) => callback()),
  onRedoShortcut: (callback) => ipcRenderer.on('redo-shortcut', (_event) => callback()),
  onSaveImage: (callback) => ipcRenderer.on('save-image', (_event, path) => callback(path)),
  saveImageToFile: (path, arrBuffer) => ipcRenderer.send('save-image-to-file', path, arrBuffer)
})