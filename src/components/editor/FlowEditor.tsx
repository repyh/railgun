import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    BackgroundVariant,
    useReactFlow,
    reconnectEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UniversalNode } from './flow/UniversalNode';
import type { BotNodeData } from '@/lib/railgun-flow';
import { ReactFlowAdapter } from '@/lib/adapter/ReactFlowAdapter';
import { Compiler } from '@/lib/compiler';
import { useElectron } from '@/hooks/useElectron';
import { Play, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useConnectionValidator } from '@/hooks/useConnectionValidator';
import { useGraphValidator } from '@/hooks/useGraphValidator';
import { FlowContextMenu } from './flow/FlowContextMenu';
import { VibrantEdge } from './flow/VibrantEdge';
import { v4 as uuidv4 } from 'uuid';
import { SOCKET_CONFIG } from '@/lib/railgun-flow';
import { NodeSchemaRegistry } from '@/lib/registries/NodeSchemaRegistry';
import type { ValidationIssue } from '@/lib/validation/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { ShortcutHelper } from './ShortcutHelper';
import { HelpCircle } from 'lucide-react';


interface OnSelectionChangeParams {
    nodes: any[];
    edges: any[];
}

// Initial nodes are empty, loaded from file
const initialRefNodes: any[] = [];

interface FlowEditorProps {
    projectPath?: string;
    filePath?: string;
    setStatus?: (s: string) => void;
    onSelectionChange?: (node: any | null, onUpdate?: (id: string, data: any) => void) => void;
    onValidationChange?: (issues: ValidationIssue[]) => void;
}

export default function FlowEditor({ projectPath, filePath, setStatus, onSelectionChange, onValidationChange }: FlowEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialRefNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { isElectron, files } = useElectron();
    const { screenToFlowPosition, updateNodeData } = useReactFlow();

    // Context Menu State
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const { settings } = useSettings();
    const lastSavedState = useRef<string>('');
    const { undo, redo, takeSnapshot, canUndo, canRedo, setInitialState } = useUndoRedo();
    const [clipboard, setClipboard] = useState<{ nodes: any[], edges: any[] } | null>(null);
    const { addNodes, addEdges, fitView } = useReactFlow();
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

    const nodeTypes = useMemo(() => ({ universal: UniversalNode }), []);


    const edgeTypes = useMemo(() => ({ vibrant: VibrantEdge }), []);

    // Validation
    const isValidConnection = useConnectionValidator();
    const { validate } = useGraphValidator();

    // Reconnection State
    const reconnectingEdgeId = useRef<string | null>(null);

    const onConnect = useCallback((params: Connection) => {
        // Find the color for the edge based on the source handle
        const sourceNode = nodes.find(n => n.id === params.source);
        const schema = sourceNode ? NodeSchemaRegistry.get(sourceNode.data._schemaId) : null;
        const output = schema?.outputs.find(o => o.key === params.sourceHandle);
        const config = output ? SOCKET_CONFIG[output.socketType] : SOCKET_CONFIG['Any'];

        setEdges((eds) => addEdge({
            ...params,
            type: 'vibrant',
            animated: config?.category === 'exec',
            data: { color: config?.connectionColor }
        }, eds));
        takeSnapshot();
    }, [setEdges, nodes, takeSnapshot]);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        reconnectingEdgeId.current = null;
        setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
        takeSnapshot();
    }, [setEdges, takeSnapshot]);


    const onReconnectStart = useCallback((_: any, edge: Edge) => {
        reconnectingEdgeId.current = edge.id;
    }, []);

    const onReconnectEnd = useCallback((_: any, edge: Edge) => {
        if (reconnectingEdgeId.current === edge.id) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            reconnectingEdgeId.current = null;
        }
    }, [setEdges]);

    const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.preventDefault();
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }, [setEdges]);

    // Graph Validation Effect (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const issues = validate(nodes, edges);

            // Map issues to nodes (simple finding first error for node)
            setNodes((nds) => nds.map(node => {
                const nodeIssue = issues.find((i: any) => i.nodeId === node.id);
                // Only update if changed to prevent loops
                if ((node.data.validationStatus !== (nodeIssue ? nodeIssue.severity : undefined)) ||
                    (node.data.validationMessage !== (nodeIssue ? nodeIssue.message : undefined))) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            validationStatus: nodeIssue ? nodeIssue.severity : undefined,
                            validationMessage: nodeIssue ? nodeIssue.message : undefined
                        }
                    };
                }
                return node;
            }));

            if (onValidationChange) {
                onValidationChange(issues);
            }

        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [nodes, edges, validate, setNodes, onValidationChange]); // Validate when topology or data changes

    // Context Menu Handlers
    const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
        event.preventDefault();
        // @ts-ignore - clientX exists on both
        setMenuPosition({ x: event.clientX, y: event.clientY });
    }, []);

    const onAddNode = useCallback((schemaId: string, position: { x: number; y: number }) => {
        const id = uuidv4();
        // Convert screen coordinates to flow coordinates
        const flowPos = screenToFlowPosition({ x: position.x, y: position.y });

        const newNode = {
            id,
            type: 'universal',
            position: flowPos,
            data: { _schemaId: schemaId } as BotNodeData
        };

        setNodes((nds) => nds.concat(newNode));
        setMenuPosition(null);
        takeSnapshot();
    }, [screenToFlowPosition, setNodes, takeSnapshot]);


    const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
        if (onSelectionChange) {
            const selectedNode = params.nodes[0];
            if (selectedNode) {
                const botNode = ReactFlowAdapter.toCompilerNode(selectedNode);
                onSelectionChange(botNode, (id: string, data: any) => {
                    updateNodeData(id, data);
                    // Defer snapshot slightly to allow state to settle
                    setTimeout(() => takeSnapshot(), 0);
                });
            } else {
                onSelectionChange(null);
            }
        }
    }, [onSelectionChange, updateNodeData, takeSnapshot]);


    // File Loading
    useEffect(() => {
        if (!projectPath || !filePath || !isElectron) return;

        const load = async () => {
            try {
                if (setStatus) setStatus('Loading...');
                const content = await files.read(projectPath, filePath);

                if (content) {
                    try {
                        const json = JSON.parse(content);
                        if (json.nodes && Array.isArray(json.nodes)) {
                            // Sanitize nodes to ensure they have positions and required React Flow properties
                            const sanitizedNodes = json.nodes.map((node: any, idx: number) => {
                                // Try to resolve schema ID from various potential sources
                                const data = node.data || {};
                                let resolvedSchemaId = data._schemaId || data.nodeType;

                                // If we don't have a direct hit, try to look up via registry fallback (mapped IDs)
                                if (resolvedSchemaId && !NodeSchemaRegistry.get(resolvedSchemaId)) {
                                    // The registry already has a legacy mapping dictionary in its .get() method
                                    // but we want to ensure we're storing the *new* technical ID if possible.
                                    const schema = NodeSchemaRegistry.get(resolvedSchemaId);
                                    if (schema) resolvedSchemaId = schema.id;
                                }

                                return {
                                    ...node,
                                    id: String(node.id || `node-${idx}`),
                                    type: node.type || 'universal',
                                    position: node.position || { x: 100, y: 100 + (idx * 160) },
                                    data: {
                                        ...data,
                                        _schemaId: resolvedSchemaId || 'unknown'
                                    }
                                };
                            });

                            setInitialState(sanitizedNodes, json.edges || []);
                            setNodes(sanitizedNodes);
                            setEdges(json.edges || []);
                            if (setStatus) setStatus('Ready');

                        } else {
                            // Empty or legacy file
                            setInitialState([], []);
                            setNodes([]);
                            setEdges([]);
                            if (setStatus) setStatus('New File');

                        }
                    } catch (parseErr) {
                        console.error("[FlowEditor] JSON parse failed", parseErr);
                        setNodes([]);
                        setEdges([]);
                        if (setStatus) setStatus('Load Error');
                    }
                } else {
                    // No content
                    setNodes([]);
                    setEdges([]);
                    if (setStatus) setStatus('Empty');
                }
            } catch (e) {
                console.error("[FlowEditor] Failed to load file", e);
                setNodes([]);
                setEdges([]);
                if (setStatus) setStatus('Load Error');
            }
        };
        load();
    }, [projectPath, filePath, isElectron, setNodes, setEdges, setStatus, files]);

    // Auto-Save Effect
    useEffect(() => {
        if (!settings.system.autoSave || !projectPath || !filePath || !isElectron) return;

        const currentState = JSON.stringify({ nodes, edges });

        // Skip if this is the initial load or no changes were made
        if (!lastSavedState.current) {
            lastSavedState.current = currentState;
            return;
        }

        if (currentState === lastSavedState.current) return;

        const timer = setTimeout(async () => {
            if (setStatus) setStatus('Auto-saving...');
            try {
                await files.save(projectPath, filePath, currentState);
                lastSavedState.current = currentState;
                if (setStatus) setStatus('Auto-saved');
                setTimeout(() => setStatus && setStatus('Ready'), 2000);
            } catch (e) {
                console.error("Auto-save failed", e);
                if (setStatus) setStatus('Save Error');
            }
        }, settings.system.autoSaveDelay || 1000);

        return () => clearTimeout(timer);
    }, [nodes, edges, settings.system.autoSave, settings.system.autoSaveDelay, projectPath, filePath, isElectron, files, setStatus]);

    const handleSave = async () => {

        if (!projectPath || !filePath || !isElectron) return;

        if (setStatus) setStatus('Saving...');
        try {
            const flowData = { nodes, edges };
            const content = JSON.stringify(flowData, null, 2);
            await files.save(projectPath, filePath, content);
            lastSavedState.current = JSON.stringify(flowData); // Update tracking
            if (setStatus) setStatus('Saved');
            setTimeout(() => setStatus && setStatus('Ready'), 2000);
        } catch (e) {

            console.error("Save failed", e);
            if (setStatus) setStatus('Save Error');
        }
    };

    const handleCompile = async () => {
        if (!projectPath || !filePath || !isElectron) return;
        if (setStatus) setStatus('Compiling...');

        try {
            // 1. Adapter: React Flow -> Virtual Rete
            const { nodes: reteNodes, connections: reteConnections } = ReactFlowAdapter.toCompilerData(nodes, edges);

            // 2. Compile
            let fileType: any = 'command';
            if (filePath.includes('slash')) fileType = 'slash_command';
            else if (filePath.includes('events')) fileType = 'event';

            const compiler = new Compiler({
                nodes: reteNodes,
                connections: reteConnections,
                fileType: fileType
            });

            const code = compiler.compile();
            console.log("[Flow Compiler] Generated Code:\n", code);

            // 3. Save JS
            let jsFilePath = filePath;
            if (jsFilePath.endsWith('.railgun')) jsFilePath = jsFilePath.replace('.railgun', '.js');
            else if (jsFilePath.endsWith('.railgun.json')) jsFilePath = jsFilePath.replace('.railgun.json', '.js');
            else jsFilePath = jsFilePath + '.js';

            // Utilize backend API directly if type definition is tricky
            // @ts-ignore
            const success = await window.electronAPI.saveFile(projectPath, jsFilePath, code);

            if (success) {
                if (setStatus) setStatus('Compiled Success');
                alert(`Compiled successfully to ${jsFilePath}`);
            } else {
                if (setStatus) setStatus('Compile Save Failed');
            }

        } catch (e: any) {
            console.error("Compilation failed", e);
            if (setStatus) setStatus(`Compile Error: ${e.message}`);
            alert(`Compilation Failed: ${e.message}`);
        }
    };

    const duplicateNodes = useCallback((nodesToDuplicate: any[]) => {
        if (nodesToDuplicate.length === 0) return;

        const newNodeIds = new Map();
        const duplicatedNodes = nodesToDuplicate.map((node) => {
            const newId = uuidv4();
            newNodeIds.set(node.id, newId);
            return {
                ...node,
                id: newId,
                position: { x: node.position.x + 30, y: node.position.y + 30 },
                selected: true,
            };
        });

        // Duplicate edges between selected nodes
        const selectedNodeIds = new Set(nodesToDuplicate.map((n) => n.id));
        const edgesToDuplicate = edges.filter(
            (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
        );

        const duplicatedEdges = edgesToDuplicate.map((edge) => ({
            ...edge,
            id: uuidv4(),
            source: newNodeIds.get(edge.source),
            target: newNodeIds.get(edge.target),
            selected: true,
        }));

        // Deselect current nodes
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
        setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));

        addNodes(duplicatedNodes);
        addEdges(duplicatedEdges);
        takeSnapshot();
    }, [edges, setNodes, setEdges, addNodes, addEdges, takeSnapshot]);

    const copyNodes = useCallback(() => {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length === 0) return;

        const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
        const selectedEdges = edges.filter(
            (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
        );

        setClipboard({ nodes: selectedNodes, edges: selectedEdges });
    }, [nodes, edges]);

    const pasteNodes = useCallback(() => {
        if (!clipboard) return;
        duplicateNodes(clipboard.nodes);
    }, [clipboard, duplicateNodes]);

    const selectAll = useCallback(() => {
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
        setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
    }, [setNodes, setEdges]);

    const zoomToFit = useCallback(() => {
        fitView({ padding: 0.2, duration: 400 });
    }, [fitView]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Avoid shortcuts when typing in inputs
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        handleSave();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) redo();
                        else undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        redo();
                        break;
                    case 'd':
                        e.preventDefault();
                        duplicateNodes(nodes.filter(n => n.selected));
                        break;
                    case 'c':
                        // Only capture if selection exists, otherwise let browser handle
                        if (nodes.some(n => n.selected)) {
                            e.preventDefault();
                            copyNodes();
                        }
                        break;
                    case 'v':
                        if (clipboard) {
                            e.preventDefault();
                            pasteNodes();
                        }
                        break;
                    case 'a':
                        e.preventDefault();
                        selectAll();
                        break;
                    case 'f':
                        if (e.shiftKey) {
                            e.preventDefault();
                            zoomToFit();
                        }
                        break;
                }
            } else if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setIsShortcutsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [projectPath, filePath, handleSave, undo, redo, nodes, duplicateNodes, copyNodes, pasteNodes, selectAll, zoomToFit, clipboard]);



    return (
        <div className="flex flex-col h-full w-full bg-[#141416]">
            {/* Toolbar (Breadcrumb Style) */}
            <div className="h-9 bg-[#171719] border-b border-zinc-800 flex items-center px-4 gap-4 justify-between shrink-0 z-20">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-800/50 transition-colors cursor-pointer text-zinc-400">
                        <span>{projectPath?.split(/[\\/]/).pop() || 'Project'}</span>
                    </div>
                    <span className="text-zinc-700">/</span>
                    {filePath ? filePath.split(/[\\/]/).map((part, i, arr) => (
                        <React.Fragment key={i}>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${i === arr.length - 1 ? 'text-blue-400 bg-blue-500/5' : 'hover:bg-zinc-800/50 hover:text-zinc-300 cursor-pointer'}`}>
                                <span>{part}</span>
                            </div>
                            {i < arr.length - 1 && <span className="text-zinc-700">/</span>}
                        </React.Fragment>
                    )) : (
                        <span className="text-zinc-500 italic px-2">Unsaved Blueprint</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center border-r border-zinc-800 pr-2 mr-2 gap-1">
                        <Button
                            onClick={() => undo()}
                            variant="ghost"
                            size="icon"
                            title="Undo (Ctrl+Z)"
                            disabled={!canUndo}
                            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400"
                        >
                            <Undo2 size={14} />
                        </Button>
                        <Button
                            onClick={() => redo()}
                            variant="ghost"
                            size="icon"
                            title="Redo (Ctrl+Y)"
                            disabled={!canRedo}
                            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400"
                        >
                            <Redo2 size={14} />
                        </Button>
                    </div>


                    <Button onClick={handleCompile} size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white gap-2 py-0 h-6 text-[10px] uppercase tracking-wider font-semibold border border-zinc-700 shadow-sm transition-all active:scale-95">
                        <Play size={10} fill="currentColor" />
                        Compile
                    </Button>

                    <Button
                        onClick={() => setIsShortcutsOpen(true)}
                        variant="ghost"
                        size="icon"
                        title="Keyboard Shortcuts (H)"
                        className="h-6 w-6 text-zinc-500 hover:text-zinc-300 ml-1"
                    >
                        <HelpCircle size={14} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDragStop={() => takeSnapshot()}
                    onNodesDelete={() => takeSnapshot()}
                    onEdgesDelete={() => takeSnapshot()}
                    onConnect={onConnect}


                    onReconnect={onReconnect}
                    onReconnectStart={onReconnectStart}
                    onReconnectEnd={onReconnectEnd}
                    onEdgeContextMenu={onEdgeContextMenu}
                    onNodeContextMenu={onPaneContextMenu}
                    onSelectionChange={handleSelectionChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    isValidConnection={isValidConnection}
                    onPaneContextMenu={onPaneContextMenu}
                    snapToGrid={settings.editor.snapToGrid}
                    snapGrid={[settings.editor.gridSize, settings.editor.gridSize]}
                    selectionOnDrag
                    panOnDrag={[1]}
                    onlyRenderVisibleElements={true}
                    proOptions={{ hideAttribution: true }}
                    defaultEdgeOptions={{
                        style: { strokeWidth: 2 },
                        interactionWidth: 20,
                        reconnectable: true
                    }}
                    fitView
                    className="bg-[#141416]"
                >
                    {settings.editor.showGrid && (
                        <Background variant={BackgroundVariant.Dots} gap={settings.editor.gridSize} size={1} color="#3f3f46" />
                    )}
                    <Controls showInteractive={false} position="bottom-right" />
                    {settings.editor.minimap && (
                        <MiniMap
                            nodeColor="#27272a"
                            pannable
                            zoomable
                            position="bottom-left"
                        />
                    )}

                    {menuPosition && (
                        <FlowContextMenu
                            position={menuPosition}
                            onClose={() => setMenuPosition(null)}
                            onAddNode={onAddNode}
                        />
                    )}

                    <ShortcutHelper
                        isOpen={isShortcutsOpen}
                        onClose={() => setIsShortcutsOpen(false)}
                    />
                </ReactFlow>
            </div>
        </div>
    );
}
