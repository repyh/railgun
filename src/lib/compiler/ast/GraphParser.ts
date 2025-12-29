import { BotNode } from '../../railgun-rete';
import * as AST from './types';
import type { NodeParser } from './parsers';
import { MathParser, LogicParser, VariableParser, ActionParser } from './parsers';

export class GraphParser {
    nodes: BotNode[];
    connections: any[];
    parsers: NodeParser[];

    // Map of Node ID to generated AST Node (for caching/reference)
    nodeMap: Map<string, AST.BaseNode> = new Map();

    constructor(nodes: BotNode[], connections: any[]) {
        this.nodes = nodes;
        this.connections = connections;

        // Initialize parsers
        this.parsers = [
            new VariableParser(),
            new MathParser(),
            new LogicParser(),
            new ActionParser()
        ];
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
        const eventName = node.codeType || node.label;

        // Determine arguments based on event type
        const params: AST.Identifier[] = [];

        if (eventName === 'On Ready') {
            params.push({ type: 'Identifier', name: 'client' });
        } else if (eventName === 'On Message Create') {
            params.push({ type: 'Identifier', name: 'message' });
        } else if (eventName === 'On Slash Command' || eventName === 'On Interaction Create') {
            params.push({ type: 'Identifier', name: 'interaction' });
        } else if (eventName === 'On Command') {
            params.push({ type: 'Identifier', name: 'message' });
            params.push({ type: 'Identifier', name: 'args' });
        }

        // Build the body by following the 'exec' output
        const body = this.traverseBlock(node, 'exec');

        return {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: this.sanitizeName(eventName) },
            params: params,
            body: body,
            async: true,
            sourceNodeId: node.id,
            isEvent: true,
            eventName: eventName
        };
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
                // In a real compiler, we might want a Goto or Loop structure, 
                // but for now, we stop to prevent overflow.
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
     * Delegates to registered parsers.
     */
    private processStatementNode(node: BotNode): AST.Statement | null {
        for (const parser of this.parsers) {
            const result = parser.parse(node, this, 'statement');
            if (result) {
                // Ensure result is a Statement
                // Parsers might return Expression if called with 'statement' context if they wrap it?
                // Our parsers strictly return generic types, so we assume type safety is handled by the parser logic.
                // In TS, we can assert or check type property if needed.
                // Basic check:
                if ((result as AST.Statement).type.endsWith('Statement') || (result as AST.Statement).type === 'VariableDeclaration') {
                    return result as AST.Statement;
                }
                // If it returned an expression, wrap it?
                // ActionParser wraps in ExpressionStatement. LogicParser If/While are Statements.
            }
        }
        return null;
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
        // Delegate to parsers
        for (const parser of this.parsers) {
            const result = parser.parse(node, this, 'expression');
            if (result) {
                // Check if it's an expression
                if (!(result as any).type.endsWith('Statement')) {
                    return result as AST.Expression;
                }
            }
        }

        // Fallback to implicit Identifier for unknown nodes (like Math results calculated elsewhere)
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
