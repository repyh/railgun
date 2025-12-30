import { BaseIPC } from './BaseIPC';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { BrowserWindow, app } from 'electron';
import { spawn } from 'child_process';

export class PluginIPC extends BaseIPC {
    getName(): string {
        return 'plugins';
    }

    async listInstalled(projectPath: string): Promise<string[]> {
        const pluginsDir = path.join(projectPath, 'plugins');
        if (!existsSync(pluginsDir)) return [];

        try {
            const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
            return entries.filter(e => e.isDirectory()).map(e => e.name);
        } catch (e) {
            console.error('Failed to list installed plugins:', e);
            return [];
        }
    }

    async install(projectPath: string, pluginId: string): Promise<{ success: boolean; message?: string }> {
        const idRegex = /^[a-zA-Z0-9\-_]+$/;
        if (!idRegex.test(pluginId)) {
            return { success: false, message: `Invalid plugin ID: ${pluginId}. Only alphanumeric, dashes, and underscores allowed.` };
        }

        const sourcePath = path.join(app.getPath('documents'), 'railgun', 'plugins', pluginId);
        const destPath = path.join(projectPath, 'plugins', pluginId);

        if (!existsSync(sourcePath)) {
            return { success: false, message: `Plugin ${pluginId} not found in library.` };
        }

        try {
            if (!existsSync(destPath)) {
                await fs.mkdir(destPath, { recursive: true });
            }
            await fs.cp(sourcePath, destPath, { recursive: true });

            // Handle Dependencies
            const manifestPath = path.join(destPath, 'manifest.json');
            if (existsSync(manifestPath)) {
                const manifestContent = await fs.readFile(manifestPath, 'utf-8');
                const manifest = JSON.parse(manifestContent);

                if (manifest.requirements) {
                    const isBun = existsSync(path.join(projectPath, 'bun.lockb'));
                    for (const [pkg, version] of Object.entries(manifest.requirements)) {
                        // Strict validation: Allow only alphanumeric, dashes, dots, and common version chars
                        const safePkg = pkg.replace(/[^a-zA-Z0-9\-_/@]/g, '');
                        const safeVersion = String(version).replace(/[^a-zA-Z0-9\-_./^~*]/g, '');

                        await this.runInstallCommand(projectPath, safePkg, safeVersion, isBun);
                    }
                }
            }

            return { success: true };
        } catch (e: any) {
            console.error(`Failed to install plugin ${pluginId}:`, e);
            return { success: false, message: e.message };
        }
    }

    async uninstall(projectPath: string, pluginId: string): Promise<{ success: boolean; message?: string }> {
        const idRegex = /^[a-zA-Z0-9\-_]+$/;
        if (!idRegex.test(pluginId)) {
            return { success: false, message: `Invalid plugin ID: ${pluginId}. Only alphanumeric, dashes, and underscores allowed.` };
        }

        const destPath = path.join(projectPath, 'plugins', pluginId);

        if (!existsSync(destPath)) {
            return { success: false, message: `Plugin ${pluginId} is not installed.` };
        }

        try {
            await fs.rm(destPath, { recursive: true, force: true });
            return { success: true };
        } catch (e: any) {
            console.error(`Failed to uninstall plugin ${pluginId}:`, e);
            return { success: false, message: e.message };
        }
    }

    private async runInstallCommand(projectPath: string, pkg: string, version: string, isBun: boolean): Promise<void> {
        return new Promise((resolve) => {
            const command = isBun ? 'bun' : 'npm';
            const args = isBun
                ? ['add', `${pkg}@${version}`, '--verbose']
                : ['install', `${pkg}@${version}`, '--verbose'];

            const win = BrowserWindow.getFocusedWindow();
            if (win) win.webContents.send('terminal:data', `\r\n[Plugin] Installing dependency: ${pkg}@${version}...\r\n`);

            const process = spawn(command, args, { cwd: projectPath, shell: true });

            process.stdout.on('data', (data) => win && win.webContents.send('terminal:data', data.toString()));
            process.stderr.on('data', (data) => win && win.webContents.send('terminal:data', data.toString()));

            process.on('close', (code) => {
                if (win) {
                    if (code === 0) win.webContents.send('terminal:data', `\r\n[Plugin] Successfully installed ${pkg}.\r\n`);
                    else win.webContents.send('terminal:data', `\r\n[Plugin] Failed to install ${pkg}. Code: ${code}\r\n`);
                }
                resolve();
            });

            process.on('error', () => resolve());
        });
    }
}
