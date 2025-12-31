import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';



export interface SlashOption {
    name: string;
    description: string;
    type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE' | 'MENTIONABLE' | 'NUMBER' | 'ATTACHMENT';
    required: boolean;
}

interface CreateSlashCommandModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateCommand: (name: string, description: string, options: SlashOption[]) => void;
}

export function CreateSlashCommandModal({ open, onOpenChange, onCreateCommand }: CreateSlashCommandModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState<SlashOption[]>([]);

    // New Option State
    const [optName, setOptName] = useState('');
    const [optDesc, setOptDesc] = useState('');
    const [optType, setOptType] = useState<SlashOption['type']>('STRING');
    const [optRequired, setOptRequired] = useState(false);

    const handleAddOption = () => {
        if (optName && optDesc) {
            setOptions([...options, {
                name: optName.toLowerCase().replace(/\s+/g, '-'),
                description: optDesc,
                type: optType,
                required: optRequired
            }]);
            setOptName('');
            setOptDesc('');
            setOptType('STRING');
            setOptRequired(false);
        }
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (name && description) {
            onCreateCommand(name.toLowerCase().replace(/\s+/g, '-'), description, options);
            setName('');
            setDescription('');
            setOptions([]);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Slash Command</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 px-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cmd-name">Command Name</Label>
                            <Input
                                id="cmd-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="my-command"
                                autoFocus
                            />
                            <p className="text-[10px] text-zinc-500">Lowercase, no spaces.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cmd-desc">Description</Label>
                            <Input
                                id="cmd-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What does this command do?"
                            />
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 my-2" />

                    {/* Options Manager */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Command Options (Arguments)</Label>
                        </div>

                        {/* Add Option Form */}
                        <div className="bg-zinc-900/50 p-3 rounded-md border border-zinc-800 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Option Name</Label>
                                    <Input
                                        value={optName}
                                        onChange={e => setOptName(e.target.value)}
                                        placeholder="e.g. user"
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Type</Label>
                                    <select
                                        className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                                        value={optType}
                                        onChange={(e) => setOptType(e.target.value as any)}
                                    >
                                        <option value="STRING">String</option>
                                        <option value="INTEGER">Integer</option>
                                        <option value="BOOLEAN">Boolean</option>
                                        <option value="USER">User</option>
                                        <option value="CHANNEL">Channel</option>
                                        <option value="ROLE">Role</option>
                                        <option value="MENTIONABLE">Mentionable</option>
                                        <option value="NUMBER">Number</option>
                                        <option value="ATTACHMENT">Attachment</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Input
                                    value={optDesc}
                                    onChange={e => setOptDesc(e.target.value)}
                                    placeholder="Option description..."
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={optRequired}
                                        onChange={e => setOptRequired(e.target.checked)}
                                        className="rounded border-zinc-700 bg-zinc-900"
                                    />
                                    Required?
                                </label>
                                <Button size="sm" variant="secondary" onClick={handleAddOption} disabled={!optName || !optDesc}>
                                    Add Option
                                </Button>
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="space-y-2">
                            {options.map((opt, i) => (
                                <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${opt.required ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                            {opt.required ? 'REQ' : 'OPT'}
                                        </span>
                                        <span className="font-medium text-zinc-200">{opt.name}</span>
                                        <span className="text-zinc-500 text-xs">({opt.type})</span>
                                    </div>
                                    <button onClick={() => handleRemoveOption(i)} className="text-zinc-500 hover:text-red-400 px-2">
                                        ×
                                    </button>
                                </div>
                            ))}
                            {options.length === 0 && (
                                <p className="text-xs text-zinc-600 italic text-center py-2">No options added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!name || !description}>
                        Create Command
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
