import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } from 'electron';
import fs from 'fs'
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'img/icon.png')
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  const resizeHandler = () => {
    const { width, height } = mainWindow.getBounds()
    mainWindow.webContents.send('window-resized', width, height)
  }
  mainWindow.on('resize', resizeHandler)
  mainWindow.webContents.once('dom-ready', resizeHandler)

  const menu = new Menu()
  menu.append(new MenuItem({
    role: 'fileMenu',
    submenu: [
      {
        label: 'Save image',
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
        click: () => {
          dialog.showSaveDialog({
            title: 'Save drawing',
            defaultPath: `${app.getPath('documents')}/image.png`,
            filters: [{ name: 'Images', extensions: ['png'] }]
          }).then(r => mainWindow.webContents.send('save-image', r.filePath))
        }
      }
    ]
  }))
  menu.append(new MenuItem({
    role: 'editMenu',
    submenu: [
      {
        label: 'Undo',
        accelerator: process.platform === 'darwin' ? 'Cmd+Z' : 'Ctrl+Z',
        click: () => { mainWindow.webContents.send('undo-shortcut') }
      },
      {
        label: 'Redo',
        accelerator: process.platform === 'darwin' ? 'Shift+Cmd+Z' : 'Ctrl+Y',
        click: () => { mainWindow.webContents.send('redo-shortcut') }
      }
    ]
  }))

  Menu.setApplicationMenu(menu)
};

// file saving
ipcMain.on('save-image-to-file', (_event, path, arrBuffer) => {
  fs.writeFile(path, Buffer.from(arrBuffer), console.error)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
