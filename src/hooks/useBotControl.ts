import { useState, useEffect, useCallback } from 'react';
import { useElectron } from '@/hooks/useElectron';

export interface BotState {
    status: 'stopped' | 'running';
    isRunning: boolean;
}

export function useBotControl(projectPath: string | null, setStatus?: (msg: string) => void) {
    // Local State
    const [botStatus, setBotStatus] = useState<'stopped' | 'running'>('stopped');
    const { isElectron, bot } = useElectron();

    useEffect(() => {
        if (!isElectron) return;

        // Listen for status changes
        const cleanup = bot.onStatus((status) => {
            setBotStatus(status);
        });

        // Fetch initial status
        bot.getStatus().then((status: 'running' | 'stopped') => {
            setBotStatus(status);
        });

        return cleanup;
    }, [isElectron, bot]);

    const startBot = useCallback(async (secrets?: Record<string, string>) => {
        if (!projectPath || !isElectron) return;

        // If secrets not passed, try to get from storage
        let env = secrets;
        if (!env) {
            // @ts-ignore
            const storage = window.electronAPI?.storage;
            if (storage) {
                try {
                    const stored = await storage.getSecrets();
                    if (stored) {
                        env = JSON.parse(stored);
                    } else {
                        // Migration: Load from legacy localStorage
                        const legacy = localStorage.getItem('railgun_secrets');
                        if (legacy) {
                            env = JSON.parse(legacy);
                            await storage.setSecrets(legacy);
                            console.log("[useBotControl] Migrated secrets from localStorage.");
                        }
                    }
                } catch { }
            }
        }

        // Return false if secrets missing, so UI can handle (e.g., open dialog)
        if (!env || !env.DISCORD_TOKEN) {
            return { success: false, missingSecrets: true };
        }

        try {
            const result = await bot.start(projectPath, env);
            if (result.success) {
                if (setStatus) setStatus('Bot Started');
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error' };
        }
    }, [projectPath, isElectron, bot, setStatus]);

    const stopBot = useCallback(async () => {
        if (!isElectron) return;
        try {
            await bot.stop();
            if (setStatus) setStatus('Bot Stopped');
        } catch (e) {
            console.error('Failed to stop bot', e);
        }
    }, [isElectron, bot, setStatus]);

    return {
        status: botStatus,
        isRunning: botStatus === 'running',
        startBot,
        stopBot
    };
}
