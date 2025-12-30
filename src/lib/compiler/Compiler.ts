import { GraphParser } from './ast/GraphParser';
import { LogicValidator } from './ast/LogicValidator';
import { CodePrinter } from './ast/CodePrinter';
import * as AST from './ast/types';
import {
    type FileType,
    type WrapperStrategy,
    LegacyCommandStrategy,
    SlashCommandStrategy,
    EventStrategy,
    PluginInjectionStrategy
} from './ast/strategies';

// Re-export common types for consumers
export type { FileType };

export interface CompilerOptions {
    nodes: any[]; // Using any[] to be compatible with Rete export format
    connections: any[];
    fileType?: FileType;
}

/**
 * The Railgun AST Compiler
 * 
 * Transforming Rete.js data graphs into executable JavaScript code.
 * Pipeline: Graph -> AST -> Validation -> Code Generation -> Wrapping
 */
export class Compiler {
    private nodes: any[];
    private connections: any[];
    private fileType: FileType;

    constructor(data: CompilerOptions) {
        this.nodes = data.nodes;
        this.connections = data.connections;
        this.fileType = data.fileType || 'command';
    }

    /**
     * Compiles the graph into a JavaScript string.
     */
    public compile(): string {
        console.log('[Railgun Compiler] Starting compilation...');

        // 1. Parsing: Graph -> AST
        const parser = new GraphParser(this.nodes, this.connections);
        const program = parser.parse();

        // 2. Validation: AST Analysis
        const validator = new LogicValidator();
        const errors = validator.validate(program);

        if (errors.length > 0) {
            console.error('[Railgun Compiler] Validation Errors:', errors);
            // In the future, throw here or return an error object.
            // For now, generate a file with the errors as comments to be safe.
            const errorBlock = errors.map(e => `// ERROR: ${e.message} (Node: ${e.nodeId})`).join('\n');
            return `/* COMPILATION FAILED - VALIDATION ERRORS */\n\n${errorBlock}`;
        }

        // 3. Code Generation: AST -> Code Strings
        const printer = new CodePrinter();

        const globalStmts: string[] = [];
        // 3a. Inject Plugin Imports
        const pluginStrategy = new PluginInjectionStrategy();
        const pluginStmts = pluginStrategy.execute(program);
        globalStmts.push(...pluginStmts);

        let eventFunctionBody = '';

        // Metadata extraction
        let eventName = 'default-cmd';
        let eventParams: string[] = [];
        let description = '';
        let isAsync = true;
        let once = false;

        // Find the "EntryPoint" node to determine metadata
        const eventNode = this.nodes.find(n => n.category === 'Event' || n.codeType?.startsWith('On '));
        const eventNodeId = eventNode?.id;

        for (const stmt of program.body) {
            // Check if this statement is the Main Event Function Declaration
            if (stmt.type === 'FunctionDeclaration' && (stmt as AST.FunctionDeclaration).isEvent) {
                const func = stmt as AST.FunctionDeclaration;

                // Match strictly against the detected event node to avoid confusion
                if (func.sourceNodeId === eventNodeId || !eventNodeId) {

                    // A. Extract Parameters
                    eventParams = func.params.map(p => p.name);

                    // B. Extract Body Code
                    // We print the body block " { ... } " and strip the braces to get the inner content
                    const bodyCode = printer.print(func.body, 1);
                    eventFunctionBody = bodyCode.trim().replace(/^{/, '').replace(/}$/, '').trim();

                    // C. Extract Metadata
                    if (eventNode) {
                        const getVal = (key: string) => (eventNode.data?.[key] || eventNode.controls?.[key]?.value);

                        eventName = getVal('name') || func.eventName || 'my-cmd';
                        description = getVal('description') || '';

                        // Handle "Once" for events
                        const onceVal = getVal('once');
                        if (onceVal === true) once = true;
                    }
                    continue; // Do not print this as a global function
                }
            }

            // Regular global statement
            globalStmts.push(printer.print(stmt));
        }

        const globalCode = globalStmts.join('\n\n');

        // 4. Transform: Wrap code in the specific strategy (Slash vs Legacy vs Event)
        let strategy: WrapperStrategy;

        switch (this.fileType as string) {
            case 'slash_command':
                strategy = new SlashCommandStrategy();
                break;
            case 'event':
                strategy = new EventStrategy();
                break;
            case 'command':
            default:
                strategy = new LegacyCommandStrategy();
                break;
        }

        const wrappedMain = strategy.wrap(eventFunctionBody, {
            eventName,
            eventParams,
            isAsync,
            description,
            once
        });

        // 5. Final Assembly
        const finalCode = [
            '// Generated by Railgun AST Compiler',
            globalCode,
            wrappedMain
        ].filter(s => s.trim()).join('\n\n');

        console.log('[Railgun Compiler] Compilation successful.');
        return finalCode;
    }
}
