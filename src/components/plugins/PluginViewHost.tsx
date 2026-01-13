import { useState, useEffect, useRef } from 'react';
import { DynamicViewRegistry } from '@/lib/plugins/DynamicViewRegistry';
import type { RailgunBridge } from '@/lib/plugins/interfaces';

interface PluginViewHostProps {
    viewId: string;
}

/**
 * PluginViewHost acts as the 'Single Div' container for plugin UI.
 * It handles the lifecycle of the plugin's mount function.
 */
export const PluginViewHost = ({ viewId }: PluginViewHostProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const view = DynamicViewRegistry.getView(viewId);
        if (!view) {
            setError(`View '${viewId}' not found.`);
            return;
        }

        if (!view.mounter) {
            setError(`View '${viewId}' is registered but has no mount function.`);
            return;
        }

        if (containerRef.current) {
            setError(null);
            // Stub API for now - will be replaced in Phase 4
            const stubAPI: RailgunBridge = {
                workspace: {
                    projectPath: '',
                    readFile: async () => '',
                    writeFile: async () => { },
                    listFiles: async () => []
                },
                compiler: {
                    build: async () => ({ success: true, message: 'Stub' }),
                    getLatestBuildLog: () => []
                },
                terminal: {
                    write: () => { },
                    writeLine: () => { },
                    execute: () => { }
                },
                ui: {
                    showNotification: () => { },
                    setStatusBar: () => { }
                }
            };

            try {
                const cleanup = view.mounter(containerRef.current, stubAPI);
                return () => {
                    if (typeof cleanup === 'function') {
                        cleanup();
                    }
                    if (containerRef.current) {
                        containerRef.current.innerHTML = '';
                    }
                };
            } catch (err) {
                console.error(`[PluginViewHost] Error mounting ${viewId}:`, err);
                setError(`Mount Error: ${String(err)}`);
            }
        }
    }, [viewId]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 p-8">
                <div className="text-sm font-mono bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20">
                    {error}
                </div>
                <p className="text-xs">Ensure the plugin has properly called registerView().</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden plugin-view-container"
            id={`plugin-view-${viewId.replace(/\./g, '-')}`}
        />
    );
};
