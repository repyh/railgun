import { ipcMain } from 'electron';

/**
 * Abstract base class for IPC modules.
 * Automatically bundles and registers methods to `ipcMain` channels 
 * based on the class name (namespace) and method name.
 */
export abstract class BaseIPC {
    /**
     * Returns the namespace for this IPC module.
     * e.g., 'system' -> 'system:methodName'
     */
    abstract getName(): string;

    /**
     * Registers all public methods of the class as IPC handlers.
     * Methods starting with '_' or 'constructor' are ignored.
     */
    public register(): void {
        const name = this.getName();
        const prototype = Object.getPrototypeOf(this);
        const propertyNames = Object.getOwnPropertyNames(prototype);

        propertyNames.forEach((methodName) => {
            if (
                methodName === 'constructor' ||
                methodName === 'getName' ||
                methodName === 'register' ||
                methodName.startsWith('_')
            ) {
                return;
            }

            const channel = `${name}:${methodName}`;
            const method = (this as any)[methodName];

            if (typeof method === 'function') {
                console.log(`[IPC] Registering handler: ${channel}`);
                ipcMain.handle(channel, async (event, ...args) => {
                    try {
                        return await method.apply(this, args);
                    } catch (error) {
                        console.error(`[IPC] Error in ${channel}:`, error);
                        throw error;
                    }
                });
            }
        });
    }
}
