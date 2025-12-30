import { BrowserWindow, shell } from 'electron';
import { BaseIPC } from './BaseIPC';

export class TitlebarIPC extends BaseIPC {
    getName(): string {
        return 'titlebar';
    }

    async minimizeWindow(): Promise<void> {
        BrowserWindow.getFocusedWindow()?.minimize();
    }

    async toggleMaximizeWindow(): Promise<void> {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
            if (win.isMaximized()) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    }

    async closeWindow(): Promise<void> {
        BrowserWindow.getFocusedWindow()?.close();
    }

    async openExternalLink(url: string): Promise<void> {
        shell.openExternal(url);
    }
}
