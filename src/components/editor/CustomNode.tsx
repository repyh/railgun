import { useEffect, useRef } from 'react';
import { BotNode } from '@/lib/railgun-rete';
import { Play, Terminal, Database, Box, ArrowRight, X } from 'lucide-react';

const Ref = ({ className, init, children }: { className?: string, init: (el: HTMLElement) => void, children?: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) init(ref.current);
    }, [init]);
    return <div ref={ref} className={className}>{children}</div>;
};

// @ts-ignore
export function CustomNode(props: { data: BotNode; styles?: any; emit: (data: any) => void, selected?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
    const { data, emit, selected, styles, ...rest } = props;

    const category = data.category || 'Action';
    const inputs = Object.entries(data.inputs || {});
    const outputs = Object.entries(data.outputs || {});
    // const controls = Object.entries(data.controls || {});

    let accentColor = 'border-zinc-700';
    let icon = <Box size={14} className="text-zinc-400" />;

    switch (category) {
        case 'Event':
            accentColor = 'border-l-rose-500';
            icon = <Play size={14} className="text-rose-500" />;
            break;
        case 'Action':
            accentColor = 'border-l-blue-500';
            icon = <Terminal size={14} className="text-blue-500" />;
            break;
        case 'Logic':
            accentColor = 'border-l-yellow-500';
            icon = <ArrowRight size={14} className="text-yellow-500" />;
            break;
        case 'Variable':
            accentColor = 'border-l-emerald-500';
            icon = <Database size={14} className="text-emerald-500" />;
            break;
        case 'Function':
            accentColor = 'border-l-purple-500';
            icon = <Box size={14} className="text-purple-500" />;
            break;
        case 'Math':
            accentColor = 'border-l-orange-500';
            icon = <Terminal size={14} className="text-orange-500" />;
            break;
    }

    const shadowClass = selected
        ? 'ring-1 ring-blue-500 bg-zinc-900'
        : 'hover:bg-zinc-900 bg-[#0c0c0e]';

    // --- Styling Logic (Unchanged) ---

    return (
        <div
            {...rest}
            className={`relative min-w-[180px] rounded-sm border border-zinc-800 transition-all duration-200 group ${shadowClass} ${accentColor} border-l-2`}
            style={styles}
            data-testid="node" // Ensure explicit test id
        >

            {/* Header */}
            <div className="px-3 py-2 flex items-center gap-2 border-b border-zinc-800/50 bg-black/20 group-hover/header">
                {icon}
                <div className="font-mono cursor-default text-xs font-medium text-zinc-300 uppercase tracking-wider truncate flex-1">
                    {data.label}
                </div>
                {/* Delete Button */}
                <button
                    className="text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 relative z-50 cursor-pointer pointer-events-auto p-1 hover:bg-zinc-800 rounded"
                    onPointerDown={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Delete button clicked for:", data.id);
                        window.dispatchEvent(new CustomEvent('delete-node', {
                            detail: { nodeId: data.id }
                        }));
                    }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* Body */}
            <div className="p-3 grid grid-cols-[auto_1fr_auto] gap-x-4">

                {/* --- INPUTS --- */}
                <div className="flex flex-col gap-3 min-w-[10px]">
                    {inputs.map(([key, input]: [string, any]) => (
                        <div key={key} className="flex items-center gap-2 h-4 relative" data-testid={`input-${key}`}>
                            <Ref
                                className="cursor-crosshair w-4 h-4 flex items-center justify-center -ml-5"
                                init={(ref: HTMLElement) => {
                                    emit({
                                        type: 'render',
                                        data: {
                                            type: 'socket',
                                            side: 'input',
                                            key,
                                            nodeId: data.id,
                                            element: ref,
                                            payload: input.socket
                                        }
                                    });
                                }}
                            />

                            <div className="font-mono text-[10px] text-zinc-400 select-none">
                                {input.label || key}
                            </div>

                            {/* Control hidden in node view */}
                        </div>
                    ))}
                </div>

                {/* --- CONTROLS --- */}
                <div className="flex flex-col justify-center min-w-[20px]">
                    {/* Controls hidden in node view */}
                </div>

                {/* --- OUTPUTS --- */}
                <div className="flex flex-col gap-3 items-end min-w-[10px]">
                    {outputs.map(([key, output]: [string, any]) => (
                        <div key={key} className="flex items-center gap-2 h-4 relative" data-testid={`output-${key}`}>
                            <div className="font-mono text-[10px] text-zinc-400 text-right select-none">
                                {output.label || key}
                            </div>

                            {/* Explicit Ref Implementation - Container for Rete Socket */}
                            <Ref
                                className="cursor-crosshair w-4 h-4 flex items-center justify-center -mr-5"
                                init={(ref: HTMLElement) => {
                                    emit({
                                        type: 'render',
                                        data: {
                                            type: 'socket',
                                            side: 'output',
                                            key,
                                            nodeId: data.id,
                                            element: ref,
                                            payload: output.socket
                                        }
                                    });
                                }}
                            />
                        </div>
                    ))}
                </div>

            </div>

            {/* Status Indicator */}
            <div className="absolute top-0 right-0 p-1">
                {selected && <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />}
            </div>
        </div>
    );
}