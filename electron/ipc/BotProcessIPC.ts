import { BaseIPC } from './BaseIPC';
import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow, app } from 'electron';
import * as path from 'path';

export class BotProcessIPC extends BaseIPC {
    private botProcess: ChildProcess | null = null;

    constructor() {
        super();
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
            const entryPoint = path.join(projectPath, 'index.js'); // Assuming index.js is the entry

            // Merge current env with provided secrets
            const env = { ...process.env, ...envVariables, FORCE_COLOR: '1' };

            // Spawn the process
            // We use 'node' command. Ensure node is in PATH or bundle it? 
            // For dev tool usage, we assume user has Node. 
            // In v1.0, we might need a bundled node or similar.
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
