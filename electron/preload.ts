import { contextBridge, ipcRenderer } from 'electron';

const api = {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

    /**
     * Listen for terminal data output.
     */
    onTermData: (callback: (data: string) => void) => {
        const handler = (_: any, data: string) => callback(data);
        ipcRenderer.on('terminal:data', handler);
        return () => ipcRenderer.removeListener('terminal:data', handler);
    },

    /**
    * Listen for bot execution status changes
    */
    onBotStatus: (callback: (status: 'running' | 'stopped') => void) => {
        const handler = (_: any, status: 'running' | 'stopped') => callback(status);
        ipcRenderer.on('bot:status', handler);
        return () => ipcRenderer.removeListener('bot:status', handler);
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
