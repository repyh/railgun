import { useRef, useEffect, useMemo, useState } from 'react';
import { NodeSchemaRegistry } from '@/lib/registries/NodeSchemaRegistry';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface FlowContextMenuProps {
    position: { x: number; y: number } | null;
    onClose: () => void;
    onAddNode: (schemaId: string, position: { x: number; y: number }) => void;
}

export function FlowContextMenu({ position, onClose, onAddNode }: FlowContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Group schemas by category
    const groupedSchemas = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const schemas = NodeSchemaRegistry.getAll().filter(s => {
            if (s.hideFromPalette) return false;
            if (!query) return true;
            return s.label.toLowerCase().includes(query) ||
                (s.category && s.category.toLowerCase().includes(query));
        });

        const groups: Record<string, typeof schemas> = {};

        schemas.forEach(schema => {
            const category = schema.category || 'Other';
            if (!groups[category]) groups[category] = [];
            groups[category].push(schema);
        });

        return groups;
    }, [searchQuery]);

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    if (!position) return null;

    return (
        <div
            ref={ref}
            className="fixed z-50 w-56 bg-[#18181b] border border-zinc-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
            style={{ top: position.y, left: position.x }}
        >
            <div className="p-2 border-b border-zinc-800">
                <div className="relative">
                    <Search className="absolute left-2 top-1.5 text-zinc-500 w-4 h-4" />
                    <input
                        className="w-full bg-zinc-950 border border-zinc-800 rounded pl-8 pr-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                        placeholder="Search nodes..."
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] p-1">
                {Object.keys(groupedSchemas).length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-zinc-500">
                        No nodes found for "{searchQuery}"
                    </div>
                )}
                {Object.entries(groupedSchemas).map(([category, schemas]) => (
                    <div key={category}>
                        <div className="px-3 py-1.5 bg-zinc-900/50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                            {category}
                        </div>
                        {schemas.map(schema => (
                            <div
                                key={schema.id}
                                className="px-4 py-1.5 text-xs text-zinc-300 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                                onClick={() => onAddNode(schema.id, position)}
                            >
                                {schema.label}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
