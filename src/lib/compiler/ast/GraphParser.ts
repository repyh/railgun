import { BotNode } from '../../railgun-rete';
import * as AST from './types';
import { registry } from './nodes';
import type { ParserContext } from './nodes/ParserContext';

export class GraphParser implements ParserContext {
    nodes: BotNode[];
    connections: any[];

    // Map of Node ID to generated AST Node (for caching/reference)
    nodeMap: Map<string, AST.BaseNode> = new Map();

    constructor(nodes: BotNode[], connections: any[]) {
        this.nodes = nodes;
        this.connections = connections;
    }

    /**
     * Main Entry Point.
     * Converts the entire graph into a Program AST.
     */
    public parse(): AST.Program {
        const body: AST.Statement[] = [];

        // 1. Find all Event nodes (Entry Points)
        const eventNodes = this.nodes.filter(n => n.category === 'Event' || n.codeType === 'On Command' || n.codeType === 'On Slash Command');

        // 2. Process each event into a FunctionDeclaration (or equivalent structure)
        for (const eventNode of eventNodes) {
            const funcDecl = this.processEvent(eventNode);
            if (funcDecl) {
                body.push(funcDecl);
            }
        }

        // 3. Find Global Functions (Custom Functions)
        // TODO: Implement Custom Function parsing

        return {
            type: 'Program',
            body: body
        };
    }

    /**
     * Converts an Event Node into a special FunctionDeclaration.
     * In the AST, we treat Events as functions that the system calls.
     */
    private processEvent(node: BotNode): AST.FunctionDeclaration | null {
        const parser = registry.getEventParser(node.codeType, node.label);
        if (parser) {
            return parser.parse(node, this);
        }
        return null;
    }

    /**
     * Traverses the graph starting from a specific output socket (usually 'exec').
     * Returns a BlockStatement containing all subsequent statements.
     */
    public traverseBlock(startNode: BotNode, outputKey: string): AST.BlockStatement {
        const statements: AST.Statement[] = [];

        let currentNode = this.getNextNode(startNode.id, outputKey);

        // Loop through the chain of connected nodes
        // Prevent infinite loops with a visited set (though tree logic should prevent it normally, graphs can loop)
        const visited = new Set<string>();

        while (currentNode) {
            if (visited.has(currentNode.id)) {
                // Detected a cycle or re-entry in a linear block.
                break;
            }
            visited.add(currentNode.id);

            const stmt = this.processStatementNode(currentNode);
            if (stmt) {
                statements.push(stmt);
            }

            // Move to next
            currentNode = this.getNextNode(currentNode.id, 'exec');
        }

        return {
            type: 'BlockStatement',
            body: statements
        };
    }

    /**
     * Processes a single node into a Statement.
     * Handles Control Flow (If, While) and Actions.
     */
    private processStatementNode(node: BotNode): AST.Statement | null {
        // Try to find a parser in the registry
        const parser = registry.getParser(node.codeType, node.label);
        if (parser) {
            const result = parser.parse(node, this, 'statement');

            // Check if result is a valid statement
            if (result && (result as any).type) {
                if (['VariableDeclaration', 'ExpressionStatement', 'IfStatement', 'WhileStatement', 'ReturnStatement', 'BlockStatement'].includes(result.type)) {
                    return result as AST.Statement;
                }
            }
        }

        // Fallback for unknown nodes
        const label = node.label || node.codeType || 'Unknown Node';
        return {
            type: 'CommentStatement',
            text: `Unknown or Unsupported Node: ${label} (ID: ${node.id})`
        };
    }

    /**
     * Resolves an input socket to an AST Expression.
     * - If connected to another node, recursively resolve that node.
     * - If literal (control value), return Literal.
     */
    public resolveInput(node: BotNode, key: string): AST.Expression {
        // 1. Check connections
        const connection = this.connections.find(c => c.target === node.id && c.targetInput === key);
        if (connection) {
            const sourceNode = this.nodes.find(n => n.id === connection.source);
            if (sourceNode) {
                return this.processValueNode(sourceNode, connection.sourceOutput);
            }
        }

        // 2. Check Control value (Literal)
        const control = node.controls?.[key] as any;
        if (control && control.value !== undefined) {
            // Basic casting
            if (!isNaN(Number(control.value)) && control.value !== '') {
                return { type: 'Literal', value: Number(control.value) };
            }
            return { type: 'Literal', value: control.value };
        }

        // 3. Check node.data (standard Rete persistence)
        if (node.data && node.data[key] !== undefined) {
            const val = node.data[key] as any;
            if (val !== undefined && val !== '') {
                // Basic casting for data
                if (!isNaN(Number(val))) {
                    return { type: 'Literal', value: Number(val) };
                }
                return { type: 'Literal', value: val };
            }
        }

        // 3. Default: Null or Undefined
        return { type: 'Literal', value: null };
    }

    private processValueNode(node: BotNode, outputKey: string): AST.Expression {
        // Registry Lookup (Handles Primitives, Variables, and regular Value nodes)
        const parser = registry.getParser(node.codeType, node.label);
        if (parser) {
            const result = parser.parse(node, this, 'expression');

            if (result && (result as any).type) {
                // Ensure we got an Expression (not a Statement)
                if (!['VariableDeclaration', 'IfStatement', 'WhileStatement', 'ReturnStatement', 'BlockStatement', 'ExpressionStatement'].includes(result.type)) {
                    return result as AST.Expression;
                }
            }
        }

        // Default Fallback
        return {
            type: 'Identifier',
            name: `node_${node.id.replace(/-/g, '_')}_${outputKey}`
        };
    }

    public getNodeValue(node: BotNode, key: string): any {
        // Prioritize node.data (persistence)
        if (node.data && node.data[key] !== undefined) {
            return node.data[key];
        }
        // Fallback to controls
        if (node.controls && node.controls[key]) {
            return (node.controls[key] as any).value;
        }
        return undefined;
    }

    // --- Helpers ---

    private getNextNode(nodeId: string, outputKey: string): BotNode | undefined {
        const connection = this.connections.find(c => c.source === nodeId && c.sourceOutput === outputKey);
        if (!connection) return undefined;
        return this.nodes.find(n => n.id === connection.target);
    }

    public sanitizeName(name: string): string {
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    }
}
