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

    const startBot = useCallback(async (customEnv?: Record<string, string>): Promise<{
        success: boolean;
        error?: string;
        missingSecrets?: boolean;
    }> => {
        if (!projectPath || !isElectron) return { success: false, error: 'Not initialized' };

        try {
            // We no longer pass secrets from the frontend to avoid exposing them over IPC.
            // The backend (BotProcessIPC) now securely reads them from encrypted storage.
            const result = await bot.start(projectPath, customEnv);

            if (result.success) {
                if (setStatus) setStatus('Bot Started');
                return { success: true };
            } else {
                return {
                    success: false,
                    error: result.error,
                    missingSecrets: result.missingSecrets
                };
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
