import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  clipboard,
  nativeImage,
  ipcMain,
} from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let clipboardHistory: string[] = [];
let lastClipboardContent = '';

const MAX_HISTORY = 100;
const POLL_INTERVAL = 1000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In production, load the built web app; in dev, load localhost
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:19006');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../web-build/index.html'));
  }

  mainWindow.on('blur', () => {
    mainWindow?.hide();
  });
}

function createTray() {
  // Create a simple tray icon (paperclip emoji as text)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setTitle('📎');
  tray.setToolTip('Cleppy - Clipboard Assistant');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '📎 Cleppy を開く',
      click: () => toggleWindow(),
    },
    { type: 'separator' },
    {
      label: '履歴をクリア',
      click: () => {
        clipboardHistory = [];
        mainWindow?.webContents.send('clipboard-history-cleared');
      },
    },
    { type: 'separator' },
    {
      label: '終了',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
}

function toggleWindow() {
  if (!mainWindow) return;

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    positionWindow();
    mainWindow.show();
    mainWindow.focus();
  }
}

function positionWindow() {
  if (!mainWindow || !tray) return;

  const trayBounds = tray.getBounds();
  const windowBounds = mainWindow.getBounds();

  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );
  const y = Math.round(trayBounds.y + trayBounds.height);

  mainWindow.setPosition(x, y, false);
}

function startClipboardMonitoring() {
  setInterval(() => {
    const currentContent = clipboard.readText();

    if (currentContent && currentContent !== lastClipboardContent) {
      lastClipboardContent = currentContent;
      clipboardHistory.unshift(currentContent);

      if (clipboardHistory.length > MAX_HISTORY) {
        clipboardHistory = clipboardHistory.slice(0, MAX_HISTORY);
      }

      mainWindow?.webContents.send('clipboard-new-content', currentContent);
    }
  }, POLL_INTERVAL);
}

function registerGlobalShortcuts() {
  // Cmd+Shift+V (macOS) / Ctrl+Shift+V (Windows/Linux)
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.webContents.send('toggle-history-overlay');
    } else {
      toggleWindow();
      // Wait for window to show, then open overlay
      setTimeout(() => {
        mainWindow?.webContents.send('toggle-history-overlay');
      }, 300);
    }
  });
}

// IPC handlers
ipcMain.handle('get-clipboard-history', () => {
  return clipboardHistory;
});

ipcMain.handle('write-clipboard', (_event, text: string) => {
  clipboard.writeText(text);
  lastClipboardContent = text;
});

ipcMain.handle('hide-window', () => {
  mainWindow?.hide();
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  startClipboardMonitoring();
  registerGlobalShortcuts();

  // Hide dock icon on macOS (menu bar app only)
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Keep app running in tray
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
