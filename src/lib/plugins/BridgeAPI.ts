import type { RailgunBridge } from './interfaces';

/**
 * BridgeAPI creates a secure, scoped bridge between the Railgun app
 * and the plugin environment.
 */
export class BridgeAPI {
    /**
     * Creates a bridge instance for a specific workspace.
     * @param projectPath The absolute path to the project root.
     * @param setStatus Callback to update the application status bar.
     */
    static create(projectPath: string, setStatus: (status: string) => void): RailgunBridge {
        // @ts-ignore - window.electronAPI is defined in vite-env.d.ts
        const electron = window.electronAPI;

        const validatePath = (path: string) => {
            if (path.includes('../') || path.includes('..\\') || path.startsWith('..')) {
                throw new Error(`[Security Violation] Access denied to path: ${path}. Plugins are restricted to the project workspace.`);
            }
        };

        return {
            workspace: {
                projectPath,
                async readFile(path: string): Promise<string> {
                    validatePath(path);
                    const content = await electron.readFile(projectPath, path);
                    return content || '';
                },

                async writeFile(path: string, content: string): Promise<void> {
                    validatePath(path);
                    const success = await electron.saveFile(projectPath, path, content);
                    if (!success) {
                        throw new Error(`Failed to write file: ${path}`);
                    }
                },

                async listFiles(dir: string = ''): Promise<string[]> {
                    validatePath(dir);
                    return await electron.listFiles(projectPath, dir);
                }
            },

            compiler: {
                async build(): Promise<{ success: boolean; message: string }> {
                    setStatus('Building Project...');
                    try {
                        const result = await electron.invoke('bot:build', { projectPath });
                        if (result.success) {
                            setStatus('Build Successful');
                        } else {
                            setStatus('Build Failed');
                        }
                        return result;
                    } catch (err) {
                        setStatus('Build Error');
                        return { success: false, message: String(err) };
                    }
                },

                getLatestBuildLog(): string[] {
                    return [];
                }
            },

            terminal: {
                write(data: string): void {
                    electron.invoke('terminal:input', data);
                },

                writeLine(data: string): void {
                    electron.invoke('terminal:input', data + '\n');
                },

                execute(command: string): void {
                    setStatus(`Executing: ${command}`);
                    electron.invoke('terminal:execute', { command, cwd: projectPath });
                }
            },

            ui: {
                showNotification(type: 'info' | 'warn' | 'error', message: string): void {
                    // Pass to main process for native notifications or app-level toast
                    electron.invoke('ui:notification', { type, message });
                    console.log(`[Plugin ${type}] ${message}`);
                },

                setStatusBar(text: string): void {
                    setStatus(text);
                }
            }
        };
    }
}
