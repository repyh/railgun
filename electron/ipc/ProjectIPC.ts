import { BaseIPC } from './BaseIPC';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { BrowserWindow, app } from 'electron';
import { ProjectGenerator } from '../lib/ProjectGenerator';

interface ProjectData {
    name: string;
    path: string;
    runtime: 'nodejs' | 'bun';
    template: 'typescript' | 'javascript' | 'empty';
}

export class ProjectIPC extends BaseIPC {
    getName(): string {
        return 'project';
    }

    async createProject(data: ProjectData): Promise<{ success: boolean; message?: string }> {
        const projectPath = path.join(data.path, data.name);

        try {
            if (existsSync(projectPath)) {
                return { success: false, message: 'Project directory already exists.' };
            }

            console.log('ProjectGenerator: Creating project at', projectPath);
            await ProjectGenerator.generate({
                name: data.name,
                path: data.path,
                runtime: data.runtime,
                template: data.template
            });

            return { success: true };
        } catch (error: any) {
            console.error('Project creation failed:', error);
            return { success: false, message: error.message };
        }
    }

    async openProject(): Promise<{ canceled: boolean; path?: string; name?: string; error?: string }> {
        const { dialog } = require('electron');
        const win = BrowserWindow.getFocusedWindow();

        if (!win) return { canceled: true };

        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        });

        if (result.canceled || result.filePaths.length === 0) {
            return { canceled: true };
        }

        const projectPath = result.filePaths[0];
        const botmConfigPath = path.join(projectPath, 'railgun.json');

        if (!existsSync(botmConfigPath)) {
            return { canceled: false, error: 'Invalid project: railgun.json not found.' };
        }

        return {
            canceled: false,
            path: projectPath,
            name: path.basename(projectPath) // Fallback name
        };
    }

    async readProjectConfig(projectPath: string): Promise<any> {
        const configPath = path.join(projectPath, 'railgun.json');
        if (!existsSync(configPath)) return null;
        try {
            const raw = await fs.readFile(configPath, 'utf-8');
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to read railgun.json', e);
            return null;
        }
    }

    async saveProjectConfig(projectPath: string, config: any): Promise<boolean> {
        const configPath = path.join(projectPath, 'railgun.json');
        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            return true;
        } catch (e) {
            console.error('Failed to save railgun.json', e);
            return false;
        }
    }
}
