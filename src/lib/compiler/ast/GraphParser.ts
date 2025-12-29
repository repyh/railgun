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

    private processActionNode(node: BotNode): AST.Statement {
        // Actions are typically funtion calls, e.g. msg.reply()

        // --- Specific Action Handlers ---
        if (node.label === 'Console Log') {
            const message = this.resolveInput(node, 'msg');
            return {
                type: 'ExpressionStatement',
                expression: {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'console' },
                        property: { type: 'Identifier', name: 'log' },
                        computed: false
                    } as AST.MemberExpression,
                    arguments: [message],
                    sourceNodeId: node.id
                },
                sourceNodeId: node.id
            };
        }

        // --- Variable Actions ---

        if (node.label === 'Declare Variable') {
            const varName = this.getNodeValue(node, 'varName');
            const initValue = this.resolveInput(node, 'value');

            // Map to VariableDeclaration
            return {
                type: 'VariableDeclaration',
                kind: 'let', // Default to let for bot variables
                declarations: [{
                    id: { type: 'Identifier', name: this.sanitizeName(varName) },
                    init: initValue
                }],
                sourceNodeId: node.id
            } as AST.VariableDeclaration;
        }

        if (node.label === 'Set Variable') {
            const varName = this.getNodeValue(node, 'varName'); // Or resolve input 'variable' if it supports dynamic naming
            const value = this.resolveInput(node, 'value');

            return {
                type: 'ExpressionStatement',
                expression: {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: { type: 'Identifier', name: this.sanitizeName(varName) },
                    right: value,
                    sourceNodeId: node.id
                },
                sourceNodeId: node.id
            };
        }

        if (node.label === 'Math Assignment') {
            // Inputs: 'variable' (name), 'value', control 'op'
            const varNameInput = this.resolveInput(node, 'variable');
            // 'variable' input is usually a string from a String node, or we might resort to a control if connected.
            // But usually MathAssignment expects a variable NAME string. 
            // In AST, we need an Identifier. 
            // If the input resolves to a Literal string, use that as the name.
            let varName = 'unknown_var';
            if (varNameInput.type === 'Literal' && typeof varNameInput.value === 'string') {
                varName = varNameInput.value;
            } else if (varNameInput.type === 'Identifier') {
                // Reuse identifier if passed directly (rare in Rete, usually simple string)
                varName = varNameInput.name;
            }

            const value = this.resolveInput(node, 'value');
            const op = this.getNodeValue(node, 'op') || '+=';

            return {
                type: 'ExpressionStatement',
                expression: {
                    type: 'AssignmentExpression',
                    operator: op as any,
                    left: { type: 'Identifier', name: this.sanitizeName(varName) },
                    right: value,
                    sourceNodeId: node.id
                },
                sourceNodeId: node.id
            };
        }

        if (node.label === 'Increment') {
            const varNameInput = this.resolveInput(node, 'variable');
            let varName = 'unknown_var';
            if (varNameInput.type === 'Literal' && typeof varNameInput.value === 'string') {
                varName = varNameInput.value;
            }

            const op = this.getNodeValue(node, 'op') || '++';
            // Desugar ++ to += 1, -- to -= 1
            const assignmentOp = op === '++' ? '+=' : '-=';

            return {
                type: 'ExpressionStatement',
                expression: {
                    type: 'AssignmentExpression',
                    operator: assignmentOp,
                    left: { type: 'Identifier', name: this.sanitizeName(varName) },
                    right: { type: 'Literal', value: 1 },
                    sourceNodeId: node.id
                },
                sourceNodeId: node.id
            };
        }

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
        // Handle Variable Nodes, Math Nodes, etc.

        // 1. Primitives (String, Number, Boolean)
        if (node.label === 'String' || node.codeType === 'String') {
            const val = this.getNodeValue(node, 'value');
            return { type: 'Literal', value: String(val) };
        }
        if (node.label === 'Number' || node.codeType === 'Number') {
            const val = this.getNodeValue(node, 'value');
            return { type: 'Literal', value: Number(val) };
        }
        if (node.label === 'Boolean' || node.codeType === 'Boolean') {
            const val = this.getNodeValue(node, 'value');
            return { type: 'Literal', value: val === 'true' || val === true };
        }

        // 2. Math Operations
        if (['Add', 'Subtract', 'Multiply', 'Divide', 'Modulus', 'Power'].includes(node.codeType || node.label)) {
            // Inputs are named 'a' and 'b' in the node definitions
            const left = this.resolveInput(node, 'a');
            const right = this.resolveInput(node, 'b');
            let op = '+';
            switch (node.codeType || node.label) {
                case 'Add': op = '+'; break;
                case 'Subtract': op = '-'; break;
                case 'Multiply': op = '*'; break;
                case 'Divide': op = '/'; break;
                case 'Modulus': op = '%'; break;
                case 'Power': op = '**'; break;
            }
            return {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                sourceNodeId: node.id
            };
        }

        // 3. Logic Operations
        if ((node.codeType || node.label) === 'Comparison') {
            const left = this.resolveInput(node, 'inp1');
            const right = this.resolveInput(node, 'inp2');
            const op = this.getNodeValue(node, 'optim') || '==';
            return {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                sourceNodeId: node.id
            };
        }
        if ((node.codeType || node.label) === 'Logic Op') {
            const left = this.resolveInput(node, 'inp1');
            const right = this.resolveInput(node, 'inp2');
            const op = this.getNodeValue(node, 'optim') || '&&';
            return {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                sourceNodeId: node.id
            };
        }
        if ((node.codeType || node.label) === 'Not') {
            const arg = this.resolveInput(node, 'inp');
            return {
                type: 'UnaryExpression',
                operator: '!',
                argument: arg,
                prefix: true,
                sourceNodeId: node.id
            };
        }

        // 4. Variables & Data Structures

        // Array Builder
        if (node.label === 'Array Builder') {
            // Inputs: item1, item2, item3, item4, item5
            const elements: AST.Expression[] = [];
            for (let i = 1; i <= 5; i++) {
                // Check if connected
                const item = this.resolveInput(node, `item${i}`);
                // Only add if it's not the default null (unless explicitly null?)
                // Actually, resolveInput returns Literal null if not connected/set.
                // We should check connections directly or deciding if we want sparse arrays.
                // Railgun Array Builder usually compacts or takes all. let's take all.
                elements.push(item);
            }
            // Filter out trailing nulls or empty? For now, keep as is or maybe Rete behavior specific.
            // Let's assume standard behavior: all 5 inputs.
            // Optimization: Remove trailing nulls if that's the desired behavior.

            return {
                type: 'ArrayExpression',
                elements,
                sourceNodeId: node.id
            };
        }

        // Object Accessor (Get Property)
        if (node.label === 'Get Property' || node.codeType === 'Object Accessor') {
            const object = this.resolveInput(node, 'object');
            const propName = this.getNodeValue(node, 'property'); // Control value
            // Can be dynamic? Usually controls are static strings in this node.

            return {
                type: 'MemberExpression',
                object: object,
                property: { type: 'Identifier', name: propName },
                computed: false, // Start with dot notation. If propName has spaces, should be computed?
                sourceNodeId: node.id
            };
        }

        // Variable Reference (Declare Variable used as input)
        if (node.label === 'Declare Variable') {
            const varName = this.getNodeValue(node, 'varName');
            return {
                type: 'Identifier',
                name: this.sanitizeName(varName),
                sourceNodeId: node.id
            };
        }

        // For now, fallback to implicit Identifier for unknown nodes (like Math results calculated elsewhere)
        return {
            type: 'Identifier',
            name: `node_${node.id.replace(/-/g, '_')}_${outputKey}`
        };
    }

    private getNodeValue(node: BotNode, key: string): any {
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

    private sanitizeName(name: string): string {
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    }
}
