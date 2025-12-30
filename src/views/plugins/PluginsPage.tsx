import React, { useEffect, useState } from 'react';
import { PluginManager } from '@/lib/plugins/PluginManager';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Check, Package } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

const PluginsPage: React.FC = () => {
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
            const available = PluginManager.getAvailablePlugins();
            setAvailablePlugins(available);
            if (window.electronAPI) {
                const installed = await window.electronAPI.listInstalledPlugins(projectPath);
                setInstalledPlugins(installed);
            }
        } catch (e) {
            console.error("Failed to refresh plugins", e);
        }
        setLoading(false);
    };

    if (!projectPath) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500 animate-in fade-in duration-500">
                <div className="text-center">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No project open. Please open a project to manage plugins.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full p-6 overflow-auto bg-background animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-zinc-100 mb-1">Plugins</h2>
                        <p className="text-zinc-500 text-sm">Manage extensions for your bot.</p>
                    </div>
                    <Button onClick={refresh} variant="outline" size="sm" className="gap-2">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>

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
                                    {plugin.description || "No description."}
                                </p>
                                <Button variant={isInstalled ? "destructive" : "default"} size="sm" className="w-full mt-2" disabled={loading}>
                                    {isInstalled ? "Disable" : "Enable"}
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PluginsPage;
