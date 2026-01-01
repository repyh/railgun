import { create } from 'zustand';
import { useElectron } from '../hooks/useElectron';

type RuntimeStatus = {
    type: 'node' | 'bun';
    status: 'installed' | 'missing' | 'outdated' | 'unknown';
    version?: string;
    path?: string;
    message?: string;
};

interface RuntimeState {
    nodeStatus: RuntimeStatus | null;
    bunStatus: RuntimeStatus | null;
    isChecking: boolean;
    isInstalling: boolean;

    checkRuntimes: () => Promise<void>;
    installBun: () => Promise<void>;
}

export const useRuntimeStore = create<RuntimeState>((set, get) => ({
    nodeStatus: null,
    bunStatus: null,
    isChecking: false,
    isInstalling: false,

    checkRuntimes: async () => {
        // Access electron via global window object or hook helper logic if possible outside hook component
        // Since store is outside react component, we rely on window.electronAPI
        const api = window.electronAPI;
        if (!api) return;

        set({ isChecking: true });
        try {
            const { node, bun } = await api.checkRuntime();
            set({ nodeStatus: node, bunStatus: bun });
        } catch (error) {
            console.error('Failed to check runtimes:', error);
        } finally {
            set({ isChecking: false });
        }
    },

    installBun: async () => {
        const api = window.electronAPI;
        if (!api) return;

        set({ isInstalling: true });
        try {
            await api.installBun();
            // Re-check after install attempt
            await get().checkRuntimes();
        } catch (error) {
            console.error('Failed to install Bun:', error);
        } finally {
            set({ isInstalling: false });
        }
    }
}));
