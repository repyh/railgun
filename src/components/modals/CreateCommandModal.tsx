import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface CreateCommandModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateCommand: (name: string, args: string[]) => void;
}

export function CreateCommandModal({ open, onOpenChange, onCreateCommand }: CreateCommandModalProps) {
    const [name, setName] = useState('');
    const [args, setArgs] = useState<string[]>([]);
    const [newArg, setNewArg] = useState('');

    const handleAddArg = () => {
        const sanitized = newArg.trim().toLowerCase().replace(/\s+/g, '_');
        if (sanitized && !args.includes(sanitized)) {
            setArgs([...args, sanitized]);
            setNewArg('');
        }
    };

    const handleRemoveArg = (index: number) => {
        setArgs(args.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (name) {
            onCreateCommand(name.trim().toLowerCase(), args);
            setName('');
            setArgs([]);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Legacy Command</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 px-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cmd-name">Command Trigger</Label>
                            <Input
                                id="cmd-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. kick"
                                autoFocus
                            />
                            <p className="text-[10px] text-zinc-500">The word that follows the prefix (e.g. !kick)</p>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 my-2" />

                    {/* Arguments Manager */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Command Arguments (Order Matters)</Label>

                        <div className="flex gap-2">
                            <Input
                                value={newArg}
                                onChange={(e) => setNewArg(e.target.value)}
                                placeholder="e.g. target_user"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArg())}
                                className="h-9"
                            />
                            <Button onClick={handleAddArg} variant="secondary" size="sm" type="button">
                                Add
                            </Button>
                        </div>

                        {/* Args List */}
                        <div className="space-y-2 min-h-[40px]">
                            {args.map((arg, i) => (
                                <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-zinc-500 w-4">
                                            #{i + 1}
                                        </span>
                                        <span className="font-medium text-zinc-200">{arg}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveArg(i)}
                                        className="text-zinc-500 hover:text-red-400 transition-colors"
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {args.length === 0 && (
                                <p className="text-xs text-zinc-600 italic text-center py-4 bg-zinc-900/30 rounded border border-dashed border-zinc-800">
                                    No arguments defined. (e.g. !{name || 'cmd'})
                                </p>
                            )}
                        </div>

                        {args.length > 0 && (
                            <p className="text-[10px] text-zinc-500 italic">
                                Example usage: !{name || 'cmd'} {args.map(a => `<${a}>`).join(' ')}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!name}>
                        Create Command
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
