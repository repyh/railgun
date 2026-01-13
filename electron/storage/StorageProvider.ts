import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { PathResolver, type DataCategory } from './PathResolver';

export class StorageProvider {
    /**
     * Initializes the folder structure required for Railgun.
     */
    public async ensureStructure(): Promise<void> {
        const categories: DataCategory[] = ['projects', 'cache', 'logs', 'plugins'];

        for (const cat of categories) {
            const dir = PathResolver.getCategoryPath(cat);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
        }
    }

    /**
     * Generic read method for a category and filename/key.
     */
    public async read(category: DataCategory, key: string): Promise<string | null> {
        let filePath: string;

        if (category === 'config' || category === 'secrets') {
            filePath = PathResolver.getCategoryPath(category);
        } else {
            filePath = path.join(PathResolver.getCategoryPath(category), key);
        }

        try {
            if (!existsSync(filePath)) return null;
            return await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            console.error(`[StorageProvider] Failed to read ${category}/${key}:`, e);
            return null;
        }
    }

    /**
     * Generic write method for a category and filename/key.
     */
    public async write(category: DataCategory, key: string, data: string): Promise<void> {
        let filePath: string;

        if (category === 'config' || category === 'secrets') {
            filePath = PathResolver.getCategoryPath(category);
        } else {
            filePath = path.join(PathResolver.getCategoryPath(category), key);
        }

        try {
            // Ensure parent directory exists for non-config/secrets categories
            if (category !== 'config' && category !== 'secrets') {
                const dir = path.dirname(filePath);
                if (!existsSync(dir)) {
                    mkdirSync(dir, { recursive: true });
                }
            }

            await fs.writeFile(filePath, data, 'utf-8');
        } catch (e) {
            console.error(`[StorageProvider] Failed to write ${category}/${key}:`, e);
            throw e;
        }
    }

    /**
     * Lists files in a given category directory.
     */
    public async list(category: DataCategory): Promise<string[]> {
        const dir = PathResolver.getCategoryPath(category);
        if (category === 'config' || category === 'secrets') {
            return existsSync(dir) ? [path.basename(dir)] : [];
        }

        try {
            if (!existsSync(dir)) return [];
            return await fs.readdir(dir);
        } catch (e) {
            console.error(`[StorageProvider] Failed to list ${category}:`, e);
            return [];
        }
    }
}
