import { app, BrowserWindow } from 'electron';
import path from 'path';
import { SystemIPC } from './ipc/SystemIPC';
import { ProjectIPC } from './ipc/ProjectIPC';
import { FileSystemIPC } from './ipc/FileSystemIPC';

import { PluginIPC } from './ipc/PluginIPC';
import { DependencyIPC } from './ipc/DependencyIPC';
import { BotProcessIPC } from './ipc/BotProcessIPC';
import { ipcMain } from 'electron';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**
 * Creates the main application window.
 * Initializes web preferences and loads the appropriate entry point (localhost or dist).
 */
let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

const createSplashWindow = () => {
    splashWindow = new BrowserWindow({
        width: 500,
        height: 300,
        backgroundColor: '#09090b',
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        center: true,
        show: false, // Wait until ready-to-show
        movable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html'));

    splashWindow.once('ready-to-show', () => {
        splashWindow?.show();
    });

    splashWindow.on('closed', () => {
        splashWindow = null;
    });
};

const createMainWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // HIDDEN INITIALLY
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // MVP: Enable Node Integration for Plugin System
            contextIsolation: false,
            nodeIntegration: true,
            // enableRemoteModule: true // If using @electron/remote
        },
        titleBarStyle: 'hidden',
    });

    // Check if we are packed (production) or in development
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }

    // Enable @electron/remote for this window
    require('@electron/remote/main').enable(mainWindow.webContents);

    // Show main window when ready (if splash is skipped) OR wait for signal
    // For this flow, we wait for the AppLoader to signal 'system:app-ready'
};

// IPC Handlers for Splash
ipcMain.on('system:update-status', (_, data: { status: string, progress: number }) => {
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.webContents.send('splash-update', data);
    }
});

ipcMain.on('system:app-ready', () => {
    // 1. Show Main Window
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
    }
    // 2. Destroy Splash Window
    if (splashWindow) {
        splashWindow.destroy();
    }
});

// Initialize remote module
require('@electron/remote/main').initialize();

app.whenReady().then(() => {
    // Register IPC modules
    new SystemIPC().register();
    new ProjectIPC().register();
    new FileSystemIPC().register();
    new PluginIPC().register();
    new DependencyIPC().register();
    new BotProcessIPC().register();

    createSplashWindow();
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createSplashWindow();
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
