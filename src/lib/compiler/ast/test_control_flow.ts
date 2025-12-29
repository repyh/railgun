
import { GraphParser } from './GraphParser';
import { CodePrinter } from './CodePrinter';
import { BotNode } from '../../railgun-rete';

// Mock Nodes
const nodes: BotNode[] = [
    {
        id: 'event-1',
        label: 'On Start',
        category: 'Event',
        inputs: {},
        outputs: { exec: { socket: { name: 'Exec' } } },
        controls: {}
    } as any,
    {
        id: 'loop-1',
        label: 'For Loop',
        category: 'Logic',
        inputs: {
            exec: { socket: { name: 'Exec' } },
            start: { socket: { name: 'Number' } },
            end: { socket: { name: 'Number' } }
        },
        outputs: {
            body: { socket: { name: 'Exec' } },
            completed: { socket: { name: 'Exec' } },
            index: { socket: { name: 'Number' } }
        },
        controls: {
            start: { value: 0 },
            end: { value: 5 }
        },
        data: { start: 0, end: 5 }
    } as any,
    {
        id: 'wait-1',
        label: 'Wait',
        category: 'Logic', // or Action
        inputs: {
            exec: { socket: { name: 'Exec' } },
            duration: { socket: { name: 'Number' } }
        },
        outputs: {
            completed: { socket: { name: 'Exec' } }
        },
        controls: {
            duration: { value: 1000 }
        },
        data: { duration: 1000 }
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
    } as any
];

const connections = [
    // Event -> Loop
    { source: 'event-1', sourceOutput: 'exec', target: 'loop-1', targetInput: 'exec' },

    // Loop Body -> Wait
    { source: 'loop-1', sourceOutput: 'body', target: 'wait-1', targetInput: 'exec' },

    // Wait -> Log
    { source: 'wait-1', sourceOutput: 'completed', target: 'log-1', targetInput: 'exec' },

    // Loop Index -> Log Msg
    { source: 'loop-1', sourceOutput: 'index', target: 'log-1', targetInput: 'msg' }
];

console.log('--- AST Control Flow Test ---');
const parser = new GraphParser(nodes, connections);
const ast = parser.parse();
const printer = new CodePrinter();
const code = printer.print(ast);

console.log(code);

/* Expected Output:
async function On_Start() {
    for (let index_loop-1 = 0; index_loop-1 < 5; index_loop-1++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(index_loop-1);
    }
}
*/
