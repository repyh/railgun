import { app } from 'electron';
import path from 'path';

export type DataCategory = 'config' | 'projects' | 'cache' | 'logs' | 'plugins' | 'secrets';

export class PathResolver {
    public static getAppDataPath(): string {
        // Returns the path to the application data directory
        // Windows: %APPDATA%/Railgun
        // macOS: ~/Library/Application Support/Railgun
        // Linux: ~/.config/Railgun
        return app.getPath('userData');
    }

    public static getCategoryPath(category: DataCategory): string {
        const base = this.getAppDataPath();

        switch (category) {
            case 'config':
                return path.join(base, 'config.json');
            case 'secrets':
                return path.join(base, 'secrets.json');
            case 'projects':
                return path.join(base, 'projects');
            case 'cache':
                return path.join(base, 'cache');
            case 'logs':
                return path.join(base, 'logs');
            case 'plugins':
                return path.join(base, 'plugins');
            default:
                throw new Error(`Unknown data category: ${category}`);
        }
    }

    public static getLogFilePath(): string {
        const logsDir = this.getCategoryPath('logs');
        const date = new Date().toISOString().split('T')[0];
        return path.join(logsDir, `railgun-${date}.log`);
    }
}
