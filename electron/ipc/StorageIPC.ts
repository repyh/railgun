import { BaseIPC } from './BaseIPC';
import { StorageProvider } from '../storage/StorageProvider';
import { PathResolver, type DataCategory } from '../storage/PathResolver';

export class StorageIPC extends BaseIPC {
    private provider: StorageProvider;

    constructor() {
        super();
        this.provider = new StorageProvider();
    }

    getName(): string {
        return 'storage';
    }

    /**
     * Overriding register to perform bootstrapping before automated registration.
     */
    public register(): void {
        this.provider.ensureStructure().catch(console.error);
        super.register();
    }

    // --- IPC HANDLER METHODS ---

    /**
     * storage:getConfig
     */
    async getConfig(): Promise<string | null> {
        return await this.provider.read('config', 'config.json');
    }

    /**
     * storage:setConfig
     */
    async setConfig(data: string): Promise<boolean> {
        await this.provider.write('config', 'config.json', data);
        return true;
    }

    /**
     * storage:getSecrets
     */
    async getSecrets(): Promise<string | null> {
        return await this.provider.read('secrets', 'secrets.json');
    }

    /**
     * storage:setSecrets
     */
    async setSecrets(data: string): Promise<boolean> {
        await this.provider.write('secrets', 'secrets.json', data);
        return true;
    }

    /**
     * storage:read
     */
    async read(category: DataCategory, key: string): Promise<string | null> {
        return await this.provider.read(category, key);
    }

    /**
     * storage:write
     */
    async write(category: DataCategory, key: string, data: string): Promise<boolean> {
        await this.provider.write(category, key, data);
        return true;
    }

    /**
     * storage:list
     */
    async list(category: DataCategory): Promise<string[]> {
        return await this.provider.list(category);
    }

    /**
     * storage:getPath
     */
    async getPath(category: DataCategory): Promise<string> {
        return PathResolver.getCategoryPath(category);
    }
}
