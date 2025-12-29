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
        const code = printer.print(program);

        console.log('[AST Compiler] Compilation successful.');
        return code;
    }
}
