import path from 'path';
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

    public register(): void {
        this.provider.ensureStructure().catch(console.error);
        super.register();
    }

    async getConfig(): Promise<string | null> {
        return await this.provider.read('config', 'config.json');
    }

    async setConfig(data: string): Promise<boolean> {
        await this.provider.write('config', 'config.json', data);
        return true;
    }

    async getSecrets(): Promise<string | null> {
        return await this.provider.read('secrets', 'secrets.json');
    }

    async setSecrets(data: string): Promise<boolean> {
        await this.provider.write('secrets', 'secrets.json', data);
        return true;
    }

    async read(category: DataCategory, key: string): Promise<string | null> {
        return await this.provider.read(category, key);
    }

    async write(category: DataCategory, key: string, data: string): Promise<boolean> {
        await this.provider.write(category, key, data);
        return true;
    }

    async list(category: DataCategory): Promise<string[]> {
        return await this.provider.list(category);
    }

    async getPath(category: DataCategory): Promise<string> {
        return PathResolver.getCategoryPath(category);
    }

    async getBotConfig(projectPath: string): Promise<string | null> {
        return await this.provider.read('projects', path.join(projectPath, 'railgun.config.json'));
    }

    async setBotConfig(projectPath: string, data: string): Promise<boolean> {
        await this.provider.write('projects', path.join(projectPath, 'railgun.config.json'), data);
        return true;
    }
}
