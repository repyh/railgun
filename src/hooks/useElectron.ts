import { useCallback } from 'react';

export interface ElectronAPI {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, func: (...args: any[]) => void) => void;
    off: (channel: string, func: (...args: any[]) => void) => void;
    // Add other methods if they exist on your window.electronAPI
    readPackageJson?: (path: string) => Promise<any>;
    installPackage?: (path: string, name: string, isDev?: boolean) => Promise<void>;
    uninstallPackage?: (path: string, name: string) => Promise<void>;
    readFile?: (path: string, file: string) => Promise<string>;
    saveFile?: (path: string, file: string, content: string) => Promise<boolean>;
}



export function useElectron() {
    const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

    const invoke = useCallback(async (channel: string, ...args: any[]) => {
        if (!isElectron) {
            console.warn(`[Mock IPC] invoke: ${channel}`, args);
            return null;
        }
        return window.electronAPI!.invoke(channel, ...args);
    }, [isElectron]);

    /* Window Controls */
    const minimizeWindow = useCallback(() => invoke('titlebar:minimizeWindow'), [invoke]);
    const toggleMaximizeWindow = useCallback(() => invoke('titlebar:toggleMaximizeWindow'), [invoke]);
    const closeWindow = useCallback(() => invoke('titlebar:closeWindow'), [invoke]);

    /* System */
    const openExternalLink = useCallback((url: string) => invoke('titlebar:openExternalLink', url), [invoke]);
    const getAppVersion = useCallback(() => invoke('system:getAppVersion'), [invoke]);

    /* Project/FS (Wrappers for existing direct calls if needed later) */
    const readPackageJson = useCallback((path: string) => {
        if (!isElectron || !window.electronAPI?.readPackageJson) return Promise.reject("Not Electron");
        return window.electronAPI.readPackageJson(path);
    }, [isElectron]);

    const installPackage = useCallback((path: string, name: string, dev: boolean) => {
        if (!isElectron || !window.electronAPI?.installPackage) return Promise.reject("Not Electron");
        return window.electronAPI.installPackage(path, name, dev);
    }, [isElectron]);

    const uninstallPackage = useCallback((path: string, name: string) => {
        if (!isElectron || !window.electronAPI?.uninstallPackage) return Promise.reject("Not Electron");
        return window.electronAPI.uninstallPackage(path, name);
    }, [isElectron]);

    return {
        isElectron,
        invoke,
        window: {
            minimize: minimizeWindow,
            toggleMaximize: toggleMaximizeWindow,
            close: closeWindow
        },
        system: {
            openExternalLink,
            getAppVersion
        },
        packages: {
            readPackageJson,
            installPackage,
            uninstallPackage
        }
    };
}
