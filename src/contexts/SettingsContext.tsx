import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type SettingsSchema } from '@/types/SettingsSchema';
import { SettingsRegistry } from '@/services/SettingsRegistry';

interface SettingsContextType {
    settings: SettingsSchema;
    updateSettings: <K extends keyof SettingsSchema>(section: K, data: Partial<SettingsSchema[K]>) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'railgun-settings-v1';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initial load: Default Core + Registry Defaults
    const [settings, setSettings] = useState<SettingsSchema>(() => ({
        ...DEFAULT_SETTINGS,
        ...SettingsRegistry.getDefaults()
    }));

    useEffect(() => {
        const loadSettings = async () => {
            // @ts-ignore
            const storage = window.electronAPI?.storage;
            if (!storage) return;

            try {
                // 1. Try to load from standard config.json
                let configStr = await storage.getConfig();
                let parsed = null;

                if (configStr) {
                    parsed = JSON.parse(configStr);
                } else {
                    // 2. Migration: Try to load from legacy localStorage
                    const legacy = localStorage.getItem(STORAGE_KEY);
                    if (legacy) {
                        parsed = JSON.parse(legacy);
                        // Save to file system for future
                        await storage.setConfig(JSON.stringify(parsed, null, 2));
                        console.log("[Settings] Migrated from localStorage to file system.");
                    }
                }

                if (parsed) {
                    const registryDefaults = SettingsRegistry.getDefaults();
                    // Generate/Migrate Station ID if missing
                    if (!parsed.system?.stationId) {
                        const legacyId = localStorage.getItem('railgun_station_id');
                        const newId = legacyId || 'STN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                        parsed.system = { ...(parsed.system || {}), stationId: newId };
                        // Persist immediately if generated/migrated
                        storage.setConfig(JSON.stringify(parsed, null, 2));
                    }

                    setSettings(prev => ({
                        ...prev,
                        ...registryDefaults,
                        ...parsed,
                        general: { ...prev.general, ...registryDefaults.general, ...(parsed.general || {}) },
                        editor: { ...prev.editor, ...registryDefaults.editor, ...(parsed.editor || {}) },
                        system: { ...prev.system, ...registryDefaults.system, ...(parsed.system || {}) },
                        rpc: { ...prev.rpc, ...registryDefaults.rpc, ...(parsed.rpc || {}) }
                    }));
                } else {
                    // Fresh start: Generate stationId
                    const newId = 'STN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                    setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, stationId: newId }
                    }));
                }
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        };

        loadSettings();
    }, []);

    const updateSettings = <K extends keyof SettingsSchema>(section: K, data: Partial<SettingsSchema[K]>) => {
        setSettings(prev => {
            const next = {
                ...prev,
                [section]: {
                    ...prev[section],
                    ...data
                }
            };
            // @ts-ignore
            window.electronAPI?.storage.setConfig(JSON.stringify(next, null, 2));
            return next;
        });
    };

    const resetSettings = () => {
        const defaults = {
            ...DEFAULT_SETTINGS,
            ...SettingsRegistry.getDefaults()
        };
        setSettings(defaults);
        // @ts-ignore
        window.electronAPI?.storage.setConfig(JSON.stringify(defaults, null, 2));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
