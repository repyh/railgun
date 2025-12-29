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
        id: 'declare-1',
        label: 'Declare Variable',
        category: 'Variable',
        inputs: {
            exec: { socket: { name: 'Exec' } },
            value: { socket: { name: 'Any' } }
        },
        outputs: { exec: { socket: { name: 'Exec' } } },
        data: { varName: 'myVar' },
        controls: { varName: { value: 'myVar' } }
    } as any,
    {
        id: 'val-100',
        label: 'Number',
        codeType: 'Number',
        inputs: {},
        outputs: { value: { socket: { name: 'Number' } } },
        data: { value: 100 },
        controls: { value: { value: 100 } }
    } as any,
    {
        id: 'set-1',
        label: 'Set Variable',
        category: 'Variable',
        inputs: {
            exec: { socket: { name: 'Exec' } },
            value: { socket: { name: 'Any' } }
        },
        outputs: { exec: { socket: { name: 'Exec' } } },
        data: { varName: 'myVar' },
        controls: { varName: { value: 'myVar' } }
    } as any,
    {
        id: 'val-200',
        label: 'Number',
        codeType: 'Number',
        inputs: {},
        outputs: { value: { socket: { name: 'Number' } } },
        data: { value: 200 },
        controls: { value: { value: 200 } }
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
        id: 'get-var-1',
        label: 'Declare Variable', // Using Declare as Getter (Value Source)
        category: 'Variable',
        inputs: {},
        outputs: { value: { socket: { name: 'Any' } } },
        data: { varName: 'myVar' },
        controls: { varName: { value: 'myVar' } }
    } as any
];

const connections = [
    // Event -> Declare
    { source: 'event-1', sourceOutput: 'exec', target: 'declare-1', targetInput: 'exec' },
    // 100 -> Declare.value
    { source: 'val-100', sourceOutput: 'value', target: 'declare-1', targetInput: 'value' },

    // Declare -> Set
    { source: 'declare-1', sourceOutput: 'exec', target: 'set-1', targetInput: 'exec' },
    // 200 -> Set.value
    { source: 'val-200', sourceOutput: 'value', target: 'set-1', targetInput: 'value' },

    // Set -> Log
    { source: 'set-1', sourceOutput: 'exec', target: 'log-1', targetInput: 'exec' },
    // GetVar -> Log.msg
    { source: 'get-var-1', sourceOutput: 'value', target: 'log-1', targetInput: 'msg' } // Note: GraphParser handles DeclareVariable as value specifically
];

console.log('--- AST Variables Test ---');
const parser = new GraphParser(nodes, connections);
const ast = parser.parse();
const printer = new CodePrinter();
const code = printer.print(ast);

console.log(code);

/* Expected output:
async function On_Ready(client) {
    let myVar = 100;
    myVar = 200;
    console.log(myVar);
}
*/
