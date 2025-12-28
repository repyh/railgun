import type { StorageAdapter, QueryParams, Entity } from '../types';

// This adapter treats "collections" as folders and "entities" as JSON files within those folders.
// It uses the Electron IPC exposed on window.electron
export class FileSystemAdapter implements StorageAdapter {
    private projectPath: string;

    constructor(projectPath: string) {
        this.projectPath = projectPath;
    }

    async list(params: QueryParams): Promise<Entity[]> {
        // For now, this is implementing a basic generic list.
        console.warn('FileSystemAdapter.list is not fully implemented for generic recursive generic files yet.', params);
        return [];
    }

    async get(collection: string, id: string): Promise<Entity> {
        console.warn('FileSystemAdapter.get requires generic readFile IPC.', collection);
        return { id, error: 'Not implemented' };
    }

    async create(collection: string, data: any): Promise<Entity> {
        // Save as JSON file
        const id = data.id || crypto.randomUUID();
        const fileName = `${id}.json`;
        const filePath = `${collection}/${fileName}`;

        // @ts-ignore
        const success = await window.electronAPI.saveFile(this.projectPath, filePath, JSON.stringify(data, null, 2));

        if (!success) {
            throw new Error(`Failed to create entity in ${collection}`);
        }

        return { id, ...data };
    }

    async update(collection: string, id: string, data: any): Promise<Entity> {
        return this.create(collection, { ...data, id });
    }

    async delete(collection: string, id: string): Promise<void> {
        // Need deleteFile IPC
        console.warn('FileSystemAdapter.delete requires deleteFile IPC.', collection, id);
    }
}
