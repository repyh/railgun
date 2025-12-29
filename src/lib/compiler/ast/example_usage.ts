import { GraphParser } from './GraphParser';
import { LogicValidator } from './LogicValidator';
import { CodePrinter } from './CodePrinter';
import { BotNode } from '../../railgun-rete';

/**
 * Example usage of the Full Compiler Pipeline.
 */

// 1. Mock Data
const mockNodes: BotNode[] = [
    {
        id: 'event-1',
        label: 'On Ready',
        category: 'Event',
        codeType: 'On Ready',
        data: {},
        inputs: {},
        outputs: {},
        controls: {},
    } as unknown as BotNode,
    {
        id: 'action-1',
        label: 'Send Message',
        category: 'Action',
        codeType: 'Send Message',
        data: {},
        inputs: {},
        outputs: {},
        controls: {
            content: { value: 'Hello World' }
        },
    } as unknown as BotNode
];

const mockConnections = [
    {
        id: 'conn-1',
        source: 'event-1',
        sourceOutput: 'exec',
        target: 'action-1',
        targetInput: 'exec'
    }
];

// 2. Instantiate Parser
console.log('--- Parsing ---');
const parser = new GraphParser(mockNodes, mockConnections);
const programAST = parser.parse();

// 3. Validate
console.log('--- Validating ---');
const validator = new LogicValidator();
const errors = validator.validate(programAST);

if (errors.length > 0) {
    console.error('Validation Errors:', errors);
} else {
    console.log('Validation Passed!');
}

// 4. Generate Code
console.log('--- Code Gen ---');
const printer = new CodePrinter();
const code = printer.print(programAST);
console.log(code);

/* Expected Output:
async function On_Ready(client) {
    Send_Message('Hello World');
}
*/
