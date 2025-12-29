import { GraphParser } from './GraphParser';
import { LogicValidator } from './LogicValidator';
import { CodePrinter } from './CodePrinter';
import { BotNode } from '../../railgun-rete';
import * as AST from './types';

export class ASTCompiler {
    nodes: BotNode[];
    connections: any[];

    constructor(data: { nodes: BotNode[], connections: any[] }) {
        this.nodes = data.nodes;
        this.connections = data.connections;
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

        // 3. Print
        const printer = new CodePrinter();
        let code = printer.print(program);

        // 4. Wrap in Module Exports (Post-Processing)
        // Instead of regex matching, we now inspect the ASTProgram directly.

        let finalCode = '';
        const globalStmts: string[] = [];
        let eventFunctionBody = '';
        let eventName = 'default-cmd';
        let eventParams = '';

        // Separate Event Function from Global Functions
        const eventNode = this.nodes.find(n => n.category === 'Event' || n.codeType === 'On Command' || n.codeType === 'On Slash Command');
        const eventNodeId = eventNode?.id;

        for (const stmt of program.body) {
            // Check if this statement is the Main Event Function
            if (stmt.type === 'FunctionDeclaration' && (stmt as AST.FunctionDeclaration).isEvent) {
                const func = stmt as AST.FunctionDeclaration;

                // Only treat it as the entry point if it matches our detected event node
                // (Or just take the first event function found if strict matching fails)
                if (func.sourceNodeId === eventNodeId || !eventNodeId) {
                    // This is our Event Entry Point
                    // 1. Get Params
                    eventParams = func.params.map(p => p.name).join(', ');

                    // 2. Get Body Code
                    // Use printer to print valid JS for the body block
                    // We strip the outer braces "{" and "}" manually or ask printer to print body internals
                    const bodyCode = printer.print(func.body, 1); // Indent level 1
                    // Remove first "{" and last "}"
                    eventFunctionBody = bodyCode.trim().replace(/^{/, '').replace(/}$/, '').trim();

                    // 3. Get Name (for On Command)
                    if (func.eventName === 'On Command') {
                        // The function ID name is sanitized, but we want the raw command name if possible?
                        // Actually OnCommandParser sets ID name to sanitized cmdName.
                        // We need the raw name for module.exports.name
                        const nameControl = eventNode?.controls?.['name'] as any;
                        eventName = nameControl?.value || 'my-cmd';
                    }
                    continue; // Do NOT add to globalStmts
                }
            }

            // Otherwise, it's a global function or variable
            globalStmts.push(printer.print(stmt));
        }

        // Generate Final Output
        const globalCode = globalStmts.join('\n\n');

        if (eventNode) {
            const eventLabel = eventNode.codeType || eventNode.label;
            if (eventLabel === 'On Command') {
                finalCode = `${globalCode}\n\nmodule.exports = {
    name: '${eventName}',
    execute: async (${eventParams}) => {
        const client = ${eventParams.split(',')[0].trim()}.client;
        ${eventFunctionBody}
    }
};`;
            } else {
                // For other events or generic structure, just print everything?
                // Or TODO: Handle On Ready, etc.
                // For now, fallback to just printing the code if it's not On Command (or add support)
                finalCode = code;
            }
        } else {
            // No event node? Just return the code.
            finalCode = code;
        }

        console.log('[AST Compiler] Compilation successful.');
        return finalCode;
    }
}
