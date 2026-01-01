import { exec } from 'child_process';
import { promisify } from 'util';
import * as semver from 'semver';

const execAsync = promisify(exec);

export type RuntimeStatus = {
    type: 'node' | 'bun';
    status: 'installed' | 'missing' | 'outdated' | 'unknown';
    version?: string;
    path?: string;
    message?: string;
};

export class RuntimeManager {
    private static instance: RuntimeManager;

    private constructor() { }

    public static getInstance(): RuntimeManager {
        if (!RuntimeManager.instance) {
            RuntimeManager.instance = new RuntimeManager();
        }
        return RuntimeManager.instance;
    }

    /**
     * Checks for Node.js installation and version
     */
    async checkNode(): Promise<RuntimeStatus> {
        try {
            const { stdout } = await execAsync('node --version');
            const version = stdout.trim(); // e.g., "v18.15.0"
            const valid = semver.valid(version);

            if (!valid) {
                return { type: 'node', status: 'unknown', message: 'Invalid version output' };
            }

            // Railgun requires at least Node 18
            if (semver.major(valid) < 18) {
                return { type: 'node', status: 'outdated', version, message: 'Node.js 18+ required' };
            }

            return { type: 'node', status: 'installed', version };
        } catch (error) {
            return { type: 'node', status: 'missing', message: 'Node.js not found in PATH' };
        }
    }

    /**
     * Checks for Bun installation and version
     */
    async checkBun(): Promise<RuntimeStatus> {
        try {
            // Try explicit path check for Windows if not in PATH
            let command = 'bun --version';
            if (process.platform === 'win32') {
                // Powershell encoding can sometimes mess up output, consider direct execution if issues arise
            }

            const { stdout } = await execAsync(command);
            const version = stdout.trim(); // e.g., "1.0.0" (Bun doesn't always prefix v)

            return { type: 'bun', status: 'installed', version: version.startsWith('v') ? version : `v${version}` };
        } catch (error) {
            return { type: 'bun', status: 'missing', message: 'Bun not found' };
        }
    }

    /**
     * Attempts to install Bun (Windows only for now via PowerShell)
     */
    async installBun(): Promise<boolean> {
        if (process.platform !== 'win32') {
            throw new Error('Auto-install currently only supported on Windows');
        }

        try {
            // Run the official install script
            await execAsync('powershell -c "irm bun.sh/install.ps1 | iex"');
            return true;
        } catch (error) {
            console.error('Failed to install Bun:', error);
            return false;
        }
    }
}
