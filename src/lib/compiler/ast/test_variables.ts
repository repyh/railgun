import { GraphParser } from './GraphParser';
import { CodePrinter } from './CodePrinter';
import { BotNode } from '../../railgun-rete';

// Mock Nodes
const nodes: BotNode[] = [
    {
        id: 'event-1', // On Ready
        label: 'On Ready',
        category: 'Event',
        inputs: {},
        outputs: { exec: { socket: { name: 'Exec' } } },
        controls: {}
    } as any,
    {
        id: 'decl-1', // Declare myVar = 10
        label: 'Declare Variable',
        category: 'Action',
        inputs: {
            exec: { socket: { name: 'Exec' } },
            value: { socket: { name: 'Any' } }
        },
        outputs: {
            exec_out: { socket: { name: 'Exec' } },
            variable: { socket: { name: 'Any' } }
        },
        controls: { varName: { value: 'myVar' }, value: { value: 10 } }
    } as any,
    {
        id: 'set-1', // Set myVar = 20
        label: 'Set Variable',
        category: 'Action',
        inputs: {
            exec: { socket: { name: 'Exec' } },
            value: { socket: { name: 'Any' } } // will use control 20
        },
        outputs: { exec_out: { socket: { name: 'Exec' } } },
        controls: { varName: { value: 'myVar' }, value: { value: 20 } }
    } as any,
    {
        id: 'log-1', // Log(myVar)
        label: 'Console Log',
        category: 'Action',
        inputs: {
            exec: { socket: { name: 'Exec' } },
            msg: { socket: { name: 'Any' } }
        },
        outputs: {},
        controls: {}
    } as any
];

const connections = [
    // Event -> Declare
    { source: 'event-1', sourceOutput: 'exec', target: 'decl-1', targetInput: 'exec' },

    // Declare -> Set
    { source: 'decl-1', sourceOutput: 'exec_out', target: 'set-1', targetInput: 'exec' },

    // Set -> Log
    { source: 'set-1', sourceOutput: 'exec_out', target: 'log-1', targetInput: 'exec' },

    // Declare (variable) -> Log (msg)
    // This tests if 'Declare Variable' as a value source returns the Identifier 'myVar'
    { source: 'decl-1', sourceOutput: 'variable', target: 'log-1', targetInput: 'msg' }
];

console.log('--- AST Variables Test ---');
const parser = new GraphParser(nodes, connections);
const ast = parser.parse();
const printer = new CodePrinter();
const code = printer.print(ast);

console.log(code);

/* Expected:
async function On_Ready(client) {
    let myVar = 10;
    myVar = 20;
    console.log(myVar);
}
*/
