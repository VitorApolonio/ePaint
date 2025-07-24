// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // show window
  mainWinReady: () => ipcRenderer.send('main-win-ready'),
  // undo/redo
  onUndoShortcut: cb => ipcRenderer.on('undo-shortcut', cb),
  onRedoShortcut: cb => ipcRenderer.on('redo-shortcut', cb),
  setUndoEnabled: enabled => ipcRenderer.send('undo-set-enabled', enabled),
  setRedoEnabled: enabled => ipcRenderer.send('redo-set-enabled', enabled),
  // save drawing
  onSaveImage: cb => ipcRenderer.on('save-image', (_event, path) => cb(path)),
  saveImageToFile: (path, arrBuf) => ipcRenderer.send('save-image-to-file', path, arrBuf),
  // new drawing
  cancelNew: () => ipcRenderer.send('cancel-new'),
  onClearNewFields: cb => ipcRenderer.on('clear-new-fields', cb),
  resizeCanvas: (w, h) => ipcRenderer.send('canvas-resize', w, h),
  onResizeCanvas: cb => ipcRenderer.on('canvas-resize', (_event, w, h) => cb(w, h)),
} as ElectronAPI);
