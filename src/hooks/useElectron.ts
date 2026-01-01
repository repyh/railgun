import { useCallback, useMemo } from 'react';

export interface ElectronAPI {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, func: (...args: any[]) => void) => void;
    off: (channel: string, func: (...args: any[]) => void) => void;

    // Window
    minimizeWindow: () => Promise<void>;
    toggleMaximizeWindow: () => Promise<void>;
    closeWindow: () => Promise<void>;

    // System
    readPackageJson: (path: string) => Promise<any>;
    installPackage: (path: string, name: string, isDev?: boolean) => Promise<void>;
    uninstallPackage: (path: string, name: string) => Promise<void>;

    // Runtime
    checkRuntime: () => Promise<{ node: any, bun: any }>;
    installBun: () => Promise<boolean>;

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
    installDependencies: (path: string, type: 'nodejs' | 'bun') => Promise<void>;

    onTermData: (callback: (data: string) => void) => () => void;
    onBotStatus: (callback: (status: 'running' | 'stopped') => void) => () => void;
    onBotLog: (callback: (log: any) => void) => () => void;

    // Direct IPC
    openExternalLink: (url: string) => Promise<void>;
    getAppVersion: () => Promise<string>;
    getNodeVersion: () => Promise<string>;
    selectDirectory: () => Promise<string | null>;
}

export interface UseElectronReturn {
    isElectron: boolean;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, func: (...args: any[]) => void) => void;
    off: (channel: string, func: (...args: any[]) => void) => void;
    window: {
        minimize: () => void;
        toggleMaximize: () => void;
        close: () => void;
        selectDirectory: () => Promise<string | null>;
    };
    system: {
        getAppVersion: () => Promise<string>;
        getNodeVersion: () => Promise<string>;
        openExternalLink: (url: string) => Promise<void>;
    };
    packages: {
        readPackageJson: (path: string) => Promise<any>;
        installPackage: (path: string, name: string, dev: boolean) => Promise<void>;
        uninstallPackage: (path: string, name: string) => Promise<void>;
    };
    runtime: {
        check: () => Promise<{ node: any, bun: any }>;
        installBun: () => Promise<boolean>;
    };
    files: {
        list: (path: string, dir: string) => Promise<string[]>;
        read: (path: string, file: string) => Promise<string | null>;
        save: (path: string, file: string, content: string) => Promise<boolean>;
        delete: (path: string, file: string) => Promise<boolean>;
    };
    config: {
        read: (path: string) => Promise<any>;
        save: (path: string, config: any) => Promise<boolean>;
    };
    plugins: {
        list: (path: string) => Promise<string[]>;
        install: (path: string, id: string) => Promise<void>;
        uninstall: (path: string, id: string) => Promise<void>;
    };
    terminal: {
        installDependencies: (path: string, type: 'nodejs' | 'bun') => Promise<void>;
        onData: (callback: (data: string) => void) => () => void;
    };
    bot: {
        start: (path: string, env: any) => Promise<any>;
        stop: () => Promise<any>;
        getStatus: () => Promise<any>;
        getLogs: () => Promise<any>;
        clearLogs: () => Promise<any>;
        onStatus: (callback: (status: 'running' | 'stopped') => void) => () => void;
        onLog: (callback: (log: any) => void) => () => void;
    };
    project: {
        getRecent: () => Promise<any>;
        open: () => Promise<any>;
        create: (data: any) => Promise<any>;
        verify: (path: string) => Promise<any>;
        removeFromHistory: (path: string) => Promise<any>;
    };
}

export function useElectron(): UseElectronReturn {
    const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

    const invoke = useCallback(async (channel: string, ...args: any[]) => {
        if (!isElectron) {
            console.warn(`[Mock IPC] invoke: ${channel}`, args);
            return null;
        }
        return window.electronAPI!.invoke(channel, ...args);
    }, [isElectron]);

    const on = useCallback((channel: string, func: (...args: any[]) => void) => {
        if (!isElectron) return;
        window.electronAPI!.on(channel, func);
    }, [isElectron]);

    const off = useCallback((channel: string, func: (...args: any[]) => void) => {
        if (!isElectron) return;
        window.electronAPI!.off(channel, func);
    }, [isElectron]);

    /* Window Controls */
    const minimizeWindow = useCallback(() => { invoke('titlebar:minimizeWindow'); }, [invoke]);
    const toggleMaximizeWindow = useCallback(() => { invoke('titlebar:toggleMaximizeWindow'); }, [invoke]);
    const closeWindow = useCallback(() => { invoke('titlebar:closeWindow'); }, [invoke]);

    /* System */
    const openExternalLink = useCallback((url: string) => invoke('system:openExternalLink', url), [invoke]);
    const getAppVersion = useCallback(() => invoke('system:getAppVersion'), [invoke]);
    const getNodeVersion = useCallback(() => invoke('system:getNodeVersion'), [invoke]);
    const selectDirectory = useCallback(() => invoke('system:selectDirectory'), [invoke]);

    /* Packages */
    const readPackageJson = useCallback((path: string) => {
        if (!isElectron) return Promise.reject("Not Electron");
        return window.electronAPI!.readPackageJson(path);
    }, [isElectron]);

    const installPackage = useCallback((path: string, name: string, dev: boolean) => {
        if (!isElectron) return Promise.reject("Not Electron");
        return window.electronAPI!.installPackage(path, name, dev);
    }, [isElectron]);

    const uninstallPackage = useCallback((path: string, name: string) => {
        if (!isElectron) return Promise.reject("Not Electron");
        return window.electronAPI!.uninstallPackage(path, name);
    }, [isElectron]);

    /* Runtime */
    const checkRuntime = useCallback(() => {
        if (!isElectron) return Promise.resolve({ node: { status: 'unknown' }, bun: { status: 'unknown' } });
        return window.electronAPI!.checkRuntime();
    }, [isElectron]);

    const installBun = useCallback(() => {
        if (!isElectron) return Promise.resolve(false);
        return window.electronAPI!.installBun();
    }, [isElectron]);

    /* Files */
    const listFiles = useCallback((path: string, dir: string) => {
        if (!isElectron) return Promise.resolve([]);
        return window.electronAPI!.listFiles(path, dir);
    }, [isElectron]);

    const readFile = useCallback((path: string, file: string) => {
        if (!isElectron) return Promise.resolve(null);
        return window.electronAPI!.readFile(path, file);
    }, [isElectron]);

    const saveFile = useCallback((path: string, file: string, content: string) => {
        if (!isElectron) return Promise.resolve(false);
        return window.electronAPI!.saveFile(path, file, content);
    }, [isElectron]);

    const deleteFile = useCallback((path: string, file: string) => {
        if (!isElectron) return Promise.resolve(false);
        return window.electronAPI!.deleteFile(path, file);
    }, [isElectron]);

    /* Config */
    const readProjectConfig = useCallback((path: string) => {
        if (!isElectron) return Promise.resolve(null);
        return window.electronAPI!.readProjectConfig(path);
    }, [isElectron]);

    const saveProjectConfig = useCallback((path: string, config: any) => {
        if (!isElectron) return Promise.resolve(false);
        return window.electronAPI!.saveProjectConfig(path, config);
    }, [isElectron]);

    /* Plugins */
    const listInstalledPlugins = useCallback((path: string) => {
        if (!isElectron) return Promise.resolve([]);
        return window.electronAPI!.listInstalledPlugins(path);
    }, [isElectron]);

    const installPlugin = useCallback((path: string, id: string) => {
        if (!isElectron) return Promise.resolve();
        return window.electronAPI!.installPlugin(path, id);
    }, [isElectron]);

    const uninstallPlugin = useCallback((path: string, id: string) => {
        if (!isElectron) return Promise.resolve();
        return window.electronAPI!.uninstallPlugin(path, id);
    }, [isElectron]);

    /* Terminal & Bot */
    const installDependencies = useCallback((path: string, type: 'nodejs' | 'bun') => {
        if (!isElectron) return Promise.resolve();
        return window.electronAPI!.installDependencies(path, type);
    }, [isElectron]);

    const onTerminalData = useCallback((callback: (data: string) => void) => {
        if (!isElectron) return () => { };
        return window.electronAPI!.onTermData(callback);
    }, [isElectron]);

    const onBotStatus = useCallback((callback: (status: 'running' | 'stopped') => void) => {
        if (!isElectron) return () => { };
        return window.electronAPI!.onBotStatus(callback);
    }, [isElectron]);

    const onBotLog = useCallback((callback: (log: any) => void) => {
        if (!isElectron) return () => { };
        return window.electronAPI!.onBotLog(callback);
    }, [isElectron]);

    return useMemo(() => ({
        isElectron,
        invoke,
        on,
        off,
        window: {
            minimize: minimizeWindow,
            toggleMaximize: toggleMaximizeWindow,
            close: closeWindow,
            selectDirectory
        },
        system: {
            getAppVersion,
            getNodeVersion,
            openExternalLink
        },
        packages: {
            readPackageJson,
            installPackage,
            uninstallPackage
        },
        runtime: {
            check: checkRuntime,
            installBun
        },
        files: {
            list: listFiles,
            read: readFile,
            save: saveFile,
            delete: deleteFile
        },
        config: {
            read: readProjectConfig,
            save: saveProjectConfig
        },
        plugins: {
            list: listInstalledPlugins,
            install: installPlugin,
            uninstall: uninstallPlugin
        },
        terminal: {
            installDependencies,
            onData: onTerminalData
        },
        bot: {
            start: (path: string, env: any) => invoke('bot:start', path, env),
            stop: () => invoke('bot:stop'),
            getStatus: () => invoke('bot:getStatus'),
            getLogs: () => invoke('bot:getLogs'),
            clearLogs: () => invoke('bot:clearLogs'),
            onStatus: onBotStatus,
            onLog: onBotLog
        },
        project: {
            getRecent: () => invoke('project:getRecentProjects'),
            open: () => invoke('project:openProject'),
            create: (data: any) => invoke('project:createProject', data),
            verify: (path: string) => invoke('project:verifyProject', path),
            removeFromHistory: (path: string) => invoke('project:removeProjectFromHistory', path)
        }
    }), [
        isElectron, invoke, on, off, minimizeWindow, toggleMaximizeWindow, closeWindow, selectDirectory,
        getAppVersion, getNodeVersion, openExternalLink,
        readPackageJson, installPackage, uninstallPackage,
        listFiles, readFile, saveFile, deleteFile,
        readProjectConfig, saveProjectConfig,
        listInstalledPlugins, installPlugin, uninstallPlugin,
        installDependencies, onTerminalData, onBotStatus, onBotLog
    ]);
}
