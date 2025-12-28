import { useEffect, useState } from 'react';
import { PluginManager } from '@/lib/plugins/PluginManager';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Trash2, Check, RefreshCw, MoreVertical, Package, X } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/Badge';

const PluginsView = () => {
    const { projectPath } = useProject();

    const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);
    const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlugin, setSelectedPlugin] = useState<any | null>(null); // For details dialog

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
            const installed = await window.electronAPI.listInstalledPlugins(projectPath);
            setInstalledPlugins(installed);
        } catch (e) {
            console.error("Failed to refresh plugins", e);
        }
        setLoading(false);
    };

    const handleInstall = async (pluginId: string) => {
        if (!projectPath) return;
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
        if (!projectPath) return;
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
        <div className="h-full w-full p-6 overflow-auto bg-[#09090b]">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header & Actions */}
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

                {/* Available Plugins List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePlugins.map((plugin) => {
                        const isInstalled = installedPlugins.includes(plugin.id);

                        return (
                            <Card key={plugin.id} className="p-4 flex flex-col gap-3 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors relative group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-zinc-100">{plugin.name}</h3>
                                        <p className="text-xs text-zinc-500 font-mono mt-0.5">v{plugin.version} • {plugin.author}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isInstalled && (
                                            <div className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded-full flex items-center gap-1">
                                                <Check size={10} />
                                                ENABLED
                                            </div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-200"
                                            onClick={() => setSelectedPlugin(plugin)}
                                        >
                                            <MoreVertical size={14} />
                                        </Button>
                                    </div>
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
                                            <Trash2 size={14} />
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
                                            <Download size={14} />
                                            Enable
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}

                    {availablePlugins.length === 0 && (
                        <div className="col-span-full text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-md bg-zinc-900/20">
                            No plugins found in library ({PluginManager.libraryDir}).
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Modal Overlay */}
            {selectedPlugin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div
                        className="bg-zinc-950 border border-zinc-800 w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/30">
                            <div>
                                <h3 className="font-semibold text-lg text-zinc-100">{selectedPlugin.name}</h3>
                                <p className="text-xs text-zinc-500 font-mono">v{selectedPlugin.version}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPlugin(null)} className="h-8 w-8 p-0">
                                <X size={16} />
                            </Button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                {selectedPlugin.description}
                            </p>

                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                    <Package size={12} />
                                    Dependencies
                                </h4>
                                {selectedPlugin.requirements && Object.keys(selectedPlugin.requirements).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(selectedPlugin.requirements).map(([pkg, version]) => (
                                            <Badge key={pkg} variant="secondary" className="font-mono text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                                                {pkg} <span className="text-zinc-500 ml-1">@{String(version)}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500 italic">No external dependencies.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Author</span>
                                    <span className="text-sm text-zinc-200">{selectedPlugin.author || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Plugin ID</span>
                                    <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-400 font-mono">{selectedPlugin.id}</code>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 text-right">
                            <Button variant="secondary" onClick={() => setSelectedPlugin(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PluginsView;