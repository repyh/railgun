import { BotNode } from '../railgun-rete';
import { InputResolver } from './InputResolver';
import { Registry } from './Registry';
import type { CompilerContext } from './interfaces';

/**
 * The NodeProcessor is responsible for traversing the node graph and generating code
 * by delegating to specific StatementGenerators registered in the Registry.
 */
export class NodeProcessor {

    //@ts-ignore
    constructor(private nodes: BotNode[], private connections: any[], private inputResolver: InputResolver) { }

    /**
     * Processes a single node and its subsequent connections recursively.
     * @param node The node to process.
     * @param indent Current indentation string.
     * @param ctx Compiler context including global variables and imports.
     * @returns The generated code string for this node and its children.
     */
    process(node: BotNode, indent: string, ctx: CompilerContext): string {
        let code = '';

        // Delegate to generator
        const generator = Registry.getStatement(node.codeType || node.label);
        if (generator) {
            code += generator(node, ctx, this);
        } else {
            code += `// No generator for ${node.label}\n`;
        }

        // Continue to next node connected via 'exec'
        const outConnections = this.connections.filter(c => c.source === node.id && (c.sourceOutput === 'exec' || c.sourceOutput === 'exec_out'));
        if (outConnections.length > 0) {
            const nextConn = outConnections[0];
            const nextNode = this.nodes.find(n => n.id === nextConn.target);
            if (nextNode) {
                code += this.process(nextNode, indent, ctx);
            }
        }

        return code;
    }

    // --- Helper Methods for Generators ---

    /**
     * Returns all connections in the graph.
     */
    getConnections() {
        return this.connections;
    }

    /**
     * Finds a connection associated with a specific node and socket key.
     * @param nodeId ID of the node.
     * @param key Key of the input or output socket.
     * @param type 'in' for input connections, 'out' for output connections.
     */
    findConnection(nodeId: string, key: string, type: 'in' | 'out' = 'out') {
        if (type === 'in') {
            return this.connections.find(c => c.target === nodeId && c.targetInput === key);
        }
        return this.connections.find(c => c.source === nodeId && c.sourceOutput === key);
    }

    /**
     * Retrieves a node by its ID.
     */
    getNode(nodeId: string) {
        return this.nodes.find(n => n.id === nodeId);
    }

    /**
     * Resolves the input value for a node's specific key using the InputResolver.
     * @param node The node instance.
     * @param key The input key to resolve.
     * @param ctx The compiler context.
     * @returns The resolved value as a code string.
     */
    resolveInput(node: BotNode, key: string, ctx: any) {
        return this.inputResolver.resolve(node, key, ctx);
    }
}
