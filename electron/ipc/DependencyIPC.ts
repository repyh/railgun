import { BaseIPC } from './BaseIPC';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { BrowserWindow } from 'electron';
import { spawn } from 'child_process';

export class DependencyIPC extends BaseIPC {
    getName(): string {
        return 'dependencies';
    }

    async readPackageJson(projectPath: string): Promise<any> {
        const packageJsonPath = path.join(projectPath, 'package.json');
        try {
            if (!existsSync(packageJsonPath)) return null;
            const content = await fs.readFile(packageJsonPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    async installAll(projectPath: string, runtime: 'nodejs' | 'bun'): Promise<void> {
        const command = runtime === 'bun' ? 'bun' : 'npm';
        const args = ['install', '--verbose'];
        await this.runCommand(projectPath, command, args, 'Install All');
    }

    async install(projectPath: string, packageName: string, dev: boolean): Promise<void> {
        const isBun = existsSync(path.join(projectPath, 'bun.lockb'));
        const command = isBun ? 'bun' : 'npm';
        const args = isBun
            ? ['add', dev ? '-d' : '', packageName, '--verbose']
            : ['install', dev ? '-D' : '', packageName, '--verbose'];

        await this.runCommand(projectPath, command, args.filter(Boolean) as string[], `Install ${packageName}`);
    }

    async uninstall(projectPath: string, packageName: string): Promise<void> {
        const isBun = existsSync(path.join(projectPath, 'bun.lockb'));
        const command = isBun ? 'bun' : 'npm';
        const args = isBun
            ? ['remove', packageName, '--verbose']
            : ['uninstall', packageName, '--verbose'];

        await this.runCommand(projectPath, command, args, `Uninstall ${packageName}`);
    }

    private async runCommand(projectPath: string, command: string, args: string[], label: string): Promise<void> {
        const win = BrowserWindow.getFocusedWindow();
        if (!win) return;

        const process = spawn(command, args, { cwd: projectPath, shell: true });

        process.stdout.on('data', (data) => win.webContents.send('terminal:data', data.toString()));
        process.stderr.on('data', (data) => win.webContents.send('terminal:data', data.toString()));

        process.on('close', (code) => {
            win.webContents.send('terminal:data', `\r\n[${label}] Exited with code ${code}\r\n`);
        });
    }
}
