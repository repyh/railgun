import { NodeEditor, ClassicPreset } from 'rete';
import type { Schemes } from '../defaultEditor';
import { BotNode, Sockets } from '../railgun-rete';
import { nodeRegistry } from '../registries/NodeRegistry';

export class EditorOperations {
    private static CLIPBOARD_KEY = 'railgun-editor-clipboard';

    /**
     * Serializes provided nodes to clipboard
     */
    static async copy(area: any, nodesToCopy: BotNode[]) {
        if (nodesToCopy.length === 0) return;

        // Simplify nodes for serialization
        const data = nodesToCopy.map(node => {
            const view = area.nodeViews.get(node.id);
            return {
                label: node.label,
                category: (node as any).category,
                data: (node as any).data,
                x: view?.position?.x || 0,
                y: view?.position?.y || 0,
                // Grab current values from controls
                controls: Object.entries(node.controls).map(([key, ctrl]) => ({
                    key,
                    value: (ctrl as any).value
                }))
            };
        });

        const serialized = JSON.stringify(data);

        try {
            await navigator.clipboard.writeText(serialized);
        } catch (e) {
            console.warn("Navigator clipboard failed, using localStorage fallback", e);
            localStorage.setItem(this.CLIPBOARD_KEY, serialized);
        }
    }

    /**
     * Pastes nodes from the clipboard into the editor.
     */
    static async paste(editor: NodeEditor<Schemes>, area: any, selector: any, shift = { x: 50, y: 50 }) {
        let content = '';
        try {
            content = await navigator.clipboard.readText();
        } catch (e) {
            content = localStorage.getItem(this.CLIPBOARD_KEY) || '';
        }

        if (!content) return;

        // HEURISTIC: Check if content looks like our JSON
        if (!content.trim().startsWith('[') || !content.trim().endsWith(']')) return;

        try {
            const nodeDatas = JSON.parse(content);
            if (!Array.isArray(nodeDatas)) return;

            // Clear current selection
            editor.getNodes().forEach(n => selector.unselect(n.id));

            for (const data of nodeDatas) {
                const newNode = await this.createNodeFromData(data);
                if (!newNode) continue;

                await editor.addNode(newNode);

                // Use stored position with shift
                const targetX = (data.x ?? 0) + shift.x;
                const targetY = (data.y ?? 0) + shift.y;

                await area.translate(newNode.id, { x: targetX, y: targetY });

                selector.add(newNode.id, true);
            }
        } catch (err) {
            console.error("Paste Error:", err);
        }
    }

    /**
     * Duplicates provided nodes with an offset.
     */
    static async duplicate(
        editor: NodeEditor<Schemes>,
        area: any,
        selector: any,
        nodesToDuplicate: BotNode[]
    ) {
        if (nodesToDuplicate.length === 0) return;

        // Unselect originals
        nodesToDuplicate.forEach(n => selector.unselect(n.id));

        for (const oldNode of nodesToDuplicate) {
            const data = {
                label: oldNode.label,
                category: (oldNode as any).category,
                data: (oldNode as any).data,
                controls: Object.entries(oldNode.controls).map(([key, ctrl]) => ({
                    key,
                    value: (ctrl as any).value
                }))
            };

            const newNode = await this.createNodeFromData(data);
            if (!newNode) continue;

            await editor.addNode(newNode);

            const view = area.nodeViews.get(oldNode.id);
            if (view) {
                await area.translate(newNode.id, {
                    x: view.position.x + 40,
                    y: view.position.y + 40
                });
            }

            selector.add(newNode.id, true);
        }
    }

    /**
     * Deletes provided nodes and their connections.
     */
    static async delete(
        editor: NodeEditor<Schemes>,
        selector: any,
        nodesToDelete: BotNode[]
    ) {
        for (const n of nodesToDelete) {
            await editor.removeNode(n.id);
        }

        const connections = editor.getConnections();
        for (const c of connections) {
            if (selector.isSelected(c.id)) {
                await editor.removeConnection(c.id);
            }
        }
    }

    private static async createNodeFromData(data: any): Promise<BotNode | null> {
        const registryKey = data.data?.nodeType || data.label;
        const def = nodeRegistry.get(registryKey);

        let newNode: BotNode;
        if (def) {
            newNode = def.factory();
        } else {
            newNode = new BotNode(data.label, data.category || 'Action');
        }

        // Copy Data
        if (data.data) {
            newNode.data = JSON.parse(JSON.stringify(data.data));
        }

        // Copy Control values
        if (data.controls) {
            data.controls.forEach((c: any) => {
                if (newNode.controls[c.key]) {
                    // @ts-ignore
                    newNode.controls[c.key].setValue(c.value);
                }
            });
        }

        // Re-hydrate dynamic outputs
        this.hydrateDynamicPorts(newNode, registryKey);

        return newNode;
    }

    private static hydrateDynamicPorts(node: BotNode, key: string) {
        if (key === 'On Command' || (node.data as any)?.nodeType === 'On Command') {
            const args = (node.data as any)?.args || [];
            args.forEach((argName: string) => {
                // @ts-ignore
                if (!node.outputs[argName]) {
                    // @ts-ignore
                    node.addOutput(argName, new ClassicPreset.Output(Sockets.Any, argName));
                }
            });
        }

        if (key === 'On Slash Command') {
            const options = (node.data as any)?.options || [];
            options.forEach((opt: any) => {
                // @ts-ignore
                if (!node.outputs[opt.name]) {
                    // @ts-ignore
                    node.addOutput(opt.name, new ClassicPreset.Output(Sockets.Any, `${opt.name} (${opt.type})`));
                }
            });
        }
    }
}
