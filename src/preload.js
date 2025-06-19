// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('electronAPI', {
  onResize: (callback) => ipcRenderer.on('window-resized', (_event, w, h) => callback(w, h)),
  test: () => console.log('hello, world')
})