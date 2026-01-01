import { contextBridge, ipcRenderer } from 'electron';

const api = {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, func: (...args: any[]) => void) => {
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
    },
    off: (channel: string, func: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, (_event, ...args) => func(...args));
    },

    // Window
    minimizeWindow: () => ipcRenderer.invoke('titlebar:minimizeWindow'),
    toggleMaximizeWindow: () => ipcRenderer.invoke('titlebar:toggleMaximizeWindow'),
    closeWindow: () => ipcRenderer.invoke('titlebar:closeWindow'),

    // System
    selectDirectory: () => ipcRenderer.invoke('system:selectDirectory'),
    getAppVersion: () => ipcRenderer.invoke('system:getAppVersion'),
    getNodeVersion: () => ipcRenderer.invoke('system:getNodeVersion'),
    openExternalLink: (url: string) => ipcRenderer.invoke('system:openExternalLink', url),

    // Runtime
    checkRuntime: () => ipcRenderer.invoke('runtime:checkAll'),
    installBun: () => ipcRenderer.invoke('runtime:installBun'),

    // Dependencies
    readPackageJson: (path: string) => ipcRenderer.invoke('dependencies:readPackageJson', path),
    installPackage: (path: string, name: string, dev: boolean) => ipcRenderer.invoke('dependencies:install', path, name, dev),
    uninstallPackage: (path: string, name: string) => ipcRenderer.invoke('dependencies:uninstall', path, name),
    installDependencies: (path: string, type: string) => ipcRenderer.invoke('dependencies:installAll', path, type),

    // Files
    readFile: (path: string, file: string) => ipcRenderer.invoke('fs:read', path, file),
    saveFile: (path: string, file: string, content: string) => ipcRenderer.invoke('fs:write', path, file, content),
    deleteFile: (path: string, file: string) => ipcRenderer.invoke('fs:delete', path, file),
    listFiles: (path: string, dir: string) => ipcRenderer.invoke('fs:list', path, dir),

    // Config
    readProjectConfig: (path: string) => ipcRenderer.invoke('project:readProjectConfig', path),
    saveProjectConfig: (path: string, config: any) => ipcRenderer.invoke('project:saveProjectConfig', path, config),

    // Plugins
    listInstalledPlugins: (path: string) => ipcRenderer.invoke('plugins:list', path),
    installPlugin: (path: string, id: string) => ipcRenderer.invoke('plugins:install', path, id),
    uninstallPlugin: (path: string, id: string) => ipcRenderer.invoke('plugins:uninstall', path, id),

    // Terminal / Bot
    onTermData: (callback: (data: string) => void) => {
        const handler = (_: any, data: string) => callback(data);
        ipcRenderer.on('terminal:data', handler);
        return () => ipcRenderer.removeListener('terminal:data', handler);
    },
    onBotStatus: (callback: (status: 'running' | 'stopped') => void) => {
        const handler = (_: any, status: 'running' | 'stopped') => callback(status);
        ipcRenderer.on('bot:status', handler);
        return () => ipcRenderer.removeListener('bot:status', handler);
        ipcRenderer.on('bot:status', handler);
        return () => ipcRenderer.removeListener('bot:status', handler);
    },
    onBotLog: (callback: (log: any) => void) => {
        const handler = (_: any, log: any) => callback(log);
        ipcRenderer.on('bot:log', handler);
        return () => ipcRenderer.removeListener('bot:log', handler);
    }
};

// Expose the API to the renderer process
// If context isolation is enabled, use contextBridge
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electronAPI', api);
    } catch (error) {
        console.error('Failed to expose electronAPI via contextBridge:', error);
    }
} else {
    // Fallback or dev mode (nodeIntegration: true)
    // @ts-ignore
    window.electronAPI = api;
}
