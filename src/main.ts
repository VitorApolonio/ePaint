import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { Jimp } from 'jimp';
import Channel from './logic/channel';
import Tool from './logic/tool';

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
  ipcMain.once(Channel.MAIN_WIN_READY, () => {
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
  ipcMain.on(Channel.RESIZE_CANVAS, (_event, width, height) => {
    mainWindow.webContents.send(Channel.RESIZE_CANVAS, width, height);
  });

  // create app menu
  const menu = new Menu();

  // file menu
  menu.append(new MenuItem({
    role: 'fileMenu',
    submenu: [
      {
        label: 'Save...',
        accelerator: 'CmdOrCtrl+S',
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
          }).then(r => mainWindow.webContents.send(Channel.SAVE_CANVAS_AS_IMAGE, r.filePath));
        },
      },
    ],
  }));

  // edit menu
  menu.append(new MenuItem({
    role: 'editMenu',
    submenu: [
      {
        id: 'undo',
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        enabled: false,
        click: () => mainWindow.webContents.send(Channel.UNDO_THROUGH_SHORTCUT),
      },
      {
        id: 'redo',
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        enabled: false,
        click: () => mainWindow.webContents.send(Channel.REDO_THROUGH_SHORTCUT),
      },
      { type: 'separator' },
      {
        label: 'Resize...',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          if (newCanvasWin && !newCanvasWin.isVisible()) {
            newCanvasWin.center();
            newCanvasWin.show();
          }
        },
      },
    ],
  }));

  // disable or enable undo/redo buttons
  ipcMain.on(Channel.UNDO_SET_ENABLED, (_event, enabled: boolean) => {
    menu.getMenuItemById('undo').enabled = enabled;
    Menu.setApplicationMenu(menu);
  });
  ipcMain.on(Channel.REDO_SET_ENABLED, (_event, enabled: boolean) => {
    menu.getMenuItemById('redo').enabled = enabled;
    Menu.setApplicationMenu(menu);
  });

  // tools menu
  menu.append(new MenuItem({
    label: 'Tools',
    submenu: [
      {
        label: Tool.PAINTBRUSH,
        accelerator: 'B',
        click: () => mainWindow.webContents.send(Channel.SET_CURRENT_TOOL, Tool.PAINTBRUSH),
      },
      {
        label: Tool.ERASER,
        accelerator: 'E',
        click: () => mainWindow.webContents.send(Channel.SET_CURRENT_TOOL, Tool.ERASER),
      },
      {
        label: Tool.BUCKET,
        accelerator: 'G',
        click: () => mainWindow.webContents.send(Channel.SET_CURRENT_TOOL, Tool.BUCKET),
      },
      {
        label: Tool.EYEDROPPER,
        accelerator: 'I',
        click: () => mainWindow.webContents.send(Channel.SET_CURRENT_TOOL, Tool.EYEDROPPER),
      },
    ],
  }));

  // hidden dev tools toggle
  menu.append(new MenuItem({
    role: 'toggleDevTools',
    visible: false,
    accelerator: 'Shift+CmdOrCtrl+Alt+F12',
  }));

  Menu.setApplicationMenu(menu);
};

const createNewCanvasPrompt = (parent: BrowserWindow) => {
  // preload new canvas prompt
  const newCanvasWin = new BrowserWindow({
    width: 320,
    height: 200,
    show: false,
    parent: parent,
    modal: true,
    resizable: false,
    minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'img/icon.png'),
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    newCanvasWin.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/prompt-resize/index.html`);
  } else {
    newCanvasWin.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/src/prompt-resize/index.html`));
  }

  // close when the user clicks cancel or confirm
  ipcMain.on(Channel.CLOSE_RESIZE_PROMPT, () => {
    newCanvasWin.hide();
  });

  // prevent destroying the window on close
  newCanvasWin.on('close', e => {
    e.preventDefault();
    newCanvasWin.hide();
    newCanvasWin.webContents.send(Channel.RESET_RESIZE_PROMPT);
  });

  // disable minimize
  newCanvasWin.on('minimize', (e: Event) => {
    e.preventDefault();
    newCanvasWin.restore();
  });

  return newCanvasWin;
};

// file saving
ipcMain.on(Channel.WRITE_IMAGE_TO_DISK, async (_event, path, arrBuffer) => {
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
