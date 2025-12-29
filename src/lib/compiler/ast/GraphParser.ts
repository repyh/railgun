import { BotNode } from '../../railgun-rete';
import * as AST from './types';

export class GraphParser {
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
        const eventName = node.codeType || node.label;

        // Determine arguments based on event type
        const params: AST.Identifier[] = [];

        if (eventName === 'On Ready') {
            params.push({ type: 'Identifier', name: 'client' });
        } else if (eventName === 'On Message Create') {
            params.push({ type: 'Identifier', name: 'message' });
        } else if (eventName === 'On Slash Command' || eventName === 'On Interaction Create') {
            params.push({ type: 'Identifier', name: 'interaction' });
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
    private traverseBlock(startNode: BotNode, outputKey: string): AST.BlockStatement {
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
     * Handles Control Flow (If, While) and Actions.
     */
    private processStatementNode(node: BotNode): AST.Statement | null {
        switch (node.category) {
            case 'Logic':
                return this.processLogicNode(node);
            case 'Action':
                return this.processActionNode(node);
            default:
                // Fallback for unknown nodes
                return null;
        }
    }

    private processLogicNode(node: BotNode): AST.Statement | null {
        if (node.codeType === 'If') {
            return this.processIfNode(node);
        }
        if (node.codeType === 'While Loop') {
            return this.processWhileNode(node);
        }
        // TODO: Do-While, For
        return null;
    }

    private processIfNode(node: BotNode): AST.IfStatement {
        const test = this.resolveInput(node, 'condition');
        const consequent = this.traverseBlock(node, 'true'); // 'true' output
        const alternate = this.traverseBlock(node, 'false'); // 'false' output

        return {
            type: 'IfStatement',
            test: test,
            consequent: consequent,
            alternate: alternate.body.length > 0 ? alternate : null,
            sourceNodeId: node.id
        };
    }

    private processWhileNode(node: BotNode): AST.WhileStatement {
        const test = this.resolveInput(node, 'condition');
        const body = this.traverseBlock(node, 'loopBody'); // 'loopBody' output

        return {
            type: 'WhileStatement',
            test: test,
            body: body,
            sourceNodeId: node.id
        };
    }

    private processActionNode(node: BotNode): AST.ExpressionStatement {
        // Actions are typically funtion calls, e.g. msg.reply()
        // For now, we return a Generic CallExpression placeholder
        // In reality, this needs a registry of Action Generators -> AST

        const args: AST.Expression[] = [];
        // TODO: Resolve actual inputs dynamically based on node definition

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: this.sanitizeName(node.label) // e.g. 'Send_Message'
                },
                arguments: args,
                sourceNodeId: node.id
            },
            sourceNodeId: node.id
        };
    }

    /**
     * Resolves an input socket to an AST Expression.
     * - If connected to another node, recursively resolve that node.
     * - If literal (control value), return Literal.
     */
    private resolveInput(node: BotNode, key: string): AST.Expression {
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

        // 3. Default: Null or Undefined
        return { type: 'Literal', value: null };
    }

    private processValueNode(node: BotNode, outputKey: string): AST.Expression {
        // Handle Variable Nodes, Math Nodes, etc.
        // For now, returning implicit Identifier
        return {
            type: 'Identifier',
            name: `node_${node.id.replace(/-/g, '_')}_${outputKey}`
        };
    }

    // --- Helpers ---

    private getNextNode(nodeId: string, outputKey: string): BotNode | undefined {
        const connection = this.connections.find(c => c.source === nodeId && c.sourceOutput === outputKey);
        if (!connection) return undefined;
        return this.nodes.find(n => n.id === connection.target);
    }

    private sanitizeName(name: string): string {
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    }
}
