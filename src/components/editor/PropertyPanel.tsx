import { BotNode } from '@/lib/railgun-rete';
import { Database, Terminal, Play, ArrowRight, Box, X, Settings2, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { InspectorField, InspectorSection } from '@/components/ui/InspectorField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useState, useEffect } from 'react';
import { DiscordEmbedPreview } from '@/components/discord/DiscordEmbedPreview';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function ControlWidget({ control, onUpdate }: { control: any, onUpdate?: () => void }) {
    if (!control) return null;
    const [value, setValue] = useState(control.value);

    useEffect(() => {
        if (control) setValue(control.value);
    }, [control, control?.value]);

    const handleChange = (v: any) => {
        setValue(v);
        control.setValue(v);
        if (onUpdate) onUpdate();
    };

    if (control.options && control.options.length > 0) {
        return (
            <Select value={value} onValueChange={handleChange}>
                <SelectTrigger className="h-[24px] bg-black/20 border-black/20 text-xs w-full">
                    <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                    {control.options.map((opt: any) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label || opt.value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <input
            className="bg-black/20 border border-black/20 rounded-sm h-[24px] px-2 w-full text-zinc-300 text-xs focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder:text-zinc-700"
            value={value}
            placeholder="Value..."
            onChange={(e) => handleChange(e.target.value)}
        />
    );
}

interface PropertyPanelProps {
    node: BotNode | null;
    editor?: any;
    onClose: () => void;
    onNodeUpdate?: () => void;
}

export function PropertyPanel(props: PropertyPanelProps) {
    return (
        <ErrorBoundary
            name="PropertyPanel"
            fallback={
                <div className="w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs p-4 text-center">
                    <div className="mb-2 text-red-400 font-bold">Panel Error</div>
                    <div className="mb-4">Something went wrong rendering the properties.</div>
                    <button onClick={props.onClose} className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-300">Close Panel</button>
                </div>
            }
        >
            {props.node ? (
                <PropertyPanelInner {...props} key={props.node.id} />
            ) : (
                <div className="w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col items-center justify-center text-zinc-600 text-xs">
                    <div className="mb-4 p-4 rounded-xl bg-black/20 border border-white/5">
                        <Settings2 size={32} opacity={0.3} />
                    </div>
                    <span className="text-zinc-600 font-medium">Select a node to edit</span>
                </div>
            )}
        </ErrorBoundary>
    );
}

function PropertyPanelInner({ node, editor, onClose, onNodeUpdate }: PropertyPanelProps) {
    const [, forceUpdate] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    const triggerUpdate = () => forceUpdate(prev => prev + 1);

    if (!node) return null;

    const inputs = Object.entries(node.inputs || {});
    const outputs = Object.entries(node.outputs || {});
    const controls = Object.entries(node.controls || {});

    const [fields, setFields] = useState<any[]>(node.data?.fields || []);

    useEffect(() => {
        if (!node.data) {
            // @ts-ignore
            node.data = {};
        }
        setFields(node.data.fields || []);
    }, [node.id]);

    const updateFields = (newFields: any[]) => {
        if (!node.data) {
            // @ts-ignore
            node.data = {};
        }

        // @ts-ignore
        node.data.fields = newFields;
        setFields(newFields);
        triggerUpdate();
    };

    const addField = () => updateFields([...fields, { name: 'New Field', value: 'Value', inline: false }]);
    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        updateFields(newFields);
    };
    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        updateFields(newFields);
    };

    const handleControlUpdate = (key: string, value: any) => {
        if ((key === 'varName' || key === 'variableName')) {
            if (node.codeType === 'Declare Variable' || node.codeType === 'Set Variable' || node.label.startsWith('Declare Variable') || node.label.startsWith('Set Variable')) {
                const base = node.codeType || (node.label.startsWith('Declare') ? 'Declare Variable' : 'Set Variable');
                node.label = value ? `${base}: ${value}` : base;

                if (onNodeUpdate) onNodeUpdate();
            }
        }

        triggerUpdate();
    };

    let Icon = Box;
    let accentColor = "text-zinc-400";
    switch (node.category) {
        case 'Event': Icon = Play; accentColor = "text-rose-500"; break;
        case 'Action': Icon = Terminal; accentColor = "text-blue-500"; break;
        case 'Logic': Icon = ArrowRight; accentColor = "text-yellow-500"; break;
        case 'Variable': Icon = Database; accentColor = "text-emerald-500"; break;
        case 'Function': Icon = Box; accentColor = "text-purple-500"; break;
        case 'Math': Icon = Terminal; accentColor = "text-orange-500"; break;
        case 'Discord': Icon = Box; accentColor = "text-indigo-500"; break;
    }

    return (
        <>
            {/* Modal Preview Overlay */}
            {showPreview && node.label === 'Construct Embed' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
                    <div className="bg-[#36393f] rounded-lg shadow-2xl p-6 max-w-md w-full m-4 relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowPreview(false)} className="absolute top-2 right-2 text-zinc-400 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-zinc-200 font-bold mb-4 uppercase text-xs tracking-wider">Embed Preview</h3>
                        <div className="bg-[#36393f]">
                            {(() => {
                                const getVal = (key: string) => (node.controls?.[key] as any)?.value || '';
                                return (
                                    <DiscordEmbedPreview
                                        title={getVal('title')}
                                        description={getVal('description')}
                                        color={getVal('color')}
                                        author={getVal('author')}
                                        footer={getVal('footer')}
                                        image={getVal('image')}
                                        thumbnail={getVal('thumbnail')}
                                        timestamp={getVal('timestamp')}
                                        fields={fields}
                                    />
                                )
                            })()}
                        </div>
                    </div>
                </div>
            )}

            <div className="w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col font-sans text-xs select-none relative">
                {/* Header */}
                <div className="h-[36px] bg-zinc-900 border-b border-zinc-800 flex items-center px-3 shrink-0 justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Icon size={14} className={accentColor} />
                        <span className="font-semibold text-zinc-300 truncate" title={node.label}>
                            {node.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {node.label === 'Construct Embed' && (
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={`text-xs px-2 py-0.5 rounded border transition-colors ${showPreview ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'}`}
                            >
                                Preview
                            </button>
                        )}
                        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-900 pb-10">

                    {/* Properties (Controls) */}
                    {controls.length > 0 && (
                        <InspectorSection title="Properties">
                            {controls.map(([key, control]: [string, any]) => (
                                <InspectorField key={key} label={control.label || key} subLabel={control.type}>
                                    <ControlWidget
                                        control={control}
                                        onUpdate={() => handleControlUpdate(key, control.value)}
                                    />
                                </InspectorField>
                            ))}
                        </InspectorSection>
                    )}

                    {/* Embed Fields Management */}
                    {node.label === 'Construct Embed' && (
                        <InspectorSection title="Embed Fields">
                            <div className="flex flex-col gap-2">
                                {fields.map((field, i) => (
                                    <div key={i} className="bg-black/20 p-2 rounded border border-white/5 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={field.name}
                                                onChange={e => updateField(i, 'name', e.target.value)}
                                                className="bg-transparent border-b border-zinc-700 w-full text-zinc-300 text-xs focus:outline-none focus:border-blue-500"
                                                placeholder="Field Name"
                                            />
                                            <button onClick={() => updateField(i, 'inline', !field.inline)} className={field.inline ? "text-blue-400" : "text-zinc-600"} title="Toggle Inline">
                                                {field.inline ? <CheckSquare size={14} /> : <Square size={14} />}
                                            </button>
                                            <button onClick={() => removeField(i)} className="text-zinc-600 hover:text-red-400">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <textarea
                                            value={field.value}
                                            onChange={e => updateField(i, 'value', e.target.value)}
                                            className="bg-transparent w-full text-zinc-400 text-xs focus:outline-none resize-none h-12"
                                            placeholder="Field Value..."
                                        />
                                    </div>
                                ))}
                                <button onClick={addField} className="flex items-center justify-center gap-2 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
                                    <Plus size={14} />
                                    <span>Add Field</span>
                                </button>
                            </div>
                        </InspectorSection>
                    )}

                    {/* Inputs */}
                    {inputs.length > 0 && (
                        <InspectorSection title="Inputs">
                            {inputs.map(([key, input]: [string, any]) => {
                                const connections = editor?.getConnections ? editor.getConnections() : [];
                                const connection = connections.find((c: any) => c.target === node.id && c.targetInput === key);
                                const connectedNodeId = connection?.source;

                                return (
                                    <InspectorField key={key} label={input.label || key}>
                                        {connection ? (
                                            <div className="flex items-center h-[24px] bg-black/20 border border-zinc-800/50 rounded-sm px-2 w-full text-zinc-500 text-xs italic select-none overflow-hidden cursor-not-allowed" title={`Connected to ${connectedNodeId}`}>
                                                <span className="truncate">Ref: {connectedNodeId?.substring(0, 8)}</span>
                                            </div>
                                        ) : input.control ? (
                                            <ControlWidget control={input.control} onUpdate={triggerUpdate} />
                                        ) : (
                                            <div className="flex items-center h-[24px] bg-black/20 border border-transparent rounded-sm px-2 text-zinc-500 select-none cursor-not-allowed opacity-75">
                                                <span className="opacity-40 mr-2 text-[10px]">{getTypeIcon(input.socket?.name)}</span>
                                                <span className="text-xs">{input.socket?.name}</span>
                                            </div>
                                        )}
                                    </InspectorField>
                                );
                            })}
                        </InspectorSection>
                    )}

                    {/* Outputs */}
                    {outputs.length > 0 && (
                        <InspectorSection title="Outputs">
                            {outputs.map(([key, output]: [string, any]) => (
                                <InspectorField key={key} label={output.label || key}>
                                    <div className="flex items-center h-[24px] bg-black/20 border border-transparent rounded-sm px-2 text-zinc-500 select-none justify-end">
                                        <span className="text-xs">{output.socket?.name}</span>
                                        <span className="opacity-40 ml-2 text-[10px]">{getTypeIcon(output.socket?.name)}</span>
                                    </div>
                                </InspectorField>
                            ))}
                        </InspectorSection>
                    )}
                </div>

                {/* Footer */}
                {/* <div className="p-4 border-t border-(--border-primary) text-xs text-(--text-secondary) text-center">
                    Railgun v0.0.1-alpha
                </div> */}
            </div>
        </>
    );
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'Exec': return '▶';
        case 'String': return 'Aa';
        case 'Number': return '#';
        case 'Boolean': return '☑';
        default: return '●';
    }
}

