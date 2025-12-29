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
            console.log('[BotProcess] Killing process...');
            // tree-kill might be needed for full cleanup, but process.kill is a start
            this.botProcess.kill();
            // Cleanup happens in 'close' event handler
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Returns the current status of the bot.
     */
    async getStatus(): Promise<'running' | 'stopped'> {
        return this.botProcess ? 'running' : 'stopped';
    }

    private broadcastLog(message: string, type: 'stdout' | 'stderr') {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(w => {
            // Avoid sending to splash screen if possible (though splash listens to different channel)
            w.webContents.send('bot:log', { message, type, timestamp: Date.now() });
        });
    }

    private broadcastStatus(status: 'running' | 'stopped') {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(w => {
            w.webContents.send('bot:status', status);
        });
    }
}
