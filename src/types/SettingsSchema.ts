export interface SettingsSchema {
    general: {
        theme: 'dark' | 'light';
        locale: string;
    };
    editor: {
        snapToGrid: boolean;
        gridSize: number;
        minimap: boolean;
        showGrid: boolean;
    };
    system: {
        autoSave: boolean;
        autoSaveDelay: number;
        discordRPC: boolean;
    };
    rpc: { // Specific RPC config
        enabled: boolean;
        showProjectName: boolean;
        showElapsedTime: boolean;
        showCurrentFile: boolean; // New setting
        privacyMode: boolean; // Hides specific details
    };
    [key: string]: any; // Allow dynamic plugin settings
}

export const DEFAULT_SETTINGS: SettingsSchema = {
    general: {
        theme: 'dark',
        locale: 'en',
    },
    editor: {
        snapToGrid: true,
        gridSize: 20,
        minimap: true,
        showGrid: true,
    },
    system: {
        autoSave: true,
        autoSaveDelay: 1000,
        discordRPC: true,
    },
    rpc: {
        enabled: true,
        showProjectName: true,
        showElapsedTime: true,
        showCurrentFile: true,
        privacyMode: false,
    }
};
