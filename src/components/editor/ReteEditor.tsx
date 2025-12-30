import { useEffect, useRef, useState, useCallback } from 'react';
import { createEditor } from '@/lib/defaultEditor';
import { Compiler } from '@/lib/compiler';
import { Button } from '@/components/ui/Button';
import { Play } from 'lucide-react';
import { BotNode, InputControl, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';
import { ContextMenu } from '@/components/editor/ContextMenu';
import { createNode } from '@/nodes';
import { AreaExtensions } from 'rete-area-plugin';
import { PropertyPanel } from '@/components/editor/PropertyPanel';

export function ReteEditor({ projectPath, filePath, setStatus }: { projectPath: string, filePath: string, setStatus?: (s: string) => void }) {

    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any>(null); // Store editor instance
    const areaRef = useRef<any>(null); // Store area instance
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const loading = useRef(false);
    const previousFilePath = useRef<string | null>(null);
    const currentFilePathRef = useRef(filePath);
    const projectPathRef = useRef(projectPath);

    // Keep refs updated
    useEffect(() => {
        currentFilePathRef.current = filePath;
        projectPathRef.current = projectPath;
    }, [filePath, projectPath]);

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 }); // Relative to container for node placement

    const [editorReady, setEditorReady] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    //@ts-ignore
    const [tick, setTick] = useState(0); // Force re-render on graph changes

    const selectedNode = editorRef.current?.getNodes().find((n: any) => n.id === selectedNodeId) || null;

    const saveGraph = async (pathOverride?: string, silent = false) => {
        if (!editorRef.current || !areaRef.current) return;

        const targetPath = pathOverride || filePath;
        if (!targetPath) return;

        if (!silent && !pathOverride && setStatus) setStatus('Saving...'); // Only show status for current file

        try {
            const nodes = editorRef.current.getNodes();
            const connections = editorRef.current.getConnections();

            const nodesWithPositions = nodes.map((n: any) => {
                const view = areaRef.current?.nodeViews.get(n.id);
                return {
                    ...n,
                    x: view?.position?.x || 0,
                    y: view?.position?.y || 0
                };
            });

            // @ts-ignore
            await window.electronAPI.saveFile(projectPathRef.current, targetPath, JSON.stringify({ nodes: nodesWithPositions, connections }, null, 2));

            if (!silent && !pathOverride && setStatus) setStatus('Saved');
            if (!pathOverride) {
                setTimeout(() => {
                    if (setStatus) setStatus('Ready');
                }, 2000);
            }

        } catch (e) {
            console.error("Autosave failed", e);
            if (setStatus) setStatus('Save Error');
        }
    };

    const triggerSave = useCallback(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        if (setStatus) setStatus('Unsaved changes...');

        saveTimeout.current = setTimeout(() => {
            saveGraph();
        }, 1000);
    }, [setStatus]); // Removed projectPath and filePath from deps to prevent recreating hook

    useEffect(() => {
        if (!containerRef.current) return;

        let cleanup: (() => void) | undefined;

        const init = async () => {
            if (editorRef.current) return;

            try {
                const res = await createEditor(containerRef.current!, (nodeId) => {
                    setSelectedNodeId(nodeId);
                });

                editorRef.current = res.editor;
                areaRef.current = res.area;
                cleanup = res.destroy;

                editorRef.current.addPipe((context: any) => {
                    if (
                        context.type === 'connectioncreated' ||
                        context.type === 'connectionremoved' ||
                        context.type === 'nodecreated' ||
                        context.type === 'noderemoved'
                    ) {
                        if (!loading.current) {
                            triggerSave();
                            setTick(t => t + 1);
                        }
                    }
                    return context;
                });

                areaRef.current.addPipe((context: any) => {
                    if (context.type === 'nodetranslated') {
                        if (!loading.current) triggerSave();
                    }
                    return context;
                });

                setEditorReady(true);
            } catch (e) {
                console.error(e);
            }
        };

        init();

        return () => {
            setEditorReady(false);
            if (cleanup) cleanup();
            editorRef.current = null;
            areaRef.current = null;
        }
    }, []);

    useEffect(() => {
        const loadGraph = async () => {
            if (previousFilePath.current && previousFilePath.current !== filePath && editorRef.current) {
                console.log(`Switching files: Saving ${previousFilePath.current} before loading ${filePath}`);

                if (saveTimeout.current) {
                    clearTimeout(saveTimeout.current);
                    saveTimeout.current = null;
                }

                await saveGraph(previousFilePath.current, true);
            }
            previousFilePath.current = filePath;

            if (!editorReady || !editorRef.current || !areaRef.current || !filePath || !projectPath) return;

            console.log(`Loading graph from: ${filePath}`);
            loading.current = true;

            try {
                const existingConnections = [...editorRef.current.getConnections()];
                for (const c of existingConnections) {
                    await editorRef.current.removeConnection(c.id);
                }

                const existingNodes = [...editorRef.current.getNodes()];
                for (const n of existingNodes) {
                    await editorRef.current.removeNode(n.id);
                }

                // @ts-ignore
                const content = await window.electronAPI.readFile(projectPath, filePath);
                if (content) {
                    const data = JSON.parse(content);
                    const nodeMap = new Map<string, BotNode>();

                    for (const n of data.nodes) {
                        let node = createNode(n.label);
                        if (!node) {
                            node = new BotNode(n.label, n.category || 'Action');
                        }
                        node.id = n.id;

                        if (n.label === 'On Command' && n.controls?.args) {
                            try {
                                const args = JSON.parse(n.controls.args.value);
                                if (Array.isArray(args)) {
                                    args.forEach((arg: string, i: number) => {
                                        node.addOutput(`arg_${i}`, new ClassicPreset.Output(Sockets.Any, arg)); // Display label
                                    });
                                }
                            } catch (e) {
                                console.error("Failed to hydrate args", e);
                            }
                        }

                        if (n.controls) {
                            for (const [key, controlData] of Object.entries(n.controls)) {
                                // @ts-ignore
                                if (node.controls[key]) {
                                    // @ts-ignore
                                    node.controls[key].setValue(controlData.value);
                                } else {
                                    // @ts-ignore
                                    node.addControl(key, new InputControl(controlData.value, key));
                                }
                            }
                        }

                        await editorRef.current.addNode(node as any);
                        nodeMap.set(n.id, node);

                        if ((n as any).data) {
                            node.data = (n as any).data;
                        }

                        if (typeof n.x === 'number' && typeof n.y === 'number') {
                            await areaRef.current.translate(node.id, { x: n.x, y: n.y });
                        }
                    }

                    for (const c of data.connections) {
                        const source = nodeMap.get(c.source);
                        const target = nodeMap.get(c.target);
                        if (source && target) {
                            await editorRef.current.addConnection(
                                new ClassicPreset.Connection(source as any, c.sourceOutput, target as any, c.targetInput)
                            );
                        }
                    }

                    const hasPositions = data.nodes.some((n: any) => typeof n.x === 'number');
                    if (!hasPositions && data.nodes.length > 0) {
                        await AreaExtensions.simpleNodesOrder(areaRef.current);
                    }

                    await AreaExtensions.zoomAt(areaRef.current, editorRef.current.getNodes());
                }
            } catch (e) {
                console.error("Failed to load/parse graph", e);
            } finally {
                loading.current = false;
            }
        };

        loadGraph();
    }, [editorReady, filePath, projectPath]);

    const handleCompile = async () => {
        if (!editorRef.current || !areaRef.current) return;

        try {
            await saveGraph();

            const nodes = editorRef.current.getNodes();
            const connections = editorRef.current.getConnections();

            let code = '';
            // Force usage of new AST Compiler
            const compiler = new Compiler({
                nodes,
                connections,
                // Determine file type based on file path or content if possible, defaults to command
                fileType: filePath.includes('slash') ? 'slash_command' : 'command'
            });
            code = compiler.compile();

            console.log("Generated Code:", code);

            let jsFilePath = currentFilePathRef.current;
            if (jsFilePath.endsWith('.railgun.json')) {
                jsFilePath = jsFilePath.replace('.railgun.json', '.js');
            } else if (jsFilePath.endsWith('.botm.json')) {
                jsFilePath = jsFilePath.replace('.botm.json', '.js');
            } else {
                jsFilePath = jsFilePath + '.js';
            }

            // @ts-ignore
            const compiledSuccess = await window.electronAPI.saveFile(projectPathRef.current, jsFilePath, code);

            if (compiledSuccess) {
                alert(`Successfully compiled and saved to ${jsFilePath}`);
            } else {
                alert('Failed to save file. Check console for details.');
            }

        } catch (e: any) {
            console.error(e);
            alert(`Compilation Failed: ${e.message}`);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMenuPosition({ x: e.clientX, y: e.clientY });
        setClickPosition({ x, y });
        setMenuVisible(true);
    };

    const handleCloseMenu = () => {
        setMenuVisible(false);
    };

    const handleAddNode = async (label: string) => {
        if (!editorRef.current || !areaRef.current) return;

        const node = createNode(label);
        if (node) {
            const transform = areaRef.current.area.transform;
            const x = (clickPosition.x - transform.x) / transform.k;
            const y = (clickPosition.y - transform.y) / transform.k;

            await editorRef.current.addNode(node as any);
            await areaRef.current.translate(node.id, { x, y });
        }
        setMenuVisible(false);
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Toolbar */}
            <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-4 justify-between shrink-0">
                <div className="text-zinc-400 text-sm font-medium">
                    {filePath || 'Unsaved Blueprint'}
                </div>
                <Button onClick={handleCompile} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white gap-2 py-0 h-7 text-xs font-normal border border-blue-500/50">
                    <Play size={12} fill="currentColor" />
                    Compile
                </Button>
            </div>

            {/* Main Workspace Area (Canvas + Property Panel) */}
            <div className="flex-1 flex overflow-hidden">

                {/* Canvas */}
                <div className="flex-1 relative bg-[#1a1a1d] min-w-0">
                    <div
                        ref={containerRef}
                        className="absolute inset-0 w-full h-full rete-background"
                        onContextMenu={handleContextMenu}
                        onClick={handleCloseMenu}
                    />

                    {menuVisible && (
                        <ContextMenu
                            x={menuPosition.x}
                            y={menuPosition.y}
                            onClose={handleCloseMenu}
                            onSelect={handleAddNode}
                        />
                    )}
                </div>

                {/* Property Panel */}
                <PropertyPanel
                    node={selectedNode}
                    editor={editorRef.current}
                    onClose={() => setSelectedNodeId(null)}
                    onNodeUpdate={() => {
                        if (selectedNode && areaRef.current) {
                            areaRef.current.update('node', selectedNode.id);
                        }
                        setTick(t => t + 1);
                    }}
                />
            </div>
        </div>
    );
}
