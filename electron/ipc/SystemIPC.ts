import { app, BrowserWindow, dialog } from 'electron';
import { BaseIPC } from './BaseIPC';

export class SystemIPC extends BaseIPC {
    getName(): string {
        return 'system';
    }

    async ping(): Promise<string> {
        return 'pong';
    }

    async getAppVersion(): Promise<string> {
        return app.getVersion();
    }

    async getNodeVersion(): Promise<string> {
        return process.version;
    }

    async echo(message: string): Promise<string> {
        return `Echo: ${message}`;
    }

    async minimizeWindow(): Promise<void> {
        BrowserWindow.getFocusedWindow()?.minimize();
    }

    async maximizeWindow(): Promise<void> {
        const win = BrowserWindow.getFocusedWindow();
        if (win?.isMaximized()) {
            win.unmaximize();
        } else {
            win?.maximize();
        }
    }

    async closeWindow(): Promise<void> {
        BrowserWindow.getFocusedWindow()?.close();
    }

    async selectDirectory(): Promise<string | null> {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory']
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    }
}
