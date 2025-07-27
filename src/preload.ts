import { contextBridge, ipcRenderer } from 'electron';
import Channel from './logic/channel';

contextBridge.exposeInMainWorld('electronAPI', {
  // show window
  mainWinReady: () => ipcRenderer.send(Channel.MAIN_WIN_READY),
  // undo/redo
  onUndoShortcut: cb => ipcRenderer.on(Channel.UNDO_THROUGH_SHORTCUT, cb),
  onRedoShortcut: cb => ipcRenderer.on(Channel.REDO_THROUGH_SHORTCUT, cb),
  setUndoEnabled: enabled => ipcRenderer.send(Channel.UNDO_SET_ENABLED, enabled),
  setRedoEnabled: enabled => ipcRenderer.send(Channel.REDO_SET_ENABLED, enabled),
  // save drawing
  onOpenImage: cb => ipcRenderer.on(Channel.LOAD_IMAGE_TO_CANVAS, (_event, buf) => cb(buf)),
  onSaveImage: cb => ipcRenderer.on(Channel.SAVE_CANVAS_AS_IMAGE, (_event, path) => cb(path)),
  saveImageToFile: (path, arrBuf) => ipcRenderer.send(Channel.WRITE_IMAGE_TO_DISK, path, arrBuf),
  // canvas resize prompt
  cancelNew: () => ipcRenderer.send(Channel.CLOSE_RESIZE_PROMPT),
  onClearNewFields: cb => ipcRenderer.on(Channel.RESET_RESIZE_PROMPT, cb),
  // forward new canvas dimensions to the main IPC
  resizeCanvas: (w, h) => ipcRenderer.send(Channel.RESIZE_CANVAS, w, h),
  // listen for new dimensions from the main IPC
  onResizeCanvas: cb => ipcRenderer.on(Channel.RESIZE_CANVAS, (_event, w, h) => cb(w, h)),
  // change tool by shortcut
  onToolSwitch: cb => ipcRenderer.on(Channel.SET_CURRENT_TOOL, (_event, tool) => cb(tool)),
  // wipe canvas by shortcut
  onClearShortcut: cb => ipcRenderer.on(Channel.CLEAR_THROUGH_SHORTCUT, cb),
} as ElectronAPI);
