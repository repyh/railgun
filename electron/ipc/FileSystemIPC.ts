import { BaseIPC } from './BaseIPC';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';

export class FileSystemIPC extends BaseIPC {
    getName(): string {
        return 'fs';
    }

    async write(projectPath: string, filePath: string, content: string): Promise<boolean> {
        const absolutePath = path.join(projectPath, filePath);

        if (!absolutePath.startsWith(projectPath)) {
            console.error('Security Error: Attempted to write outside project directory', absolutePath);
            return false;
        }

        try {
            const dir = path.dirname(absolutePath);
            if (!existsSync(dir)) {
                await fs.mkdir(dir, { recursive: true });
            }
            await fs.writeFile(absolutePath, content, 'utf-8');
            return true;
        } catch (e) {
            console.error(`Failed to save file: ${filePath}`, e);
            return false;
        }
    }

    async read(projectPath: string, filePath: string): Promise<string | null> {
        const absolutePath = path.join(projectPath, filePath);

        if (!absolutePath.startsWith(projectPath)) {
            console.error('Security Error: Attempted to read outside project directory', absolutePath);
            return null;
        }

        try {
            if (!existsSync(absolutePath)) return null;
            return await fs.readFile(absolutePath, 'utf-8');
        } catch (e) {
            console.error(`Failed to read file: ${filePath}`, e);
            return null;
        }
    }

    async list(projectPath: string, directory: string): Promise<string[]> {
        const targetPath = path.join(projectPath, directory);

        if (!targetPath.startsWith(projectPath)) {
            console.error('Security Error: Attempted to read outside project directory', targetPath);
            return [];
        }

        try {
            if (!existsSync(targetPath)) return [];
            return await fs.readdir(targetPath);
        } catch (e) {
            console.error(`Failed to list files in: ${directory}`, e);
            return [];
        }
    }

    async delete(projectPath: string, filePath: string): Promise<boolean> {
        const absolutePath = path.normalize(path.join(projectPath, filePath));
        const normalizedProjectPath = path.normalize(projectPath);

        if (!absolutePath.startsWith(normalizedProjectPath)) {
            console.error('Security Error: Attempted to delete outside project directory', absolutePath);
            return false;
        }

        try {
            if (!existsSync(absolutePath)) {
                console.warn(`File not found for deletion: ${absolutePath}`);
                return false;
            }
            await fs.unlink(absolutePath);

            if (filePath.endsWith('.railgun.json')) {
                const compiledPath = absolutePath.replace('.railgun.json', '.js');
                if (existsSync(compiledPath)) {
                    try {
                        await fs.unlink(compiledPath);
                    } catch (e) {
                        // ignore
                    }
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }
}
