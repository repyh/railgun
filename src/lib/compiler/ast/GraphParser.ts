import type { CompilerNode, CompilerConnection } from '../graphTypes';
import * as AST from './types';
import { registry } from './nodes';
import type { ParserContext } from './nodes/ParserContext';

export class GraphParser implements ParserContext {
    nodes: CompilerNode[];
    connections: CompilerConnection[];

    // Map of Node ID to generated AST Node (for caching/reference)
    nodeMap: Map<string, AST.BaseNode> = new Map();

    // Cache for processed expressions: "nodeId:outputKey" -> AST.Expression
    private cachedExpressions: Map<string, AST.Expression> = new Map();
    private usedPlugins: Set<string> = new Set();

    constructor(nodes: CompilerNode[], connections: CompilerConnection[]) {
        this.nodes = nodes;
        this.connections = connections;
    }

    public markPluginUsed(pluginId: string): void {
        this.usedPlugins.add(pluginId);
    }

    /**
     * Main Entry Point.
     * Converts the entire graph into a Program AST.
     */
    public parse(): AST.Program {
        const body: AST.Statement[] = [];

        // 1. Find Global Functions (Custom Functions) - Process these FIRST so they are hoisted/available
        const functionNodes = this.nodes.filter(n => n.data?._schemaId === 'functions/def' || n.label === 'Function Def');
        for (const funcNode of functionNodes) {
            const funcDecl = this.processEvent(funcNode);
            if (funcDecl) {
                body.push(funcDecl);
            }
        }

        // 2. Find all Event nodes (Entry Points)
        const eventNodes = this.nodes.filter(n => n.category === 'Event' || n.codeType?.startsWith('event/') || n.data?._schemaId?.startsWith('event/'));

        // 3. Process each event into a FunctionDeclaration (or equivalent structure)
        for (const eventNode of eventNodes) {
            const funcDecl = this.processEvent(eventNode);
            if (funcDecl) {
                body.push(funcDecl);
            }
        }

        return {
            type: 'Program',
            body: body,
            usedPlugins: Array.from(this.usedPlugins)
        };
    }

    /**
     * Converts an Event Node into a special FunctionDeclaration.
     * In the AST, we treat Events as functions that the system calls.
     */
    private processEvent(node: CompilerNode): AST.FunctionDeclaration | null {
        const schemaId = node.data?._schemaId || node.codeType;
        let parser = registry.getEventParser(schemaId, node.label);

        // Fallback: Check standard parsers (e.g. for Function Def which is an "Event" in terms of entry point)
        if (!parser) {
            const stdParser = registry.getParser(node.codeType, node.label);
            // Ensure it implements 'parse' compatible for top-level (which they do via the same interface really)
            if (stdParser) {
                // ASTNodeParser signature: parse(node, context, mode) -> AST.Statement | ...

                // FunctionDefParser is an ASTNodeParser.
                return (stdParser as any).parse(node, this, 'statement') as AST.FunctionDeclaration;
            }
        }

        if (parser) {
            return parser.parse(node, this);
        }
        return null;
    }

    /**
     * Traverses the graph starting from a specific output socket (usually 'exec').
     * Returns a BlockStatement containing all subsequent statements.
     */
    public traverseBlock(startNode: CompilerNode, outputKey: string): AST.BlockStatement {
        const statements: AST.Statement[] = [];

        // Try to find the first node in the chain
        let currentNode = this.findNextExecutionNode(startNode.id, outputKey);

        const visited = new Set<string>();

        while (currentNode) {
            if (visited.has(currentNode.id)) break;
            visited.add(currentNode.id);

            const stmt = this.processStatementNode(currentNode);
            if (stmt) {
                statements.push(stmt);
            }

            // Move to next node in the chain
            currentNode = this.findNextExecutionNode(currentNode.id, 'exec');
        }

        return {
            type: 'BlockStatement',
            body: statements,
            sourceNodeId: startNode.id
        };
    }

    /**
     * Finds the next node in the execution chain by trying common output labels.
     */
    private findNextExecutionNode(nodeId: string, preferredKey: string): CompilerNode | undefined {
        // ALWAYS try the preferred key first (Strict Match)
        let next = this.getNextNode(nodeId, preferredKey);
        if (next) return next;

        // Only use strict matching for specific branch keys (loopBody, true, false, etc.)
        // Only use fallbacks if the requested key is a generic flow key.
        const genericKeys = ['exec', 'Exec', 'next', 'Next', 'out', 'output'];

        // Also allow fallbacks if we are just looking for "next action" (default traversal)
        if (genericKeys.includes(preferredKey)) {
            const fallbacks = ['exec', 'Exec', 'Then', 'Completed', 'completed', 'then', 'exec_out', 'execOut', 'output', 'out'];
            for (const key of fallbacks) {
                if (key === preferredKey) continue;
                next = this.getNextNode(nodeId, key);
                if (next) return next;
            }
        }

        return undefined;
    }

    /**
     * Processes a single node into a Statement.
     * Handles Control Flow (If, While) and Actions.
     */
    private processStatementNode(node: CompilerNode): AST.Statement | null {
        // Try to find a parser in the registry
        const schemaId = node.data?._schemaId || node.codeType;
        const parser = registry.getParser(schemaId, node.label);
        if (parser) {
            const result = parser.parse(node, this, 'statement');

            // Check if result is a valid statement
            if (result && (result as any).type) {
                if ([
                    'VariableDeclaration',
                    'ExpressionStatement',
                    'IfStatement',
                    'WhileStatement',
                    'DoWhileStatement',
                    'ForOfStatement',
                    'ForStatement',
                    'BreakStatement',
                    'ContinueStatement',
                    'ReturnStatement',
                    'BlockStatement'
                ].includes(result.type)) {
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
    public resolveInput(node: CompilerNode, key: string): AST.Expression {
        // 1. Check connections
        // In CompilerConnection, source/target are Node IDs.
        const connection = this.connections.find(c => c.target === node.id && c.targetInput === key);
        if (connection) {
            const sourceNode = this.nodes.find(n => n.id === connection.source);
            if (sourceNode) {
                return this.processValueNode(sourceNode, connection.sourceOutput);
            }
        }

        // 2. Check primary value (Data)
        // In new system, control values are in node.data
        const primaryVal = this.getNodeValue(node, key);
        if (primaryVal !== undefined && primaryVal !== null) {
            // Basic casting
            if (!isNaN(Number(primaryVal)) && primaryVal !== '' && typeof primaryVal !== 'boolean') {
                return { type: 'Literal', value: Number(primaryVal) };
            }
            return { type: 'Literal', value: primaryVal };
        }

        // 3. Check common fallbacks
        const fallbacks = ['value', 'initial', 'init', 'message', 'msg', 'val', 'text'];
        for (const f of fallbacks) {
            if (f === key) continue; // Already checked

            const fallbackVal = this.getNodeValue(node, f);
            if (fallbackVal !== undefined && fallbackVal !== null) {
                if (!isNaN(Number(fallbackVal)) && fallbackVal !== '' && typeof fallbackVal !== 'boolean') {
                    return { type: 'Literal', value: Number(fallbackVal) };
                }
                return { type: 'Literal', value: fallbackVal };
            }
        }

        // 4. Default Fallback (Literal null)
        return {
            type: 'Literal',
            value: null
        };
    }

    private processValueNode(node: CompilerNode, outputKey: string): AST.Expression {
        const cacheKey = `${node.id}:${outputKey}`;
        if (this.cachedExpressions.has(cacheKey)) {
            return this.cachedExpressions.get(cacheKey)!;
        }

        const schemaId = node.data?._schemaId || node.codeType;
        const label = node.label;

        // 1. Special Handling for Event-provided values (Entry Points)
        if (schemaId?.startsWith('event/') || label === 'On Command' || label === 'On Slash Command' || node.category === 'Event') {
            if ((schemaId === 'event/on-message-create' || label === 'On Message Create') && outputKey === 'message') {
                const ident: AST.Expression = { type: 'Identifier', name: 'message' };
                this.cachedExpressions.set(cacheKey, ident);
                return ident;
            }
            if ((schemaId === 'event/on-ready' || label === 'On Ready') && outputKey === 'client') {
                const ident: AST.Expression = { type: 'Identifier', name: 'client' };
                this.cachedExpressions.set(cacheKey, ident);
                return ident;
            }
            if ((schemaId === 'event/slash-command' || label === 'On Slash Command' || label === 'On Interaction Create') && outputKey === 'interaction') {
                const ident: AST.Expression = { type: 'Identifier', name: 'interaction' };
                this.cachedExpressions.set(cacheKey, ident);
                return ident;
            }
            if (schemaId === 'event/on-command' || label === 'On Command') {
                if (outputKey === 'message') {
                    const ident: AST.Expression = { type: 'Identifier', name: 'message' };
                    this.cachedExpressions.set(cacheKey, ident);
                    return ident;
                }
                // Handle both legacy 'args' and new 'rawArgs' output keys
                if (outputKey === 'args' || outputKey === 'rawArgs') {
                    const ident: AST.Expression = { type: 'Identifier', name: 'args' };
                    this.cachedExpressions.set(cacheKey, ident);
                    return ident;
                }

                // Handle legacy indexed arguments (arg_0, arg_1, etc.)
                if (outputKey.startsWith('arg_')) {
                    const index = parseInt(outputKey.split('_')[1]);
                    const expr: AST.Expression = {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'args' },
                        property: { type: 'Literal', value: index },
                        computed: true
                    };
                    this.cachedExpressions.set(cacheKey, expr);
                    return expr;
                }

                // Handle named arguments by checking metadata
                const argNames = node.data?.args || [];
                const argIndex = argNames.indexOf(outputKey);
                if (argIndex !== -1) {
                    const expr: AST.Expression = {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'args' },
                        property: { type: 'Literal', value: argIndex },
                        computed: true
                    };
                    this.cachedExpressions.set(cacheKey, expr);
                    return expr;
                }
            }

            // Logic for Dynamic Slash Command Options
            if (schemaId === 'event/slash-command' || label === 'On Slash Command') {
                // If the key is not one of the standard ones (exec, user, channel), assume it is an option
                if (!['exec', 'user', 'channel'].includes(outputKey)) {
                    // We need to know the type to generate the correct .getString(), .getUser(), etc.
                    // But strictly speaking, .get() works for most or we can guess.
                    // Better: Look up the option definition from node.data.options
                    const options = node.data?.options || [];
                    const optionDef = options.find((o: any) => o.name === outputKey);

                    let method = 'get'; // Default
                    if (optionDef) {
                        switch (optionDef.type) {
                            case 'STRING': method = 'getString'; break;
                            case 'INTEGER': method = 'getInteger'; break;
                            case 'BOOLEAN': method = 'getBoolean'; break;
                            case 'USER': method = 'getUser'; break;
                            case 'CHANNEL': method = 'getChannel'; break;
                            case 'ROLE': method = 'getRole'; break;
                            case 'MENTIONABLE': method = 'getMentionable'; break;
                            case 'NUMBER': method = 'getNumber'; break;
                            case 'ATTACHMENT': method = 'getAttachment'; break;
                        }
                    }

                    const expr: AST.CallExpression = {
                        type: 'CallExpression',
                        callee: {
                            type: 'MemberExpression',
                            object: {
                                type: 'MemberExpression',
                                object: { type: 'Identifier', name: 'interaction' },
                                property: { type: 'Identifier', name: 'options' },
                                computed: false
                            },
                            property: { type: 'Identifier', name: method },
                            computed: false
                        },
                        arguments: [
                            { type: 'Literal', value: outputKey }
                        ]
                    };
                    this.cachedExpressions.set(cacheKey, expr);
                    return expr;
                }
            }
        }

        // 2. Registry Lookup (Handles Primitives, Variables, and regular Value nodes)
        const parser = registry.getParser(schemaId, label);
        if (parser) {
            // Check for custom output resolution (Modular Extensibility)
            if (parser.resolveOutput) {
                const customResolution = parser.resolveOutput(node, outputKey, this);
                if (customResolution) {
                    this.cachedExpressions.set(cacheKey, customResolution);
                    return customResolution;
                }
            }

            const result = parser.parse(node, this, 'expression');

            if (result && (result as any).type) {
                // Ensure we got an Expression (not a Statement)
                if (!['VariableDeclaration', 'IfStatement', 'WhileStatement', 'ReturnStatement', 'BlockStatement', 'ExpressionStatement'].includes(result.type)) {
                    this.cachedExpressions.set(cacheKey, result as AST.Expression);
                    return result as AST.Expression;
                }
            }
        }

        // Default Fallback
        const fallback: AST.Expression = {
            type: 'Identifier',
            name: `node_${node.id.replace(/-/g, '_')}_${outputKey}`
        };
        this.cachedExpressions.set(cacheKey, fallback);
        return fallback;
    }

    public getNodeValue(node: CompilerNode, key: string): any {
        // Prioritize node.data (persistence)
        if (node.data && node.data[key] !== undefined) {
            return node.data[key];
        }
        return undefined;
    }

    // --- Helpers ---

    private getNextNode(nodeId: string, outputKey: string): CompilerNode | undefined {
        const connection = this.connections.find(c => c.source === nodeId && c.sourceOutput === outputKey);
        if (!connection) return undefined;
        return this.nodes.find(n => n.id === connection.target);
    }

    public sanitizeName(name: string): string {
        if (!name) return 'variable';
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    }
}
