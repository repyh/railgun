export { };

declare global {
    interface Window {
        electronAPI: {
            saveFile: (projectPath: string, filePath: string, content: string) => Promise<boolean>;
            readFile: (projectPath: string, filePath: string) => Promise<string | null>;
            listFiles: (projectPath: string, directory: string) => Promise<string[]>;
            // Add other methods as needed, or use 'any' for now if lazy
            [key: string]: any;
        };
        // Deprecated: Remove after migrating usage
        electron: any;
    }
}
