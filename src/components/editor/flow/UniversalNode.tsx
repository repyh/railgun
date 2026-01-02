import { memo, useCallback } from 'react';
import { Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { NodeSchemaRegistry } from '@/lib/registries/NodeSchemaRegistry';
import type { BotFlowNode, FlowSocket } from '@/lib/railgun-flow';
import { cn } from '@/lib/utils';
import { CustomHandle } from './CustomHandle';
import { X } from 'lucide-react';

// @ts-ignore
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

    let accentColor = 'border-l-zinc-700';
    // Match colors from CustomNode
    switch (schema.category) {
        case 'Event': accentColor = 'border-l-rose-500'; break;
        case 'Action': accentColor = 'border-l-blue-500'; break;
        case 'Logic': accentColor = 'border-l-yellow-500'; break;
        case 'Variable': accentColor = 'border-l-emerald-500'; break;
        case 'Function': accentColor = 'border-l-purple-500'; break;
        case 'Math': accentColor = 'border-l-orange-500'; break;
        default: accentColor = 'border-l-zinc-700'; break;
    }

    return (
        <div
            className={cn(
                "min-w-[180px] bg-[#0c0c0e] border border-l-2 rounded-sm transition-all relative group shadow-sm hover:shadow-md",
                accentColor,
                selected ? "ring-1 ring-blue-500 border-zinc-700" : "border-zinc-800",
                validationStatus === 'error' && "ring-1 ring-red-500",
                validationStatus === 'warning' && "ring-1 ring-yellow-500"
            )}
        >
            {/* Validation Message Tooltip-ish */}
            {validationMessage && (
                <div className={cn(
                    "absolute -top-8 left-0 right-0 px-2 py-1 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none",
                    validationStatus === 'error' ? "bg-red-600" : "bg-yellow-600"
                )}>
                    {validationMessage}
                </div>
            )}

            {/* HEADER */}
            <div className={cn(
                "h-8 px-3 flex items-center gap-2 border-b border-white/5",
                schema.category === 'Event' ? "bg-rose-500/20 text-rose-400" :
                    schema.category === 'Action' ? "bg-blue-500/20 text-blue-400" :
                        schema.category === 'Logic' ? "bg-yellow-500/20 text-yellow-400" :
                            schema.category === 'Variable' ? "bg-emerald-500/20 text-emerald-400" :
                                "bg-zinc-800/50 text-zinc-300"
            )}>
                <div className="font-bold text-[11px] tracking-tight uppercase opacity-80 flex-1 truncate select-none">
                    {schema.label}
                </div>

                {validationStatus && (
                    <div className={cn("w-2 h-2 rounded-full", validationStatus === 'error' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]")} />
                )}

                {/* Delete Button */}
                <button
                    className="text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={onDelete}
                >
                    <X size={12} />
                </button>
            </div>

            {/* BODY - INPUTS & OUTPUTS */}
            <div className="p-3 grid grid-cols-[auto_1fr_auto] gap-x-4">

                {/* LEFT COLUMN: INPUTS */}
                <div className="flex flex-col gap-3 min-w-[20px]">
                    {schema.inputs.map((input: FlowSocket) => {
                        const isExec = input.socketType === 'Exec';
                        return (
                            <div key={input.key} className="relative flex items-center h-4">
                                {/* HANDLE - Positioned absolute left */}
                                <CustomHandle
                                    type="target"
                                    position={Position.Left}
                                    id={input.key}
                                    socketType={input.socketType}
                                    className="-ml-5"
                                />

                                <span className={cn(
                                    "font-mono text-[10px] select-none",
                                    isExec ? "text-white font-bold" : "text-zinc-400"
                                )}>
                                    {input.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* MIDDLE COLUMN - Just Spacer or controls if mixed (not doing mixed for now) */}
                <div className="min-w-[10px]" />

                {/* RIGHT COLUMN: OUTPUTS */}
                <div className="flex flex-col gap-3 items-end min-w-[20px]">
                    {schema.outputs.map((output) => {
                        const isExec = output.socketType === 'Exec';
                        return (
                            <div key={output.key} className="relative flex items-center justify-end h-4">
                                <span className={cn(
                                    "font-mono text-[10px] text-right select-none",
                                    isExec ? "text-white font-bold" : "text-zinc-400"
                                )}>
                                    {output.label}
                                </span>

                                {/* HANDLE */}
                                <CustomHandle
                                    type="source"
                                    position={Position.Right}
                                    id={output.key}
                                    socketType={output.socketType}
                                    className="-mr-5"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
