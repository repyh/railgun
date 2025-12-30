import React, { useEffect, useState } from 'react';
import { PluginManager } from '@/lib/plugins/PluginManager';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Check } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

export const PluginsTab: React.FC = () => {
    const { projectPath } = useProject();

    const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);
    const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        refresh();
    }, [projectPath]);

    const refresh = async () => {
        if (!projectPath) return;
        setLoading(true);
        try {
            // Get Available (Sync fs read in Renderer)
            const available = PluginManager.getAvailablePlugins();
            setAvailablePlugins(available);

            // Get Installed (Async IPC)
            if (window.electronAPI) {
                const installed = await window.electronAPI.listInstalledPlugins(projectPath);
                setInstalledPlugins(installed);
            }
        } catch (e) {
            console.error("Failed to refresh plugins", e);
        }
        setLoading(false);
    };

    const handleInstall = async (pluginId: string) => {
        if (!projectPath || !window.electronAPI) return;
        setLoading(true);
        try {
            const res = await window.electronAPI.installPlugin(projectPath, pluginId);
            if (res.success) {
                await PluginManager.init(projectPath); // Reload runtime
                await refresh(); // Refresh UI
            } else {
                alert('Install Failed: ' + res.message);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleUninstall = async (pluginId: string) => {
        if (!projectPath || !window.electronAPI) return;
        if (!confirm(`Uninstall plugin ${pluginId}?`)) return;
        setLoading(true);
        try {
            const res = await window.electronAPI.uninstallPlugin(projectPath, pluginId);
            if (res.success) {
                await PluginManager.init(projectPath); // Reload runtime
                await refresh(); // Refresh UI
            } else {
                alert('Uninstall Failed: ' + res.message);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    if (!projectPath) {
        return (
            <div className="p-8 text-center text-zinc-400">
                <p>No project open. Please open a project to manage plugins.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full p-6 overflow-auto bg-background">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header & Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-zinc-100 mb-1">Installed Plugins</h2>
                        <p className="text-zinc-500 text-sm">Enable or disable extensions for this specific project.</p>
                    </div>
                    <Button onClick={refresh} variant="outline" size="sm" className="gap-2">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>

                {/* Available Plugins List (to be enabled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePlugins.map((plugin) => {
                        const isInstalled = installedPlugins.includes(plugin.id);

                        return (
                            <Card key={plugin.id} className="p-4 flex flex-col gap-3 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors relative group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-zinc-100">{plugin.name}</h3>
                                        <p className="text-xs text-zinc-500 font-mono mt-0.5">v{plugin.version}</p>
                                    </div>
                                    {isInstalled && (
                                        <div className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded-full flex items-center gap-1">
                                            <Check size={10} />
                                            ENABLED
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-zinc-400 line-clamp-2 flex-1">
                                    {plugin.description || "No description provided."}
                                </p>

                                <div className="mt-2 pt-3 border-t border-zinc-800/50 flex gap-2">
                                    {isInstalled ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => handleUninstall(plugin.id)}
                                            disabled={loading}
                                        >
                                            Disable
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => handleInstall(plugin.id)}
                                            disabled={loading}
                                        >
                                            Enable
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}

                    {availablePlugins.length === 0 && (
                        <div className="col-span-full text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-md bg-zinc-900/20">
                            No plugins found in local library.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
