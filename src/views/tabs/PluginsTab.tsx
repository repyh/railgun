import React, { useEffect, useState } from 'react';
import { PluginManager } from '@/lib/plugins/PluginManager';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Check, Trash2, Download } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useElectron } from '@/hooks/useElectron';

export const PluginsTab: React.FC = () => {
    const { projectPath } = useProject();

    const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);
    const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState<string | null>(null);
    const [uninstalling, setUninstalling] = useState<string | null>(null);
    const { isElectron, plugins } = useElectron();

    const loadInstalled = async () => {
        if (!projectPath || !isElectron) return;
        try {
            const installed = await plugins.list(projectPath);
            setInstalledPlugins(installed);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        refresh();
    }, [projectPath]);

    useEffect(() => {
        loadInstalled();
    }, [projectPath, isElectron]); // Reload installed plugins when projectPath or electron status changes

    const refresh = async () => {
        if (!projectPath) return;
        setLoading(true);
        try {
            // Get Available (Sync fs read in Renderer)
            const available = PluginManager.getAvailablePlugins();
            setAvailablePlugins(available);

            // Get Installed (Async IPC)
            await loadInstalled(); // Use the new loadInstalled function
        } catch (e) {
            console.error("Failed to refresh plugins", e);
        }
        setLoading(false);
    };

    const handleInstall = async (pluginId: string) => {
        if (!projectPath || !isElectron) return;
        setInstalling(pluginId);
        try {
            const res: any = await plugins.install(projectPath, pluginId);
            if (res && !res.success) {
                alert('Install Failed: ' + res.message);
            } else {
                await PluginManager.init(projectPath); // Reload runtime
                await loadInstalled(); // Refresh UI
            }
        } catch (e) {
            console.error(e);
        } finally {
            setInstalling(null);
        }
    };

    const handleUninstall = async (pluginId: string) => {
        if (!projectPath || !isElectron) return;
        if (!confirm(`Uninstall plugin ${pluginId}?`)) return;
        setUninstalling(pluginId);
        try {
            const res: any = await plugins.uninstall(projectPath, pluginId);
            if (res && !res.success) {
                alert('Uninstall Failed: ' + res.message);
            } else {
                await PluginManager.init(projectPath); // Reload runtime
                await loadInstalled(); // Refresh UI
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUninstalling(null);
        }
    };

    if (!projectPath) {
        return (
            <div className="p-8 text-center text-zinc-400">
                <p>No project open. Please open a project to manage plugins.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-background">
            <div className="h-9 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-medium text-zinc-200">Installed Plugins</h2>
                </div>
                <Button onClick={refresh} variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" title="Refresh">
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">

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
                                                disabled={loading || uninstalling === plugin.id}
                                            >
                                                {uninstalling === plugin.id ? <RefreshCw className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                Disable
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="w-full gap-2"
                                                onClick={() => handleInstall(plugin.id)}
                                                disabled={loading || installing === plugin.id}
                                            >
                                                {installing === plugin.id ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
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
        </div >
    );
};
