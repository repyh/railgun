
import { GraphParser } from './GraphParser';
import { LogicValidator } from './LogicValidator';
import { CodePrinter } from './CodePrinter';
import { BotNode } from '../../railgun-rete';
import * as AST from './types';
import {
    type FileType,
    type WrapperStrategy,
    LegacyCommandStrategy,
    SlashCommandStrategy,
    EventStrategy
} from './strategies';

export interface CompilerOptions {
    nodes: BotNode[];
    connections: any[];
    fileType?: FileType; // Optional, defaults to auto-detect or 'command'
}

export class ASTCompiler {
    nodes: BotNode[];
    connections: any[];
    fileType: FileType;

    constructor(data: CompilerOptions) {
        this.nodes = data.nodes;
        this.connections = data.connections;
        this.fileType = data.fileType || 'command';
    }

    compile(): string {
        console.log('[AST Compiler] Starting compilation...');

        // 1. Parse
        const parser = new GraphParser(this.nodes, this.connections);
        const program = parser.parse();

        // 2. Validate
        const validator = new LogicValidator();
        const errors = validator.validate(program);

        if (errors.length > 0) {
            console.error('[AST Compiler] Validation Errors:', errors);
            const errorBlock = errors.map(e => `// ERROR: ${e.message} (Node: ${e.nodeId})`).join('\n');
            return `/* DATA VALIDATION FAILED */\n\n${errorBlock}`;
        }

        // 3. Print Body Code
        const printer = new CodePrinter();
        // We do NOT print the whole program directly if we want to extract the main event body.
        // Instead, we separate global statements from the main event handler.

        let finalCode = '';
        const globalStmts: string[] = [];
        let eventFunctionBody = '';
        let eventName = 'default-cmd';
        let eventParams: string[] = [];
        let description = '';
        let isAsync = true;
        let once = false;

        // Find the "EntryPoint" node (Event or Command) to extract metadata
        // Priority: Explicit Event Logic > First Event Node > Default
        const eventNode = this.nodes.find(n => n.category === 'Event' || n.codeType === 'On Command' || n.codeType === 'On Slash Command');
        const eventNodeId = eventNode?.id;

        // Process Statements
        for (const stmt of program.body) {
            // Check if this statement is the Main Event Function
            if (stmt.type === 'FunctionDeclaration' && (stmt as AST.FunctionDeclaration).isEvent) {
                const func = stmt as AST.FunctionDeclaration;

                // Only treat it as the entry point if it matches our detected event node
                if (func.sourceNodeId === eventNodeId || !eventNodeId) {
                    // This is our Event Entry Point

                    // 1. Get Params
                    eventParams = func.params.map(p => p.name);

                    // 2. Get Body Code (Strip outer braces)
                    const bodyCode = printer.print(func.body, 1);
                    eventFunctionBody = bodyCode.trim().replace(/^{/, '').replace(/}$/, '').trim();

                    // 3. Extract Metadata from Node
                    if (eventNode) {
                        // Extract Name
                        const nameControl = eventNode.controls?.['name'] as any;
                        eventName = nameControl?.value || func.eventName || 'my-cmd';

                        // Extract Description (If available, e.g. for Slash)
                        const descControl = eventNode.controls?.['description'] as any;
                        description = descControl?.value || '';

                        // Extract Once (If available, e.g. for Ready)
                        const onceControl = eventNode.controls?.['once'] as any;
                        if (onceControl && onceControl.value === true) {
                            once = true;
                        }
                    }
                    continue; // Processed as entry point, do not print as global function
                }
            }

            // Otherwise, it's a global function or variable
            globalStmts.push(printer.print(stmt));
        }

        const globalCode = globalStmts.join('\n\n');

        // 4. Wrap Code using Strategy
        let strategy: WrapperStrategy;

        // Logic to select strategy
        // If fileType is explicitly set, use it.
        // Otherwise try to infer? (For now rely on fileType)
        switch (this.fileType) {
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

        // Combine Global + Wrapped
        finalCode = `${globalCode}\n\n${wrappedMain}`;

        console.log('[AST Compiler] Compilation successful.');
        return finalCode;
    }
}
