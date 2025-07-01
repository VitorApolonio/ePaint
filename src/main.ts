import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { Jimp } from 'jimp';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'img/icon.png'),
  });

  // display window when CSS finishes loading
  ipcMain.once('main-win-ready', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // preload new canvas prompt
  const newCanvasWin = createNewCanvasPrompt(mainWindow);

  // forward data with width/height on resize confirm
  ipcMain.on('canvas-resize', (_event, width, height) => {
    mainWindow.webContents.send('canvas-resize', width, height);
  });

  // create app menu
  const menu = new Menu();
  menu.append(new MenuItem({
    role: 'fileMenu',
    submenu: [
      {
        label: 'New...',
        accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
        click: () => {
          if (newCanvasWin && !newCanvasWin.isVisible()) {
            newCanvasWin.center();
            newCanvasWin.show();
          }
        },
      },
      {
        label: 'Save image...',
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
        click: () => {
          dialog.showSaveDialog({
            title: 'Save drawing',
            defaultPath: path.join(app.getPath('pictures'), 'drawing.png'),
            filters: [
              { name: 'Portable Network Graphics (PNG)', extensions: ['png'] },
              { name: 'Joint Photographic Experts Group (JPEG)', extensions: ['jpg', 'jpeg'] },
              { name: 'Tagged Image File Format (TIFF)', extensions: ['tif', 'tiff'] },
              { name: 'Windows Bitmap (BMP)', extensions: ['bmp'] },
              { name: 'All Files', extensions: ['*'] },
            ],
          }).then(r => mainWindow.webContents.send('save-image', r.filePath));
        },
      },
    ],
  }));
  const undoItem = new MenuItem({
    label: 'Undo',
    accelerator: process.platform === 'darwin' ? 'Cmd+Z' : 'Ctrl+Z',
    enabled: false,
    click: () => { mainWindow.webContents.send('undo-shortcut'); },
  });
  const redoItem = new MenuItem({
    label: 'Redo',
    accelerator: process.platform === 'darwin' ? 'Shift+Cmd+Z' : 'Ctrl+Y',
    enabled: false,
    click: () => { mainWindow.webContents.send('redo-shortcut'); },
  });
  menu.append(new MenuItem({
    role: 'editMenu',
    submenu: [undoItem, redoItem],
  }));

  // disable or enable undo/redo buttons
  ipcMain.on('undo-enable', () => {
    undoItem.enabled = true;
    Menu.setApplicationMenu(menu);
  });
  ipcMain.on('undo-disable', () => {
    undoItem.enabled = false;
    Menu.setApplicationMenu(menu);
  });
  ipcMain.on('redo-enable', () => {
    redoItem.enabled = true;
    Menu.setApplicationMenu(menu);
  });
  ipcMain.on('redo-disable', () => {
    redoItem.enabled = false;
    Menu.setApplicationMenu(menu);
  });

  Menu.setApplicationMenu(menu);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
};

const createNewCanvasPrompt = parent => {
  // preload new canvas prompt
  const newCanvasWin = new BrowserWindow({
    width: 320,
    height: 256,
    show: false,
    parent: parent,
    modal: true,
    resizable: false,
    minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
    },
    icon: path.join(__dirname, 'img/icon.png'),
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    newCanvasWin.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/prompt/new-canvas.html`);
  } else {
    newCanvasWin.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/src/prompt/new-canvas.html`));
  }

  // close when user clicks cancel
  ipcMain.on('cancel-new', () => {
    newCanvasWin.hide();
  });

  // prevent destroying the window on close
  newCanvasWin.on('close', e => {
    e.preventDefault();
    newCanvasWin.hide();
    newCanvasWin.webContents.send('clear-new-fields');
  });

  // disable minimize
  newCanvasWin.on('minimize', e => {
    e.preventDefault();
    newCanvasWin.restore();
  });

  return newCanvasWin;
};

// file saving
ipcMain.on('save-image-to-file', async (_event, path, arrBuffer) => {
  const supported = ['png', 'jpg', 'jpeg', 'bmp', 'tif', 'tiff'];
  const ext = path.split('.').pop().toLowerCase();
  if (supported.includes(ext)) {
    Jimp.read(arrBuffer).then(img => {
      img.write(path);
    }).catch(console.error);
  }
});

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
