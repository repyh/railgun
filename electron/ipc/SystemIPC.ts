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
