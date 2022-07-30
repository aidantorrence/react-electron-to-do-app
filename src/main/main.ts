/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import activeWindow from 'active-win';
import prompt from 'electron-prompt';
import MenuBuilder from './menu';
import {
  firstPrompt,
  fourthPrompt,
  resolveHtmlPath,
  secondPrompt,
  thirdPrompt,
} from './util';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | undefined;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('focus-browser-small', async () => {
  mainWindow?.setSize(225, 225);
});
ipcMain.on('focus-browser-big', async () => {
  mainWindow?.setSize(800, 500);
});
ipcMain.on('focus-browser-med', async () => {
  mainWindow?.setSize(400, 200);
});
ipcMain.on('focus-browser-skinny', async () => {
  mainWindow?.setSize(250, 1000);
  mainWindow?.setSize(250, 200);
});
ipcMain.on('center', async () => {
  mainWindow?.center();
});
ipcMain.on('prompt', async () => {
  try {
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line no-await-in-loop
      const res = await prompt(firstPrompt as any, mainWindow);
      // const secondRes = await prompt(secondPrompt, mainWindow);
      // const thirdRes = await prompt(thirdPrompt, mainWindow);
      // const fourthRes = await prompt(fourthPrompt, mainWindow);
      mainWindow?.webContents.send('prompt', res);
      if (res !== null) break;
    }
  } catch {
    console.log('Prompt cancelled');
  }
});
// eslint-disable-next-line consistent-return
ipcMain.on('get-active-window', async () => {
  try {
    const activeWin = await activeWindow();
    mainWindow?.webContents.send('activeWindow', activeWin);
    return activeWin;
  } catch (e) {
    console.log(e);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  // require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    transparent: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.setAlwaysOnTop(true);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === undefined) createWindow();
    });
  })
  .catch(console.log);
