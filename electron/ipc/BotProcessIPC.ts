import { BaseIPC } from './BaseIPC';
import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import { StorageProvider } from '../storage/StorageProvider';

export class BotProcessIPC extends BaseIPC {
    private botProcess: ChildProcess | null = null;
    private provider: StorageProvider;

    constructor() {
        super();
        this.provider = new StorageProvider();
        app.on('before-quit', () => {
            if (this.botProcess) {
                console.log('[BotProcess] App quitting, killing bot process...');
                this.botProcess.kill();
            }
        });
    }

    getName(): string {
        return 'bot';
    }

    /**
     * Starts the bot process for the given project.
     * @param projectPath The root directory of the bot project.
     * @param envVariables Optional environment variables to inject (e.g., TOKEN).
     */
    async start(projectPath: string, envVariables: Record<string, string> = {}): Promise<{ success: boolean; error?: string }> {
        if (this.botProcess) {
            return { success: false, error: 'Bot is already running.' };
        }

        try {
            await this.clearLogs();
            console.log(`[BotProcess] Starting bot at: ${projectPath}`);

            let secrets: Record<string, string> = {};
            const secretsJson = await this.provider.read('secrets', 'secrets.json');
            if (secretsJson) {
                try {
                    secrets = JSON.parse(secretsJson);
                } catch (e) {
                    console.error('[BotProcess] Failed to parse secrets.json');
                }
            }

            if (!secrets.DISCORD_TOKEN) {
                return { success: false, error: 'DISCORD_TOKEN not found in configuration.' };
            }

            const allowedKeys = [
                'PATH', 'Path', 'SYSTEMROOT', 'SystemRoot',
                'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA',
                'NODE_ENV', 'TERM', 'LANG'
            ];

            const sanitizedEnv: Record<string, string> = {};
            for (const key of allowedKeys) {
                if (process.env[key]) {
                    sanitizedEnv[key] = process.env[key] as string;
                }
            }

            const env = {
                ...sanitizedEnv,
                ...secrets,     // Injects DISCORD_TOKEN
                ...envVariables, // Injects user overrides
                FORCE_COLOR: '1',
                RAILGUN_PROJECT_PATH: projectPath
            };

            this.botProcess = spawn('node', ['.'], {
                cwd: projectPath,
                env,
                shell: true
            });

            this.botProcess.stdout?.on('data', (data) => {
                this.broadcastLog(data.toString(), 'stdout');
            });

            this.botProcess.stderr?.on('data', (data) => {
                this.broadcastLog(data.toString(), 'stderr');
            });

            this.botProcess.on('close', (code) => {
                console.log(`[BotProcess] Exited with code ${code}`);
                this.broadcastStatus('stopped');
                this.botProcess = null;
            });

            this.botProcess.on('error', (err) => {
                console.error('[BotProcess] Failed to start:', err);
                this.broadcastLog(`Failed to start: ${err.message}`, 'stderr');
                this.broadcastStatus('stopped');
                this.botProcess = null;
            });

            this.broadcastStatus('running');
            return { success: true };

        } catch (error: any) {
            console.error('[BotProcess] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stops the currently running bot process.
     */
    async stop(): Promise<{ success: boolean; error?: string }> {
        if (!this.botProcess) {
            return { success: false, error: 'No bot is running.' };
        }

        try {
            console.log(`[BotProcess] Stopping bot process (PID: ${this.botProcess.pid})...`);

            if (process.platform === 'win32') {
                // On Windows, killing the shell process tree is more reliable with taskkill
                spawn('taskkill', ['/pid', this.botProcess.pid!.toString(), '/f', '/t']);
            } else {
                this.botProcess.kill();
            }

            // Note: The botProcess will be set to null in the 'close' event handler
            return { success: true };
        } catch (error: any) {
            console.error('[BotProcess] Stop error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Returns the current status of the bot.
     */
    async getStatus(): Promise<'running' | 'stopped'> {
        return this.botProcess ? 'running' : 'stopped';
    }

    private logBuffer: { message: string; type: 'stdout' | 'stderr'; timestamp: number }[] = [];
    private MAX_LOG_BUFFER = 1000;

    private broadcastLog(message: string, type: 'stdout' | 'stderr') {
        const logEntry = { message, type, timestamp: Date.now() };
        this.logBuffer.push(logEntry);

        // Keep buffer within limits
        if (this.logBuffer.length > this.MAX_LOG_BUFFER) {
            this.logBuffer.shift();
        }

        const wins = BrowserWindow.getAllWindows();
        wins.forEach(w => {
            w.webContents.send('bot:log', logEntry);
        });
    }

    /**
     * Returns the buffered logs.
     */
    async getLogs(): Promise<{ message: string; type: 'stdout' | 'stderr'; timestamp: number }[]> {
        return this.logBuffer;
    }

    /**
     * Clears the log buffer (usually on start).
     */
    async clearLogs(): Promise<void> {
        this.logBuffer = [];
    }

    private broadcastStatus(status: 'running' | 'stopped') {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(w => {
            w.webContents.send('bot:status', status);
        });
    }
}
