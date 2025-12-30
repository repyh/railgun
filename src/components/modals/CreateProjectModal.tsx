import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/Dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/Select';
import { FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateProject?: (name: string, path: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onOpenChange, onCreateProject }) => {
    const [name, setName] = useState('');
    const [path, setPath] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [runtime, setRuntime] = useState('nodejs');
    const [template, setTemplate] = useState('typescript');
    const [isLoading, setIsLoading] = useState(false);

    const handleBrowse = async () => {
        if (window.electronAPI) {
            try {
                const selectedPath = await window.electronAPI.selectDirectory();
                if (selectedPath) {
                    setPath(selectedPath);
                }
            } catch (error) {
                console.error('Failed to select directory:', error);
            }
        } else {
            alert('Directory selection is only available in the Electron app.');
        }
    };

    const handleCreate = async () => {
        if (!name || !path) return;

        setIsLoading(true);
        try {
            console.log('Creating project:', { name, path, runtime, template });

            if (window.electronAPI) {
                const result = await window.electronAPI.invoke('project:createProject', {
                    name,
                    path,
                    runtime,
                    template
                });

                if (result.success) {
                    onOpenChange(false);
                    if (onCreateProject) {
                        onCreateProject(name, path);
                    }
                } else {
                    console.error('Failed to create project:', result.message);
                    // TODO: Show error toast
                }
            }
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Configure your new Discord bot project.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 px-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            placeholder="MyAwesomeBot"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="path">Location</Label>
                        <div className="flex gap-2">
                            <Input
                                id="path"
                                value={path}
                                readOnly
                                placeholder="Select a directory..."
                                className="flex-1 font-mono text-xs"
                            />
                            <Button variant="outline" size="icon" onClick={handleBrowse} title="Browse">
                                <FolderOpen className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors focus:outline-none"
                        >
                            {showAdvanced ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                            Advanced Options
                        </button>

                        {showAdvanced && (
                            <div className="mt-3 grid gap-4 p-3 border border-zinc-800 rounded-md bg-zinc-900/50 animate-in slide-in-from-top-2 fade-in">
                                <div className="grid gap-2">
                                    <Label>Runtime</Label>
                                    <Select value={runtime} onValueChange={setRuntime}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Runtime" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nodejs">Node.js (v20+)</SelectItem>
                                            <SelectItem value="bun">Bun (Experimental)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Template</Label>
                                    <Select value={template} onValueChange={setTemplate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="javascript">JavaScript (CommonJS)</SelectItem>
                                            <SelectItem value="typescript">TypeScript (Recommended)</SelectItem>
                                            <SelectItem value="empty">Empty Project</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!name || !path || isLoading}>
                        {isLoading ? 'Creating...' : 'Create Project'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
