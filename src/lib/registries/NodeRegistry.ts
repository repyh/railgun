import type { NodeDefinition } from './nodes/NodeDefinition';
import { DEFAULT_NODES } from '../../nodes/index';

class NodeRegistry {
    private nodes: Map<string, NodeDefinition> = new Map();

    constructor() {
        this.registerAll(DEFAULT_NODES);
    }

    register(def: NodeDefinition) {
        this.nodes.set(def.label, def);
    }

    registerAll(defs: NodeDefinition[]) {
        defs.forEach(def => this.register(def));
    }

    get(label: string): NodeDefinition | undefined {
        return this.nodes.get(label);
    }

    getAll(): NodeDefinition[] {
        return Array.from(this.nodes.values());
    }

    unregister(label: string) {
        this.nodes.delete(label);
    }
}

export const nodeRegistry = new NodeRegistry();
