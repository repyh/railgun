import { GraphParser } from './GraphParser';
import { CodePrinter } from './CodePrinter';

// Mock Nodes
const messageNode: any = {
    id: 'node-msg',
    label: 'On Message Create',
    codeType: 'On Message Create',
    category: 'Event',
    controls: {},
    data: {}
};

const getPropertyNode: any = {
    id: 'node-prop',
    label: 'Get Property',
    codeType: 'Get Property',
    category: 'Variable',
    controls: {
        property: { value: 'member.user.username' }
    },
    data: {}
};

const logNode: any = {
    id: 'node-log',
    label: 'Console Log',
    codeType: 'Console Log',
    category: 'Action',
    controls: {},
    data: {}
};

// Connections
const connections = [
    // Get Property -> object = On Message Create -> message
    { source: 'node-msg', sourceOutput: 'message', target: 'node-prop', targetInput: 'object' },
    // Console Log -> msg = Get Property -> value
    { source: 'node-prop', sourceOutput: 'value', target: 'node-log', targetInput: 'msg' },
    // Flow: Msg -> Log
    { source: 'node-msg', sourceOutput: 'exec', target: 'node-log', targetInput: 'exec' }
];

const nodes = [messageNode, getPropertyNode, logNode];
const parser = new GraphParser(nodes, connections);
const program = parser.parse();

const printer = new CodePrinter();
const code = printer.print(program);

console.log('--- Generated Code ---');
console.log(code);

if (code.includes('message.member.user.username')) {
    console.log('✅ TEST PASSED: Deep resolution works!');
} else {
    console.log('❌ TEST FAILED: Deep resolution missing.');
}
