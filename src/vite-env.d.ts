/// <reference types="vite/client" />

interface ElectronAPI {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    minimizeWindow: () => Promise<void>;
    toggleMaximizeWindow: () => Promise<void>;
    closeWindow: () => Promise<void>;
    selectDirectory: () => Promise<string | null>;
    createProject: (data: any) => Promise<{ success: boolean; message?: string }>;
    openProject: () => Promise<{ canceled: boolean; path?: string; name?: string; error?: string }>;
    installDependencies: (projectPath: string, runtime: 'nodejs' | 'bun') => Promise<void>;
    readPackageJson: (projectPath: string) => Promise<any>;
    installPackage: (projectPath: string, packageName: string, dev: boolean) => Promise<void>;
    uninstallPackage: (projectPath: string, packageName: string) => Promise<void>;
    readProjectConfig: (projectPath: string) => Promise<any>;
    saveProjectConfig: (projectPath: string, config: any) => Promise<boolean>;
    saveFile: (projectPath: string, filePath: string, content: string) => Promise<boolean>;
    onTerminalData: (callback: (data: string) => void) => () => void;
    installPlugin: (projectPath: string, pluginId: string) => Promise<{ success: boolean; message?: string }>;
    uninstallPlugin: (projectPath: string, pluginId: string) => Promise<{ success: boolean; message?: string }>;
    listInstalledPlugins: (projectPath: string) => Promise<string[]>;
}

interface Window {
    electronAPI: ElectronAPI;
}
