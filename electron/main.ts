import { app, BrowserWindow } from 'electron';
import path from 'path';
import { SystemIPC } from './ipc/SystemIPC';
import { ProjectIPC } from './ipc/ProjectIPC';
import { FileSystemIPC } from './ipc/FileSystemIPC';
import { PluginIPC } from './ipc/PluginIPC';
import { DependencyIPC } from './ipc/DependencyIPC';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**
 * Creates the main application window.
 * Initializes web preferences and loads the appropriate entry point (localhost or dist).
 */
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
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
    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Enable @electron/remote for this window
    require('@electron/remote/main').enable(mainWindow.webContents);
};

// Initialize remote module
require('@electron/remote/main').initialize();

app.whenReady().then(() => {
    // Register IPC modules
    new SystemIPC().register();
    new ProjectIPC().register();
    new FileSystemIPC().register();
    new PluginIPC().register();
    new DependencyIPC().register();

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
