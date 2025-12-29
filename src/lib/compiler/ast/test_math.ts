import { GraphParser } from './GraphParser';
import { CodePrinter } from './CodePrinter';
import { BotNode } from '../../railgun-rete';

// Mock Nodes
const nodes: BotNode[] = [
    {
        id: 'event-1',
        label: 'On Ready',
        category: 'Event',
        inputs: {},
        outputs: { exec: { socket: { name: 'Exec' } } },
        controls: {}
    } as any,
    {
        id: 'log-1',
        label: 'Console Log',
        category: 'Action',
        inputs: {
            exec: { socket: { name: 'Exec' } },
            msg: { socket: { name: 'Any' } }
        },
        outputs: {},
        controls: {}
    } as any,
    {
        id: 'num-10',
        label: 'Number',
        codeType: 'Number',
        inputs: {},
        outputs: { value: { socket: { name: 'Number' } } },
        data: { value: 10 },
        controls: { value: { value: 10 } }
    } as any,
    {
        id: 'num-20',
        label: 'Number',
        codeType: 'Number',
        inputs: {},
        outputs: { value: { socket: { name: 'Number' } } },
        data: { value: 20 },
        controls: { value: { value: 20 } }
    } as any,
    {
        id: 'add-1',
        label: 'Add',
        codeType: 'Add',
        category: 'Math',
        inputs: {
            num1: { socket: { name: 'Number' } },
            num2: { socket: { name: 'Number' } }
        },
        outputs: { num: { socket: { name: 'Number' } } },
        controls: {}
    } as any
];

const connections = [
    // Event -> Log
    { source: 'event-1', sourceOutput: 'exec', target: 'log-1', targetInput: 'exec' },

    // 10 -> Add.num1
    { source: 'num-10', sourceOutput: 'value', target: 'add-1', targetInput: 'num1' },

    // 20 -> Add.num2
    { source: 'num-20', sourceOutput: 'value', target: 'add-1', targetInput: 'num2' },

    // Add.num -> Log.msg
    { source: 'add-1', sourceOutput: 'num', target: 'log-1', targetInput: 'msg' }
];

console.log('--- AST Math Test ---');
const parser = new GraphParser(nodes, connections);
const ast = parser.parse();
const printer = new CodePrinter();
const code = printer.print(ast);

console.log(code);

/* Expected:
async function On_Ready(client) {
    console.log((10 + 20)); // or similar
}
*/
