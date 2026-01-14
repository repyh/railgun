import React, { useState, useEffect } from 'react';
import { useElectron } from '@/hooks/useElectron';
import { useSettings } from '@/contexts/SettingsContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
    Folder,
    FileCode,
    Zap,
    Search,
    Cpu,
    CheckCircle2
} from 'lucide-react';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateProject?: (name: string, path: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onOpenChange, onCreateProject }) => {
    const { project } = useElectron();
    const { settings } = useSettings();

    const [name, setName] = useState('');
    const [path, setPath] = useState(settings.system.defaultProjectPath || '');
    const [runtime, setRuntime] = useState<'nodejs' | 'bun'>('nodejs');
    const [template, setTemplate] = useState('javascript');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setName('');
            setPath(settings.system.defaultProjectPath || '');
        }
    }, [open, settings.system.defaultProjectPath]);

    const handleBrowse = async () => {
        if (window.electronAPI) {
            const result = await window.electronAPI.selectDirectory();
            if (result) setPath(result);
        }
    };

    const handleCreate = async () => {
        if (!name || !path) return;
        setIsSubmitting(true);
        try {
            const result = await project.create({
                name,
                path,
                runtime,
                template
            });

            if (result.success) {
                if (onCreateProject) {
                    const fullPath = result.message || path;
                    onCreateProject(name, fullPath);
                }
                onOpenChange(false);
            } else {
                alert('Failed to create project: ' + result.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewName = name || 'my-bot';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden border-zinc-800 bg-zinc-950 shadow-2xl shadow-blue-500/10">
                <div className="flex h-[550px]">
                    {/* Left: Configuration Form */}
                    <div className="flex-1 flex flex-col border-r border-zinc-900 bg-zinc-950">
                        <DialogHeader className="p-6 border-b border-zinc-900/50">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Zap size={18} />
                                </div>
                                <DialogTitle className="text-xl font-bold tracking-tight">Project Genesis</DialogTitle>
                            </div>
                            <DialogDescription className="text-zinc-500">
                                Set up your hobbyist Discord bot in seconds.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Project Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter bot name..."
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Storage Location</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={path}
                                        readOnly
                                        placeholder="Select directory..."
                                        className="bg-zinc-900/50 border-zinc-800 text-zinc-400 truncate text-sm"
                                    />
                                    <Button variant="secondary" onClick={handleBrowse} className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-100">
                                        Browse
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Engine</Label>
                                    <select
                                        value={runtime}
                                        onChange={(e) => setRuntime(e.target.value as any)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-zinc-200"
                                    >
                                        <option value="nodejs">Node.js (LTS)</option>
                                        <option value="bun">Bun (Fast)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Blueprint</Label>
                                    <select
                                        value={template}
                                        onChange={(e) => setTemplate(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-zinc-200"
                                    >
                                        <option value="javascript">Hobbyist (JS)</option>
                                        <option value="typescript" disabled>Enterprise (TS) - Soon</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-4 mt-auto bg-zinc-900/20 border-t border-zinc-900">
                            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-white">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={!name || !path || isSubmitting}
                                className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] min-w-[120px]"
                            >
                                {isSubmitting ? 'Igniting...' : 'Create Bot'}
                            </Button>
                        </DialogFooter>
                    </div>

                    {/* Right: Project Preview */}
                    <div className="w-[320px] bg-zinc-900/30 flex flex-col">
                        <div className="p-4 border-b border-zinc-900 bg-zinc-900/50">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Search size={10} /> Live Preview
                            </span>
                        </div>
                        <div className="flex-1 p-6 font-mono text-xs overflow-hidden">
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 text-blue-400 mb-4 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                                    <Folder size={16} />
                                    <span className="font-bold truncate">{previewName}</span>
                                </div>

                                <div className="pl-4 space-y-2 opacity-80">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Folder size={14} className="text-zinc-600" />
                                        <span>.railgun</span>
                                        <span className="text-[9px] text-zinc-700 ml-auto">Internal Data</span>
                                    </div>
                                    <div className="pl-6 flex items-center gap-2 text-zinc-500">
                                        <FileCode size={12} />
                                        <span>onBotReady.railgun</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Folder size={14} className="text-zinc-600" />
                                        <span>src</span>
                                    </div>
                                    <div className="pl-6 space-y-1.5">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Folder size={14} className="text-zinc-700" />
                                            <span>commands</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Folder size={14} className="text-zinc-700" />
                                            <span>events</span>
                                        </div>
                                        <div className="pl-4 flex items-center gap-2 text-yellow-500/80">
                                            <FileCode size={12} />
                                            <span>index.js</span>
                                            <span className="text-[8px] opacity-50 italic">Entry</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center gap-2 text-zinc-500">
                                        <FileCode size={14} className="text-zinc-700" />
                                        <span>railgun.config.json</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <FileCode size={14} className="text-zinc-700" />
                                        <span>package.json</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <CheckCircle2 size={14} className="text-green-500/50" />
                                        <span>.env</span>
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-zinc-800 pt-4 space-y-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-zinc-600 uppercase font-bold">Intents Enabled</span>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px]">Guilds</span>
                                            <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px]">Messages</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Cpu size={12} className="text-zinc-600" />
                                        <span className="text-[10px] text-zinc-500">{runtime === 'nodejs' ? 'Standard Runtime' : 'High-Performance'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
