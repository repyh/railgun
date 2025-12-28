import { createRoot } from 'react-dom/client';
import { NodeEditor, type GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { ReactPlugin, Presets as ReactPresets } from 'rete-react-plugin';
import { CustomNode } from '@/components/editor/CustomNode';
import { CustomSocket } from '@/components/editor/CustomSocket';
import { InputControl } from '@/components/editor/InputControl';


// Use generic node type for Schemes to avoid plugin type errors
export type Schemes = GetSchemes<ClassicPreset.Node, ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>>;
export type AreaExtra = ReactPlugin<Schemes, any>;

export async function createEditor(
    container: HTMLElement,
    onSelectionChange?: (nodeId: string | null) => void
) {
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

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

    connection.addPreset(ConnectionPresets.classic.setup());

    editor.use(area);
    // @ts-ignore
    area.use(connection);
    area.use(render);

    AreaExtensions.selectableNodes(area, selector, { accumulating });

    console.log("Plugins registered. Database ready.");

    AreaExtensions.simpleNodesOrder(area);

    // Delete handler (Keyboard)
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Delete' || e.code === 'Backspace') {
            const nodes = editor.getNodes();
            for (const n of nodes) {
                // @ts-ignore
                if (selector.isSelected(n.id)) {
                    editor.removeNode(n.id);
                }
            }

            const connections = editor.getConnections();
            for (const c of connections) {
                // @ts-ignore
                if (selector.isSelected(c.id)) {
                    editor.removeConnection(c.id);
                }
            }
        }
    };
    document.addEventListener('keydown', onKeyDown);

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

    // @ts-ignore
    area.addPipe((context) => {
        //@ts-ignore
        if (context.type === 'nodepicked' || context.type === 'nodedragged') {
            const pickedId = context.data.id;
            // console.log("Picked/Dragged:", pickedId);

            setTimeout(() => {
                if (onSelectionChange) {
                    //@ts-ignore
                    const isSelected = selector.isSelected(pickedId);
                    if (isSelected) {
                        onSelectionChange(pickedId);
                    } else {
                        onSelectionChange(pickedId);
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
                    if (onSelectionChange) onSelectionChange(selected.id);
                } else {
                    if (onSelectionChange) onSelectionChange(null);
                }
            }, 200);
        }

        return context;
    });

    return {
        destroy: () => {
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('delete-node', onDeleteNode);
            area.destroy();
        },
        editor: editor as any,
        area // Expose area for coordinate conversion
    };
}
