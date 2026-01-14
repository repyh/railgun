import { useState, useEffect, useCallback } from 'react';
import { type BotConfig, DEFAULT_BOT_CONFIG } from '@/types/BotConfig';

interface UseBotConfigResult {
    config: BotConfig;
    loading: boolean;
    error: string | null;
    updateConfig: (updates: Partial<BotConfig>) => Promise<void>;
    reloadConfig: () => Promise<void>;
}

export const useBotConfig = (projectPath: string | null): UseBotConfigResult => {
    const [config, setConfig] = useState<BotConfig>(DEFAULT_BOT_CONFIG);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadConfig = useCallback(async () => {
        if (!projectPath) return;

        setLoading(true);
        setError(null);
        try {
            const data = await window.electronAPI.storage.getBotConfig(projectPath);
            if (data) {
                const parsed = JSON.parse(data);
                setConfig({ ...DEFAULT_BOT_CONFIG, ...parsed });
            } else {
                // Config doesn't exist yet, save default
                await window.electronAPI.storage.setBotConfig(projectPath, JSON.stringify(DEFAULT_BOT_CONFIG, null, 2));
                setConfig(DEFAULT_BOT_CONFIG);
            }
        } catch (err) {
            console.error('Failed to load bot config:', err);
            setError('Failed to load bot configuration.');
        } finally {
            setLoading(false);
        }
    }, [projectPath]);

    useEffect(() => {
        if (projectPath) {
            loadConfig();
        }
    }, [projectPath, loadConfig]);

    const updateConfig = async (updates: Partial<BotConfig>) => {
        if (!projectPath) return;

        try {
            const next = { ...config, ...updates };
            await window.electronAPI.storage.setBotConfig(projectPath, JSON.stringify(next, null, 2));
            setConfig(next);
        } catch (err) {
            console.error('Failed to save bot config:', err);
            throw new Error('Failed to save configuration.');
        }
    };

    return {
        config,
        loading,
        error,
        updateConfig,
        reloadConfig: loadConfig
    };
};
