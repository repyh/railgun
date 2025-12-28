import { useState } from 'react';
import { NODE_REGISTRY } from '@/nodes';
import { Search } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onSelect: (label: string) => void;
}

export function ContextMenu({ x, y, onClose, onSelect }: ContextMenuProps) {
    const [search, setSearch] = useState('');

    // Filter nodes first
    const filteredNodes = NODE_REGISTRY.filter(n =>
        n.category !== 'Event' && // Always exclude Events
        n.label.toLowerCase().includes(search.toLowerCase())
    );

    // Get categories from filtered nodes
    const categories = Array.from(new Set(filteredNodes.map(n => n.category)));

    return (
        <div
            className="fixed z-50 bg-[#18181b] border border-zinc-800 rounded-lg shadow-xl w-56 overflow-hidden flex flex-col"
            style={{ left: x, top: y }}
            onMouseLeave={onClose}
        >
            {/* Search Input */}
            <div className="p-2 border-b border-zinc-800 relative">
                <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    className="w-full bg-zinc-900 text-zinc-300 pl-8 pr-2 py-1.5 text-xs rounded-sm border border-zinc-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 placeholder:text-zinc-600"
                    placeholder="Search nodes..."
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto py-1">
                {categories.length === 0 && (
                    <div className="px-4 py-3 text-xs text-zinc-500 text-center">
                        No nodes found
                    </div>
                )}

                {categories.map(category => (
                    <div key={category}>
                        <div className="px-3 py-1.5 bg-zinc-900/50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                            {category}
                        </div>
                        {filteredNodes.filter(n => n.category === category).map(node => (
                            <div
                                key={node.label}
                                className="px-4 py-1.5 text-xs text-zinc-300 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                                onClick={() => onSelect(node.label)}
                            >
                                {node.label}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
