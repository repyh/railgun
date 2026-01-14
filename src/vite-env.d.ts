/// <reference types="vite/client" />

interface ElectronAPI {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, func: (...args: any[]) => void) => void;
    off: (channel: string, func: (...args: any[]) => void) => void;

    // Window
    minimizeWindow: () => Promise<void>;
    toggleMaximizeWindow: () => Promise<void>;
    closeWindow: () => Promise<void>;

    // System
    selectDirectory: () => Promise<string | null>;
    getAppVersion: () => Promise<string>;
    getNodeVersion: () => Promise<string>;
    openExternalLink: (url: string) => Promise<void>;

    // Runtime
    checkRuntime: () => Promise<{ node: any, bun: any }>;
    installBun: () => Promise<boolean>;

    // Dependencies
    readPackageJson: (path: string) => Promise<any>;
    installPackage: (path: string, name: string, isDev?: boolean) => Promise<void>;
    uninstallPackage: (path: string, name: string) => Promise<void>;
    installDependencies: (path: string, type: 'nodejs' | 'bun') => Promise<void>;

    // Files
    readFile: (path: string, file: string) => Promise<string | null>;
    saveFile: (path: string, file: string, content: string) => Promise<boolean>;
    deleteFile: (path: string, file: string) => Promise<boolean>;
    listFiles: (path: string, dir: string) => Promise<string[]>;

    // Config
    readProjectConfig: (path: string) => Promise<any>;
    saveProjectConfig: (path: string, config: any) => Promise<boolean>;

    // Plugins
    listInstalledPlugins: (path: string) => Promise<string[]>;
    installPlugin: (path: string, id: string) => Promise<void>;
    uninstallPlugin: (path: string, id: string) => Promise<void>;

    // Terminal / Bot
    onTermData: (callback: (data: string) => void) => () => void;
    onBotStatus: (callback: (status: 'running' | 'stopped') => void) => () => void;
    onBotLog: (callback: (log: any) => void) => () => void;

    // Storage
    storage: {
        getConfig: () => Promise<string | null>;
        setConfig: (data: string) => Promise<boolean>;
        getSecrets: () => Promise<string | null>;
        setSecrets: (data: string) => Promise<boolean>;
        read: (category: string, key: string) => Promise<string | null>;
        write: (category: string, key: string, data: string) => Promise<boolean>;
        list: (category: string) => Promise<string[]>;
        getPath: (category: string) => Promise<string>;
        getBotConfig: (projectPath: string) => Promise<string | null>;
        setBotConfig: (projectPath: string, data: string) => Promise<boolean>;
    };
}

interface Window {
    electronAPI: ElectronAPI;
    require?: (module: string) => any;
}
