// --- RUNTIME ALIAS RESOLVER ---
// This allows Electron to resolve the "@/ " path alias at runtime in the compiled dist-electron folder.
(function () {
    const Module = require('module');
    const path = require('path');
    const originalResolveFilename = Module._resolveFilename;

    Module._resolveFilename = function (request: string, parent: any, isMain: boolean) {
        if (request.startsWith('@/')) {
            const relativePath = request.slice(2);
            // In dist-electron, 'main.js' is in 'electron/', and 'src/' is a sibling.
            // So @/ -> ../src/
            const absolutePath = path.resolve(__dirname, '..', 'src', relativePath);
            return originalResolveFilename.call(this, absolutePath, parent, isMain);
        }
        return originalResolveFilename.call(this, request, parent, isMain);
    };
})();

import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { SystemIPC } from './ipc/SystemIPC';
import { ProjectIPC } from './ipc/ProjectIPC';
import { FileSystemIPC } from './ipc/FileSystemIPC';

import { PluginIPC } from './ipc/PluginIPC';
import { DependencyIPC } from './ipc/DependencyIPC';
import { BotProcessIPC } from './ipc/BotProcessIPC';
import { TitlebarIPC } from './ipc/TitlebarIPC';
import { DiscordRPCIPC } from './ipc/DiscordRPCIPC';
import { RuntimeIPC } from './ipc/RuntimeIPC';
import { StorageIPC } from './ipc/StorageIPC';
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

    splashWindow.loadFile(path.join(__dirname, '../splash.html'));

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
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
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
    new TitlebarIPC().register();
    new DiscordRPCIPC().register();
    new RuntimeIPC().register();
    new StorageIPC().register();

    // Standard Application Menu for Copy/Paste/DevTools
    const template: any[] = [
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'close' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

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
