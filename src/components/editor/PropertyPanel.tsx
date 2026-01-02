import { Database, Terminal, Play, ArrowRight, Box, X, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { InspectorField, InspectorSection } from '@/components/ui/InspectorField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useState, useEffect } from 'react';
import { DiscordEmbedPreview } from '@/components/discord/DiscordEmbedPreview';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { CompilerNode } from '@/lib/compiler/graphTypes';
import { NodeSchemaRegistry } from '@/lib/registries/NodeSchemaRegistry';
import type { NodeControl } from '@/lib/railgun-flow';

function ControlWidget({ control, value, onUpdate }: { control: NodeControl, value: any, onUpdate: (val: any) => void }) {
    if (!control) return null;

    if (control.type === 'select' && control.props?.options) {
        return (
            <Select value={String(value || '')} onValueChange={onUpdate}>
                <SelectTrigger className="h-[24px] bg-black/20 border-black/20 text-xs w-full">
                    <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                    {control.props.options.map((opt: any) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label || opt.value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    if (control.type === 'boolean') {
        const boolVal = value === true || value === 'true';
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onUpdate(!boolVal)}
                    className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${boolVal ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-zinc-600'}`}
                >
                    {boolVal && <CheckSquare size={12} className="text-white" />}
                </button>
                <span className="text-xs text-zinc-400">{boolVal ? 'True' : 'False'}</span>
            </div>
        );
    }

    return (
        <input
            className="bg-black/20 border border-black/20 rounded-sm h-[24px] px-2 w-full text-zinc-300 text-xs focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder:text-zinc-700"
            value={value !== undefined ? value : ''}
            placeholder={control.props?.placeholder || "Value..."}
            onChange={(e) => onUpdate(control.type === 'number' ? Number(e.target.value) : e.target.value)}
            type={control.type === 'number' ? 'number' : 'text'}
        />
    );
}

// Simple fallback widget for inputs without explicit control usage in schema but allowing local values
function SimpleInputWidget({ type, value, onUpdate }: { type: string, value: any, onUpdate: (val: any) => void }) {
    const isNumber = type === 'Number';
    const isBoolean = type === 'Boolean';

    if (isBoolean) {
        const boolVal = value === true || value === 'true';
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onUpdate(!boolVal)}
                    className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${boolVal ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-zinc-600'}`}
                >
                    {boolVal && <CheckSquare size={12} className="text-white" />}
                </button>
            </div>
        )
    }

    return (
        <input
            className="bg-black/20 border border-black/20 rounded-sm h-[24px] px-2 w-full text-zinc-300 text-xs focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder:text-zinc-700"
            value={value !== undefined ? value : ''}
            placeholder={type + "..."}
            onChange={(e) => onUpdate(isNumber ? Number(e.target.value) : e.target.value)}
            type={isNumber ? 'number' : 'text'}
        />
    )
}

interface PropertyPanelProps {
    node: CompilerNode | null;
    editor?: any; // ReactFlow instance or similar for looking up connections
    onClose: () => void;
    onNodeUpdate?: (nodeId: string, data: any) => void;
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
            {props.node && (
                <PropertyPanelInner {...props} key={props.node.id} />
            )}
        </ErrorBoundary>
    );
}

function PropertyPanelInner({ node, editor, onClose, onNodeUpdate }: PropertyPanelProps) {
    const [, forceUpdate] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    // Resolve Schema
    const schemaId = node?.data?._schemaId || node?.codeType;
    const schema = NodeSchemaRegistry.get(schemaId);

    const triggerUpdate = () => forceUpdate(prev => prev + 1);

    if (!node) return null;

    // Use Schema definitions if available, otherwise fallback to CompilerNode inputs/outputs (which are populated by adapter)
    const inputs = schema?.inputs || Object.entries(node.inputs || {}).map(([key, val]) => ({ key, label: val.label, socketType: val.socket.name }));
    const outputs = schema?.outputs || Object.entries(node.outputs || {}).map(([key, val]) => ({ key, label: val.label, socketType: val.socket.name }));
    const controls = schema?.controls || [];

    const [fields, setFields] = useState<any[]>(node.data?.fields || []);

    useEffect(() => {
        setFields(node.data?.fields || []);
    }, [node.id, node.data]);

    const updateData = (key: string, value: any) => {
        if (!node.data) node.data = {};
        node.data[key] = value;

        // Notify parent
        if (onNodeUpdate) {
            onNodeUpdate(node.id, { ...node.data });
        }
        triggerUpdate();
    };

    const updateFields = (newFields: any[]) => {
        updateData('fields', newFields);
        setFields(newFields);
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

    // Embed Preview Helper
    const getVal = (key: string) => node.data?.[key] || '';

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
                            {node.label} ({node.id.substring(0, 5)})
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

                    {/* Properties (Values without sockets, defined as controls in Schema) */}
                    {controls.length > 0 && (
                        <InspectorSection title="Properties">
                            {controls.map((control) => (
                                <InspectorField key={control.key} label={control.label || control.key} subLabel={control.type}>
                                    <ControlWidget
                                        control={control}
                                        value={node.data?.[control.key]}
                                        onUpdate={(val) => updateData(control.key, val)}
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
                            {inputs.map((input: any) => {
                                const key = input.key;
                                // Check connections via Editor API or assume unconnected if editor is missing
                                // React Flow edges are { source, target, targetHandle }
                                const connections = editor?.getEdges ? editor.getEdges() : [];
                                const connection = connections.find((c: any) => c.target === node.id && c.targetHandle === key);
                                const connectedNodeId = connection?.source;

                                const isPrimitive = ['String', 'Number', 'Boolean'].includes(input.socketType);

                                return (
                                    <InspectorField key={key} label={input.label || key}>
                                        {connection ? (
                                            <div className="flex items-center h-[24px] bg-black/20 border border-zinc-800/50 rounded-sm px-2 w-full text-zinc-500 text-xs italic select-none overflow-hidden cursor-not-allowed" title={`Connected to ${connectedNodeId}`}>
                                                <span className="truncate">Ref: {connectedNodeId?.substring(0, 8)}</span>
                                            </div>
                                        ) : isPrimitive ? (
                                            // Allow manual entry for unconnected primitive inputs
                                            <SimpleInputWidget
                                                type={input.socketType}
                                                value={node.data?.[key]}
                                                onUpdate={(val) => updateData(key, val)}
                                            />
                                        ) : (
                                            <div className="flex items-center h-[24px] bg-black/20 border border-transparent rounded-sm px-2 text-zinc-500 select-none cursor-not-allowed opacity-75">
                                                <span className="opacity-40 mr-2 text-[10px]">{getTypeIcon(input.socketType)}</span>
                                                <span className="text-xs">{input.socketType}</span>
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
                            {outputs.map((output: any) => (
                                <InspectorField key={output.key} label={output.label || output.key}>
                                    <div className="flex items-center h-[24px] bg-black/20 border border-transparent rounded-sm px-2 text-zinc-500 select-none justify-end">
                                        <span className="text-xs">{output.socketType}</span>
                                        <span className="opacity-40 ml-2 text-[10px]">{getTypeIcon(output.socketType)}</span>
                                    </div>
                                </InspectorField>
                            ))}
                        </InspectorSection>
                    )}
                </div>
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
