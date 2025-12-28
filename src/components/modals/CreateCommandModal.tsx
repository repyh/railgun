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
        if (newArg && !args.includes(newArg)) {
            setArgs([...args, newArg]);
            setNewArg('');
        }
    };

    const handleRemoveArg = (index: number) => {
        setArgs(args.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (name) {
            // @ts-ignore
            onCreateCommand(name, args);
            setName('');
            setArgs([]);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Command</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 px-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Command Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. ping"
                            autoFocus
                        />
                        <p className="text-[10px] text-zinc-500">
                            The command trigger (e.g. !ping)
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Arguments (Optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newArg}
                                onChange={(e) => setNewArg(e.target.value)}
                                placeholder="Arg name (e.g. user)"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddArg()}
                            />
                            <Button onClick={handleAddArg} variant="secondary">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {args.map((arg, i) => (
                                <div key={i} className="bg-zinc-800 text-xs px-2 py-1 rounded flex items-center gap-2 border border-zinc-700">
                                    <span>{arg}</span>
                                    <button onClick={() => handleRemoveArg(i)} className="text-zinc-500 hover:text-red-400">×</button>
                                </div>
                            ))}
                            {args.length === 0 && <span className="text-xs text-zinc-600 italic">No arguments</span>}
                        </div>
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
