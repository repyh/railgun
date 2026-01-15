export { };

declare global {
    interface Window {
        electronAPI: {
            saveFile: (projectPath: string, filePath: string, content: string) => Promise<boolean>;
            readFile: (projectPath: string, filePath: string) => Promise<string | null>;
            listFiles: (projectPath: string, directory: string) => Promise<string[]>;
            readFileContent: (projectPath: string, relativePath: string) => Promise<string | null>;
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            onTermData: (callback: (data: string) => void) => () => void;
            sendSplashUpdate: (data: any) => void;
            sendAppReady: () => void;
            onBotStatus: (callback: (status: 'running' | 'stopped') => void) => () => void;
            onBotLog: (callback: (log: any) => void) => () => void;
            // Add other methods as needed, or use 'any' for now if lazy
            [key: string]: any;
        };
        // Deprecated: Remove after migrating usage
        electron: any;
    }
}
