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
        // Load settings from localStorage on mount and merge with current defaults
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const registryDefaults = SettingsRegistry.getDefaults();

                // Deep merge strategy:
                // 1. Core Defaults
                // 2. Registry Defaults (Dynamic)
                // 3. Stored User Settings (Persistence)
                setSettings(prev => ({
                    ...prev,
                    ...registryDefaults,
                    ...parsed,
                    // Ensure defined sections are merged shallowly if they exist in both
                    general: { ...prev.general, ...registryDefaults.general, ...(parsed.general || {}) },
                    editor: { ...prev.editor, ...registryDefaults.editor, ...(parsed.editor || {}) },
                    system: { ...prev.system, ...registryDefaults.system, ...(parsed.system || {}) },
                    rpc: { ...prev.rpc, ...registryDefaults.rpc, ...(parsed.rpc || {}) }
                }));
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        }
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const resetSettings = () => {
        const defaults = {
            ...DEFAULT_SETTINGS,
            ...SettingsRegistry.getDefaults()
        };
        setSettings(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
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
