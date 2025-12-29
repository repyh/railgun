import { GraphParser } from './GraphParser';
import { LogicValidator } from './LogicValidator';
import { CodePrinter } from './CodePrinter';
import { BotNode } from '../../railgun-rete';

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
        // The AST currently produces raw functions like "async function On_Command(...)".

        const eventNode = this.nodes.find(n => n.category === 'Event' || n.codeType === 'On Command' || n.codeType === 'On Slash Command');
        if (eventNode) {
            const eventLabel = eventNode.codeType || eventNode.label;

            // Extract the body of the generated function (hacky but effective for now)
            // ideally we would generate the module.exports AST directly, but this bridges the gap
            const bodyMatch = code.match(/async function \w+\(([^)]*)\)\s*\{([\s\S]*)\}/);

            if (bodyMatch) {
                const params = bodyMatch[1]; // e.g. "message, args"
                const body = bodyMatch[2];   // function body

                if (eventLabel === 'On Command') {
                    const nameControl = eventNode.controls?.['name'] as any;
                    const cmdName = nameControl?.value || 'my-cmd';

                    code = `module.exports = {
    name: '${cmdName}',
    execute: async (${params}) => {
        const client = ${params.split(',')[0].trim()}.client;
${body}
    }
};`;
                }
                // TODO: Add other event types here similar to Compiler.ts
            }
        }

        console.log('[AST Compiler] Compilation successful.');
        return code;
    }
}
