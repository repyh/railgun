import React, { useState } from 'react';
import { useGlobalVariables } from '@/hooks/useGlobalVariables';
import type { GlobalVariable } from '@/hooks/useGlobalVariables';
import { Plus, Trash, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VariablesTabProps {
    projectPath: string | null;
}

export const VariablesTab: React.FC<VariablesTabProps> = ({ projectPath }) => {
    const { variables, addVariable, deleteVariable } = useGlobalVariables(projectPath);
    const [isAdding, setIsAdding] = useState(false);

    // Temp state for new variable
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<GlobalVariable['type']>('string');
    const [newDefaultValue, setNewDefaultValue] = useState('');

    const handleCreate = () => {
        if (!newName) return;

        const newVar: GlobalVariable = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            name: newName,
            type: newType,
            defaultValue: newType === 'number' ? Number(newDefaultValue) : newType === 'boolean' ? (newDefaultValue === 'true') : newDefaultValue
        };

        addVariable(newVar);
        setNewName('');
        setNewDefaultValue('');
        setIsAdding(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="h-9 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Database size={14} className="text-purple-400" />
                    <h2 className="text-xs font-medium text-zinc-200">Global Variables</h2>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Add Variable"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {isAdding && (
                    <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700 space-y-2 animate-in fade-in slide-in-from-top-2">
                        <input
                            autoFocus
                            className="w-full bg-zinc-900/50 text-sm px-2 py-1 rounded border border-zinc-700 outline-none focus:border-purple-500"
                            placeholder="Variable Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <div className="flex gap-2">
                            <select
                                className="bg-zinc-900/50 text-xs px-2 py-1 rounded border border-zinc-700 outline-none"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as any)}
                            >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="any">Any</option>
                            </select>
                            <input
                                className="flex-1 bg-zinc-900/50 text-xs px-2 py-1 rounded border border-zinc-700 outline-none"
                                placeholder="Default Value"
                                value={newDefaultValue}
                                onChange={(e) => setNewDefaultValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleCreate}>Create</Button>
                        </div>
                    </div>
                )}

                {variables.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                        No variables defined.
                    </div>
                )}

                {variables.map(v => (
                    <div key={v.id} className="group p-3 bg-zinc-900/30 hover:bg-zinc-800/50 rounded border border-zinc-800/50 hover:border-zinc-700 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-200">{v.name}</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{v.type}</span>
                            </div>
                            <button
                                onClick={() => deleteVariable(v.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-all"
                            >
                                <Trash size={12} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-950/50 p-1.5 rounded">
                            <span className="text-xs text-zinc-500">Default:</span>
                            <span className="text-xs text-purple-300 font-mono truncate">{String(v.defaultValue)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
