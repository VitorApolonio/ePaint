import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'fs';
import { Jimp } from 'jimp';
import Channel from './logic/channel';
import Tool from './logic/tool';

const createMainWindow = () => {
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

  // preload windows
  const resizeWin = createResizeCanvasWindow(mainWindow);
  const aboutWin = createAboutWindow(mainWindow);
  const colorPickerWin = createColorPickerWindow(mainWindow);

  // forward data with width/height on resize confirm
  ipcMain.on(Channel.RESIZE_CANVAS, (_event, width, height) => {
    mainWindow.webContents.send(Channel.RESIZE_CANVAS, width, height);
  });

  // open color picker menu when a button is pressed
  ipcMain.on(Channel.OPEN_COLOR_PICKER_WINDOW, (_event, primary) => {
    if (colorPickerWin && !colorPickerWin.isVisible()) {
      colorPickerWin.center();
      colorPickerWin.show();
    }
  });

  // create app menu
  const menu = new Menu();

  // file menu
  menu.append(new MenuItem({
    role: 'fileMenu',
    submenu: [
      {
        label: 'New canvas',
        accelerator: 'CmdOrCtrl+N',
        click: () => mainWindow.webContents.send(Channel.CLEAR_THROUGH_SHORTCUT),
      },
      { type: 'separator' },
      {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          dialog.showOpenDialog({
            title: 'Open drawing',
            defaultPath: app.getPath('pictures'),
            filters: [
              { name: 'Portable Network Graphics (PNG)', extensions: ['png'] },
              { name: 'Joint Photographic Experts Group (JPEG)', extensions: ['jpg', 'jpeg'] },
              { name: 'Tagged Image File Format (TIFF)', extensions: ['tif', 'tiff'] },
              { name: 'Windows Bitmap (BMP)', extensions: ['bmp'] },
              { name: 'All Files', extensions: ['*'] },
            ],
          }).then(async r => {
            if (!r.canceled && r.filePaths.length) {
              const supported = ['png', 'jpg', 'jpeg', 'bmp', 'tif', 'tiff'];
              const ext = r.filePaths[0].split('.').pop().toLowerCase();
              if (supported.includes(ext)) {
                const imgBuf = fs.readFileSync(r.filePaths[0]);
                mainWindow.webContents.send(Channel.LOAD_IMAGE_TO_CANVAS, imgBuf);
              }
            }
          });
        },
      },
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
      { type: 'separator' },
      {
        role: 'close',
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
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
          if (resizeWin && !resizeWin.isVisible()) {
            resizeWin.center();
            resizeWin.show();
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

  // help menu
  menu.append(new MenuItem({
    role: 'help',
    submenu: [
      {
        label: 'About ePaint',
        click: () => {
          if (aboutWin && !aboutWin.isVisible()) {
            aboutWin.center();
            aboutWin.show();
          }
        },
      },
      {
        // hidden dev tools toggle
        role: 'toggleDevTools',
        visible: false,
        accelerator: 'Shift+CmdOrCtrl+Alt+N',
      },
    ],
  }));

  Menu.setApplicationMenu(menu);
};

const setUpModalWindow = (win: BrowserWindow, folderName: string) => {
  // close with esc
  win.webContents.on('before-input-event', (_event, input) => {
    if (input.key === 'Escape') {
      win.hide();
    }
  });

  // hide menu
  win.setMenuBarVisibility(false);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/${folderName}/index.html`);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/src/${folderName}/index.html`));
  }

  // prevent destroying the window on close
  win.on('close', e => {
    e.preventDefault();
    win.hide();
  });

  // minimize main window instead
  win.on('minimize', (e: Event) => {
    e.preventDefault();
    parent.minimize();
    win.hide();
  });
};

const createResizeCanvasWindow = (parent: BrowserWindow) => {
  // preload new canvas prompt
  const resizeCanvasWin = new BrowserWindow({
    width: 320,
    height: 200,
    show: false,
    parent: parent,
    modal: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'img/icon.png'),
  });

  // clear fields on close
  resizeCanvasWin.webContents.on('before-input-event', (_event, input) => {
    if (input.key === 'Escape') {
      resizeCanvasWin.webContents.send(Channel.RESET_RESIZE_PROMPT);
    }
  });
  resizeCanvasWin.on('close', () => {
    resizeCanvasWin.webContents.send(Channel.RESET_RESIZE_PROMPT);
  });

  // close when the user clicks cancel or confirm
  ipcMain.on(Channel.CLOSE_RESIZE_PROMPT, () => {
    resizeCanvasWin.hide();
  });

  setUpModalWindow(resizeCanvasWin, 'window-resize');

  return resizeCanvasWin;
};

const createAboutWindow = (parent: BrowserWindow) => {
  const aboutWindow = new BrowserWindow({
    width: 320,
    height: 256,
    show: false,
    resizable: false,
    parent: parent,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'img/icon.png'),
  });

  setUpModalWindow(aboutWindow, 'window-about');

  return aboutWindow;
};

const createColorPickerWindow = (parent: BrowserWindow) => {
  const colorPickerWindow = new BrowserWindow({
    width: 512,
    height: 300,
    show: false,
    resizable: false,
    parent: parent,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'img/icon.png'),
  });

  setUpModalWindow(colorPickerWindow, 'window-color-picker');

  return colorPickerWindow;
};

// file saving
ipcMain.on(Channel.WRITE_IMAGE_TO_DISK, async (_event, path, arrBuffer) => {
  const supported = ['png', 'jpg', 'jpeg', 'bmp', 'tif', 'tiff'];
  const ext = path.split('.').pop().toLowerCase();
  // ignore paths with unsupported extensions
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
  createMainWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
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
