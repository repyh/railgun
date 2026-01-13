import { memo, useCallback } from 'react';
import { Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { NodeSchemaRegistry } from '@/lib/registries/NodeSchemaRegistry';
import type { BotFlowNode, FlowSocket } from '@/lib/railgun-flow';
import { cn } from '@/lib/utils';
import { CustomHandle } from './CustomHandle';
import { X } from 'lucide-react';

export const UniversalNode = memo(({ id, data, selected }: NodeProps<BotFlowNode>) => {
    const { deleteElements } = useReactFlow();
    const schemaId = data._schemaId;
    const schema = NodeSchemaRegistry.get(schemaId);

    const onDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    }, [id, deleteElements]);

    if (!schema) {
        return (
            <div className="p-4 bg-red-950 border border-red-500 rounded text-red-100">
                Unknown Node Type: {schemaId}
            </div>
        );
    }

    const validationStatus = data.validationStatus as 'error' | 'warning' | undefined;
    const validationMessage = data.validationMessage as string | undefined;

    return (
        <div
            className={cn(
                "min-w-[180px] bg-[#0c0c0e]/90 backdrop-blur-sm border rounded-lg transition-all relative group shadow-2xl",
                selected ? "ring-2 ring-blue-500/40 border-zinc-600 bg-[#0f0f12]" : "border-zinc-800/80 hover:border-zinc-700",
                validationStatus === 'error' && "ring-2 ring-red-500/40 border-red-900/50",
                validationStatus === 'warning' && "ring-2 ring-yellow-500/40 border-yellow-900/50"
            )}
        >
            {/* Validation Message Tooltip */}
            {validationMessage && (
                <div className={cn(
                    "absolute -top-9 left-0 right-0 px-2 py-1.5 text-[10px] text-white rounded-md opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none transform translate-y-1 group-hover:translate-y-0",
                    validationStatus === 'error' ? "bg-red-600 shadow-lg shadow-red-900/20" : "bg-yellow-600 shadow-lg shadow-yellow-900/20"
                )}>
                    {validationMessage}
                </div>
            )}

            {/* HEADER */}
            <div className={cn(
                "h-9 px-3 flex items-center gap-2 border-b border-white/5 rounded-t-lg",
                schema.category === 'Event' ? "bg-rose-500/10 text-rose-400" :
                    schema.category === 'Action' ? "bg-blue-500/10 text-blue-400" :
                        schema.category === 'Logic' ? "bg-yellow-500/10 text-yellow-400" :
                            schema.category === 'Variable' ? "bg-emerald-500/10 text-emerald-400" :
                                "bg-zinc-800/30 text-zinc-300"
            )}>
                <div className="font-bold text-[10px] tracking-[0.05em] uppercase opacity-70 flex-1 truncate select-none">
                    {schema.label}
                </div>

                {validationStatus && (
                    <div className={cn("w-2 h-2 rounded-full", validationStatus === 'error' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]")} />
                )}

                {/* Delete Button */}
                <button
                    className="text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 p-1 rounded-md"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={onDelete}
                >
                    <X size={12} />
                </button>
            </div>

            {/* BODY - INPUTS & OUTPUTS */}
            <div className="p-4 grid grid-cols-[1fr_auto_1fr] gap-x-4">

                {/* LEFT COLUMN: INPUTS */}
                <div className="flex flex-col gap-4">
                    {schema.inputs.map((input: FlowSocket) => {
                        const isExec = input.socketType === 'Exec';
                        return (
                            <div key={input.key} className="relative flex items-center h-4 group/socket">
                                <CustomHandle
                                    type="target"
                                    position={Position.Left}
                                    id={input.key}
                                    socketType={input.socketType}
                                    className="-ml-6"
                                />

                                <span className={cn(
                                    "text-[10px] select-none transition-colors",
                                    isExec ? "text-white font-semibold" : "text-zinc-500 group-hover/socket:text-zinc-300"
                                )}>
                                    {input.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* MIDDLE SPACER */}
                <div className="w-4" />

                {/* RIGHT COLUMN: OUTPUTS */}
                <div className="flex flex-col gap-4 items-end">
                    {schema.outputs.map((output) => {
                        const isExec = output.socketType === 'Exec';
                        return (
                            <div key={output.key} className="relative flex items-center justify-end h-4 group/socket">
                                <span className={cn(
                                    "text-[10px] text-right select-none transition-colors",
                                    isExec ? "text-white font-semibold" : "text-zinc-500 group-hover/socket:text-zinc-300"
                                )}>
                                    {output.label}
                                </span>

                                <CustomHandle
                                    type="source"
                                    position={Position.Right}
                                    id={output.key}
                                    socketType={output.socketType}
                                    className="-mr-6"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
