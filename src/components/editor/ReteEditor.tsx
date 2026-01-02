import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createEditor } from '@/lib/defaultEditor';
import { Compiler } from '@/lib/compiler';
import { GraphValidator } from '@/lib/validation/GraphValidator';
import type { ValidationIssue } from '@/lib/validation/types';
import { Button } from '@/components/ui/Button';
import { Play, Undo2, Redo2, AlertCircle } from 'lucide-react';
import { BotNode, InputControl, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';
import { ContextMenu } from '@/components/editor/ContextMenu';

import { nodeRegistry } from '@/lib/registries/NodeRegistry';
import { AreaExtensions } from 'rete-area-plugin';
import { useElectron } from '@/hooks/useElectron';
import { PropertyPanel } from '@/components/editor/PropertyPanel';
import { ProblemsPanel } from '@/components/editor/ProblemsPanel';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';

import { useSettings } from '@/contexts/SettingsContext';

export function ReteEditor({ projectPath, filePath, setStatus }: { projectPath: string, filePath: string, setStatus?: (s: string) => void }) {
    const { settings } = useSettings();
    const settingsRef = useRef(settings);

    useEffect(() => {
        settingsRef.current = settings;
        if (containerRef.current) {
            containerRef.current.style.setProperty('--grid-size', `${settings.editor?.gridSize || 40}px`);
            const gridColor = settings.editor?.showGrid ? '#2a2a2e' : 'transparent';
            containerRef.current.style.setProperty('--grid-color', gridColor);

            // Handle minimap visibility via CSS class
            containerRef.current.classList.toggle('minimap-hidden', !settings.editor?.minimap);
        }
    }, [settings]);

    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any>(null); // Store editor instance
    const areaRef = useRef<any>(null); // Store area instance
    const editorInstanceRef = useRef<any>(null); // Store full editor return object (undo/redo/selector)

    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const loading = useRef(false);
    const previousFilePath = useRef<string | null>(null);
    const currentFilePathRef = useRef(filePath);
    const projectPathRef = useRef(projectPath);

    // Use useElectron hook
    const { isElectron, files } = useElectron();

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

    // Validation State
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [showProblems, setShowProblems] = useState(true);
    const validationTimeout = useRef<NodeJS.Timeout | null>(null);

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

            if (isElectron) {
                await files.save(projectPathRef.current, targetPath, JSON.stringify({ nodes: nodesWithPositions, connections }, null, 2));
            } else {
                // Fallback for non-Electron environments (e.g., web)
                console.log("Saving to local storage (mock) for non-Electron environment.");
                localStorage.setItem(`graph-${projectPathRef.current}-${targetPath}`, JSON.stringify({ nodes: nodesWithPositions, connections }, null, 2));
            }

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

    const triggerSave = useCallback((force = false) => {
        if (!settingsRef.current.system?.autoSave && !force) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        if (setStatus) setStatus('Unsaved changes...');

        saveTimeout.current = setTimeout(() => {
            saveGraph();
        }, settingsRef.current.system?.autoSaveDelay || 1000);
    }, [setStatus, filePath, projectPath, isElectron, files]);

    // Graph Validation Effect
    useEffect(() => {
        if (!editorRef.current) return;

        if (validationTimeout.current) clearTimeout(validationTimeout.current);

        validationTimeout.current = setTimeout(() => {
            try {
                const nodes = editorRef.current.getNodes();
                const connections = editorRef.current.getConnections();

                // Run Validation
                const validator = new GraphValidator(nodes, connections);
                const issues = validator.validate();
                setValidationIssues(issues);

                // Update node visuals
                if (areaRef.current) {
                    nodes.forEach((n: any) => {
                        const view = areaRef.current.nodeViews.get(n.id);
                        if (view) {
                            const nodeIssues = issues.filter(i => i.nodeId === n.id);
                            const hasError = nodeIssues.some(i => i.severity === 'error');
                            const hasWarning = nodeIssues.some(i => i.severity === 'warning');

                            // Basic class toggling
                            if (hasError) {
                                view.element.classList.add('node-error');
                                view.element.classList.remove('node-warning');
                            } else if (hasWarning) {
                                view.element.classList.add('node-warning');
                                view.element.classList.remove('node-error');
                            } else {
                                view.element.classList.remove('node-error');
                                view.element.classList.remove('node-warning');
                            }
                        }
                    });
                }
            } catch (e) {
                console.error("Validation failed", e);
            }

        }, 500); // 500ms debounce

    }, [tick, editorRef.current]);

    // Handle Window Blur (Auto-save on window lose focus)
    useEffect(() => {
        const handleBlur = () => {
            if (settingsRef.current.system?.autoSave) {
                if (saveTimeout.current) clearTimeout(saveTimeout.current);
                saveGraph(undefined, true); // Silent save
            }
        };

        const handleGlobalSave = () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            saveGraph(undefined, false); // Manual save
        };

        const handleGlobalUndo = () => {
            if (editorInstanceRef.current && editorInstanceRef.current.undo) {
                editorInstanceRef.current.undo();
            }
        };

        const handleGlobalRedo = () => {
            if (editorInstanceRef.current && editorInstanceRef.current.redo) {
                editorInstanceRef.current.redo();
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('railgun:save', handleGlobalSave);
        window.addEventListener('railgun:save-all', handleGlobalSave); // Treat same as save for now
        window.addEventListener('railgun:undo', handleGlobalUndo);
        window.addEventListener('railgun:redo', handleGlobalRedo);
        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('railgun:save', handleGlobalSave);
            window.removeEventListener('railgun:save-all', handleGlobalSave);
            window.removeEventListener('railgun:undo', handleGlobalUndo);
            window.removeEventListener('railgun:redo', handleGlobalRedo);
        };
    }, [filePath, projectPath, isElectron, files]);

    useEffect(() => {
        if (!containerRef.current) return;

        let cleanup: (() => void) | undefined;

        const init = async () => {
            if (editorRef.current) return;

            try {
                const res = await createEditor(containerRef.current!, {
                    onSelectionChange: (nodeId: string | null) => {
                        setSelectedNodeId(nodeId);
                    },
                    getSnapSettings: () => {
                        return {
                            snap: settingsRef.current.editor?.snapToGrid ?? false,
                            gridSize: settingsRef.current.editor?.gridSize ?? 40
                        };
                    }
                });

                editorInstanceRef.current = {
                    ...res,
                    save: () => saveGraph(undefined, false)
                };
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
            editorInstanceRef.current = null;
        }
    }, []); // Removed triggerSave to prevent infinite re-initialization loop

    // Use centralized shortcuts hook
    useEditorShortcuts(editorInstanceRef.current, editorReady);

    // ... Hydration useEffect (Unchanged) ...
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

                let content = null;
                if (isElectron) {
                    content = await files.read(projectPath, filePath);
                } else {
                    content = localStorage.getItem(`graph-${projectPath}-${filePath}`);
                }

                if (content && content.trim() !== '') {
                    let data;
                    try {
                        data = JSON.parse(content);
                    } catch (err) {
                        console.error("[ReteEditor] JSON Parse Error:", err);
                        return;
                    }

                    const nodeMap = new Map<string, BotNode>();

                    if (!data.nodes) {
                        console.warn("[ReteEditor] No nodes property in data!");
                        data.nodes = [];
                    }

                    for (const n of data.nodes) {
                        // Use Registry
                        let node: BotNode | null = null;

                        // Try to find by explicit nodeType (from data) first, then fallback to label
                        // This handles cases where the visual label (n.label) has been customized by the user
                        const registryKey = (n as any).data?.nodeType || n.label;
                        const def = nodeRegistry.get(registryKey);
                        if (def) {
                            node = def.factory();
                        } else {
                            // Fallback for unknown nodes? Or generic handling
                            node = new BotNode(n.label, n.category || 'Action');
                        }
                        node.id = n.id;

                        const isLegacyCommand = n.label === 'On Command' || (n as any).data?.nodeType === 'On Command';

                        if (isLegacyCommand) {
                            // Support new metadata-based named arguments
                            if ((n as any).data?.args) {
                                const args = (n as any).data.args;
                                console.log('[ReteEditor] Hydrating legacy command args:', args);
                                if (Array.isArray(args)) {
                                    args.forEach((argName: string) => {
                                        // @ts-ignore
                                        if (!node.outputs[argName]) {
                                            // @ts-ignore
                                            node.addOutput(argName, new ClassicPreset.Output(Sockets.Any, argName));
                                        }
                                    });
                                }
                            } else if (n.controls?.args) {
                                // Fallback for older projects using JSON in controls
                                try {
                                    const args = JSON.parse(n.controls.args.value);
                                    if (Array.isArray(args)) {
                                        args.forEach((arg: string, i: number) => {
                                            // @ts-ignore
                                            node.addOutput(`arg_${i}`, new ClassicPreset.Output(Sockets.Any, arg));
                                        });
                                    }
                                } catch (e) {
                                    console.error("Failed to hydrate legacy args", e);
                                }
                            }
                        }

                        if (n.label === 'On Slash Command' && (n as any).data?.options) {
                            try {
                                const options = (n as any).data.options;
                                if (Array.isArray(options)) {
                                    options.forEach((opt: any) => {
                                        // @ts-ignore
                                        if (!node.outputs[opt.name]) {
                                            // @ts-ignore
                                            node.addOutput(opt.name, new ClassicPreset.Output(Sockets.Any, `${opt.name} (${opt.type})`));
                                        }
                                    });
                                }
                            } catch (e) {
                                console.error("Failed to hydrate slash command options", e);
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
            if (jsFilePath.endsWith('.railgun')) {
                jsFilePath = jsFilePath.replace('.railgun', '.js');
            } else if (jsFilePath.endsWith('.railgun.json')) {
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

    const handleJumpToNode = async (nodeId: string) => {
        if (!editorRef.current || !areaRef.current) return;
        const node = editorRef.current.getNode(nodeId);
        if (node) {
            await AreaExtensions.zoomAt(areaRef.current, [node]);
            setSelectedNodeId(nodeId);
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

        const def = nodeRegistry.get(label);
        const node = def ? def.factory() : null;

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
            {/* Toolbar (Breadcrumb Style) */}
            <div className="h-9 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-4 gap-4 justify-between shrink-0">
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
                    {/* Problems Toggle */}
                    <Button
                        onClick={() => setShowProblems(!showProblems)}
                        variant="ghost"
                        size="icon"
                        className={`h-6 px-2 gap-1.5 text-xs font-medium ${validationIssues.length > 0 ? 'text-red-400 hover:text-red-300' : 'text-zinc-500'}`}
                        title="Toggle Problems View"
                    >
                        <AlertCircle size={12} />
                        {validationIssues.length > 0 && <span>{validationIssues.length}</span>}
                    </Button>

                    <div className="flex items-center border-r border-zinc-800 pr-2 mr-2 gap-1">
                        <Button
                            onClick={() => editorInstanceRef.current?.undo()}
                            variant="ghost"
                            size="icon"
                            title="Undo (Ctrl+Z)"
                            className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
                        >
                            <Undo2 size={14} />
                        </Button>
                        <Button
                            onClick={() => editorInstanceRef.current?.redo()}
                            variant="ghost"
                            size="icon"
                            title="Redo (Ctrl+Y)"
                            className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
                        >
                            <Redo2 size={14} />
                        </Button>
                    </div>

                    <Button onClick={handleCompile} size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white gap-2 py-0 h-6 text-[10px] uppercase tracking-wider font-semibold border border-zinc-700 shadow-sm transition-all active:scale-95">
                        <Play size={10} fill="currentColor" />
                        Compile
                    </Button>
                </div>
            </div>

            {/* Main Workspace Area (Canvas + Property Panel) */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Canvas */}
                <div className="flex-1 relative bg-[#1a1a1d] min-w-0 flex flex-col">
                    <div className="flex-1 relative">
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

                    {/* Problems Panel Integration */}
                    {showProblems && (
                        <ProblemsPanel
                            issues={validationIssues}
                            isVisible={showProblems}
                            onClose={() => setShowProblems(false)}
                            onJumpToNode={handleJumpToNode}
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
