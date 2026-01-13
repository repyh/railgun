import { useState, useEffect, useRef } from 'react';
import { DynamicViewRegistry } from '@/lib/plugins/DynamicViewRegistry';
import { BridgeAPI } from '@/lib/plugins/BridgeAPI';
import { useProject } from '@/contexts/ProjectContext';

interface PluginViewHostProps {
    viewId: string;
    setStatus: (status: string) => void;
}

/**
 * PluginViewHost acts as the 'Single Div' container for plugin UI.
 * It handles the lifecycle of the plugin's mount function.
 */
export const PluginViewHost = ({ viewId, setStatus }: PluginViewHostProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const { projectPath } = useProject();

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
            if (!projectPath) {
                setError("No project active. Please open or create a project first.");
                return;
            }

            setError(null);

            try {
                // Professor's Note: Creating a fresh bridge instance for this view's lifecycle.
                const bridge = BridgeAPI.create(projectPath, setStatus);
                const cleanup = view.mounter(containerRef.current, bridge);
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
    }, [viewId, projectPath, setStatus]);

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
