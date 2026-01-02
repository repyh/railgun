import { createRoot } from 'react-dom/client';
import { NodeEditor, type GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { ReactPlugin, Presets as ReactPresets } from 'rete-react-plugin';
import { HistoryPlugin, Presets as HistoryPresets } from 'rete-history-plugin';
import { MinimapPlugin } from 'rete-minimap-plugin';

import { CustomNode } from '@/components/editor/CustomNode';
import { CustomSocket } from '@/components/editor/CustomSocket';
import { CustomConnection } from '@/components/editor/CustomConnection';
import { InputControl } from '@/components/editor/InputControl';
import { BotNode, setGlobalEditor, getSocketConfig } from '@/lib/railgun-rete';
import { EditorOperations } from './editor/EditorOperations';


export type Schemes = GetSchemes<BotNode, ClassicPreset.Connection<BotNode, BotNode>>;
export type AreaExtra = ReactPlugin<Schemes, any>;

export async function createEditor(
    container: HTMLElement,
    options?: {
        onSelectionChange?: (nodeId: string | null) => void;
        getSnapSettings?: () => { snap: boolean; gridSize: number };
    }
) {
    const editor = new NodeEditor<Schemes>();
    setGlobalEditor(editor);
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    // @ts-ignore
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

    // Extensions
    const history = new HistoryPlugin<Schemes>();
    history.addPreset(HistoryPresets.classic.setup());

    const minimap = new MinimapPlugin<Schemes>({
        boundViewport: true
    });

    const selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();

    // Register Custom Custom Connection
    // @ts-ignore
    render.addPreset(ReactPresets.classic.setup({
        customize: {
            node: () => CustomNode as any,
            socket: () => CustomSocket as any, // Cast to any to avoid strict Rete type mismatch if existing
            control: (data: any) => {
                if (data.payload instanceof InputControl) return InputControl;
                return InputControl as any;
            }
        }
    }));

    render.addPreset(ReactPresets.minimap.setup({
        size: 200,
    }) as any);

    connection.addPreset(ConnectionPresets.classic.setup() as any);

    editor.use(area);
    // @ts-ignore
    area.use(connection);
    area.use(render);
    // @ts-ignore
    area.use(history);
    // @ts-ignore
    area.use(minimap);

    AreaExtensions.selectableNodes(area, selector, { accumulating });

    console.log("Plugins registered. Database ready. Selector Helper Available.");

    AreaExtensions.simpleNodesOrder(area);

    // Delete handler (Keyboard) managed by useEditorShortcuts hook
    // const onKeyDown = (e: KeyboardEvent) => { ... } removed to avoid duplication


    // Delete handler (Custom Event from UI)
    const onDeleteNode = async (e: any) => {
        const nodeId = e.detail?.nodeId;
        console.log("Delete Request for:", nodeId);
        if (nodeId) {
            // Explicitly remove all connections linked to this node first
            const connections = editor.getConnections();
            for (const c of connections) {
                if (c.source === nodeId || c.target === nodeId) {
                    await editor.removeConnection(c.id);
                }
            }
            await editor.removeNode(nodeId);
        }
    };
    window.addEventListener('delete-node', onDeleteNode);

    // Zoom to fit (or center zero)
    setTimeout(() => {
        AreaExtensions.zoomAt(area, editor.getNodes());
    }, 100);

    // STRICT CONNECTION VALIDATION (Editor Logic)
    editor.addPipe((context) => {
        if (context.type === 'connectioncreate') {
            const { source, sourceOutput, target, targetInput } = context.data;
            const sourceNode = editor.getNode(source);
            const targetNode = editor.getNode(target);

            if (sourceNode && targetNode) {
                const outputSocket = sourceNode.outputs[sourceOutput]?.socket;
                const inputSocket = targetNode.inputs[targetInput]?.socket;

                if (outputSocket && inputSocket) {
                    const sourceConfig = getSocketConfig(outputSocket.name);
                    const targetConfig = getSocketConfig(inputSocket.name);

                    if (sourceConfig.category !== targetConfig.category) {
                        return; // Block connection by returning undefined
                    }
                }
            }
        }
        return context;
    });

    // @ts-ignore
    area.addPipe((context) => {
        //@ts-ignore
        if (context.type === 'nodepicked' || context.type === 'nodedragged') {
            const pickedId = context.data.id;
            // console.log("Picked/Dragged:", pickedId);

            setTimeout(() => {
                if (options?.onSelectionChange) {
                    //@ts-ignore
                    const isSelected = selector.isSelected(pickedId);
                    if (isSelected) {
                        options.onSelectionChange(pickedId);
                    } else {
                        options.onSelectionChange(pickedId);
                    }
                }
            }, 50);
        }

        //@ts-ignore
        if (context.type === 'pointerdown') {
            setTimeout(() => {
                const nodes = editor.getNodes();
                // @ts-ignore
                const selected = nodes.find(n => selector.isSelected(n.id));

                if (selected) {
                    console.log("[defaultEditor] Selection detected via pipe:", selected.id);
                    if (options?.onSelectionChange) options.onSelectionChange(selected.id);
                } else {
                    console.log("[defaultEditor] No selection detected via pipe");
                    if (options?.onSelectionChange) options.onSelectionChange(null);
                }
            }, 200);
        }

        // @ts-ignore
        if (context.type === 'nodetranslated') {
            const { id, position } = context.data;
            const snapSettings = options?.getSnapSettings ? options.getSnapSettings() : { snap: false, gridSize: 40 };

            if (snapSettings.snap) {
                const { gridSize } = snapSettings;
                const x = Math.round(position.x / gridSize) * gridSize;
                const y = Math.round(position.y / gridSize) * gridSize;

                if (x !== position.x || y !== position.y) {
                    area.translate(id, { x, y });
                    return; // Stop propagation of original event to prevent jitter
                }
            }
        }
        return context;
    });

    return {
        destroy: () => {
            // document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('delete-node', onDeleteNode);
            area.destroy();
        },
        editor: editor as any,
        area, // Expose area for coordinate conversion
        undo: () => history.undo(),
        redo: () => history.redo(),
        // Encapsulate shortcut operations within the editor closure
        copy: async () => {
            const nodes = editor.getNodes();
            // @ts-ignore
            const selected = nodes.filter(n => selector.isSelected(n.id));
            await EditorOperations.copy(area, selected);
        },
        paste: async () => {
            await EditorOperations.paste(editor, area, selector);
        },
        duplicate: async () => {
            const nodes = editor.getNodes();
            // @ts-ignore
            const selected = nodes.filter(n => selector.isSelected(n.id));
            await EditorOperations.duplicate(editor, area, selector, selected);
        },
        delete: async () => {
            const nodes = editor.getNodes();
            // @ts-ignore
            const selected = nodes.filter(n => selector.isSelected(n.id));
            await EditorOperations.delete(editor, selector, selected);
        }
    };
}
