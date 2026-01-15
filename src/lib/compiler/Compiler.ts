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
        const start = performance.now();
        console.log('[Railgun Compiler] Starting compilation...');

        // 1. Parsing: Graph -> AST
        const parser = new GraphParser(this.nodes, this.connections);
        const program = parser.parse();

        // 2. Validation: AST Analysis
        const validator = new LogicValidator();
        const errors = validator.validate(program);

        if (errors.length > 0) {
            console.error('[Railgun Compiler] Validation Errors:', errors);
            const errorBlock = errors.map(e => `// ERROR: ${e.message} (Node: ${e.nodeId})`).join('\n');
            return `/* COMPILATION FAILED - VALIDATION ERRORS */\n\n${errorBlock}`;
        }

        // 3. Code Generation: AST -> Code Strings
        const printer = new CodePrinter();

        // We need to track the Global Code lines to offset the main body map
        const globalStmts: string[] = [];
        // 3a. Inject Plugin Imports
        const pluginStrategy = new PluginInjectionStrategy();
        const pluginStmts = pluginStrategy.execute(program);
        globalStmts.push(...pluginStmts);

        let eventFunctionBody = '';
        let eventBodyMap: Record<number, string> = {}; // Local map for the body

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

                    // B. Extract Body Code & Map
                    // We use `printer.build` to get the map.
                    // Note: func.body is a BlockStatement. build() will wrap it in { ... } lines.
                    // We usually strip the outer braces for the Wrapper.
                    // Build Event Body Code
                    // Note: func.body is a BlockStatement. build() will wrap it in { ... } lines.
                    // We strip the outer braces to get just the inner logic for wrapping.
                    const bodyResult = printer.build(func.body);
                    const rawBodyLines = bodyResult.code.split('\n');

                    const strippedLines = rawBodyLines.slice(1, -1);
                    // Standardize to 0-level indentation by stripping exactly one level (4 spaces).
                    // This creates a clean baseline for the strategies to apply their own indentation.
                    eventFunctionBody = strippedLines.map(l => l.replace(/^ {4}/, '')).join('\n');

                    // Adjust map:
                    // Original Line 2 becomes New Line 1.
                    // We also need to filter out the braces lines (1 and N).
                    // Also unindenting doesn't change line number mapping logic unless we map columns.

                    const startLine = 2;
                    // If length is 3. { (1), stmt (2), } (3).
                    // We want Line 2. 
                    // loop limit: line < length. (line < 3 -> 2).

                    const limitLine = rawBodyLines.length;

                    Object.entries(bodyResult.map).forEach(([lineStr, nodeId]) => {
                        const line = parseInt(lineStr);
                        if (line >= startLine && line < limitLine) {
                            // Map to new relative line
                            const newLine = line - 1; // Line 2 -> Line 1
                            eventBodyMap[newLine] = nodeId;
                        }
                    });


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
            // Ideally we map these too, but for now we focus on the main event body
            globalStmts.push(printer.print(stmt));
        }

        const globalCode = globalStmts.join('\n\n');

        // 4. Transform: Wrap code in the specific strategy
        let strategy: WrapperStrategy;
        switch (this.fileType as string) {
            case 'slash_command': strategy = new SlashCommandStrategy(); break;
            case 'event': strategy = new EventStrategy(); break;
            case 'command': default: strategy = new LegacyCommandStrategy(); break;
        }

        // We generate the wrapper to find offsets
        // To find the specific offset where bodyCode was inserted, we can use a marker.
        const marker = '/*__BODY_MARKER__*/';
        const templateWithMarker = strategy.wrap(marker, {
            eventName,
            eventParams,
            isAsync,
            description,
            options: eventNode?.data?.options as any[] || [],
            once
        });

        const [header] = templateWithMarker.split(marker);

        // Count lines in header
        const headerLines = header.split('\n').length - 1;
        // Be careful. 'Foo\nBar'.split('\n').length is 2. 'Foo\n'.split('\n').length is 2 (last is empty).
        // The marker is likely on a line by itself or indented. 
        // e.g. "execute: .. {\n    /*MARKER*/\n"

        // Calculate Global Offset
        // Final layout:
        // // Generated... (1 line)
        // Global Code
        // \n\n (2? lines) or just joined.
        // Wrapped Code

        // Let's Assemble first
        const banner = '// Generated by Railgun AST Compiler';

        // Let's build the final map.
        const finalMap: Record<number, string> = {};

        // Calculate offsets correctly by constructing the preceding content
        const preParts = [banner, globalCode].filter(s => s && s.trim().length > 0);
        let preString = preParts.join('\n\n');

        // Add the separator that allows the wrapped code to be appended
        // (Only if there is preceding content)
        if (preString.length > 0) {
            preString += '\n\n';
        }

        // The base offset is the number of lines consumed by preceding content
        // (split length - 1 gives the 0-based index of the next line, equivalent to count of full lines before)
        const baseOffset = preString.length > 0 ? preString.split('\n').length - 1 : 0;

        // Apply Header Offset
        // The body starts at: baseOffset + headerLines
        const totalBodyOffset = baseOffset + headerLines;

        // Shift body map
        Object.entries(eventBodyMap).forEach(([lineStr, nodeId]) => {
            const line = parseInt(lineStr);
            const finalLine = line + totalBodyOffset;
            finalMap[finalLine] = nodeId;
        });

        const realWrappedCode = strategy.wrap(eventFunctionBody, {
            eventName,
            eventParams,
            isAsync,
            description,
            options: eventNode?.data?.options as any[] || [],
            once
        });

        const finalCode = preString + realWrappedCode;

        // Append Source Map
        const mapComment = `\n//# railgun_source_map=${JSON.stringify(finalMap)}`;

        const end = performance.now();
        console.log(`[Railgun Compiler] Compilation successful in ${(end - start).toFixed(2)}ms.`);
        return finalCode + mapComment;
    }
}
