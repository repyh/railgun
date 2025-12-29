import { GraphParser } from './GraphParser';
import { BotNode } from '../../railgun-rete';

/**
 * Example usage of the Graph Parser.
 * This file demonstrates how to simulate a graph and parse it into an AST.
 */

// 1. Mock Data (Simulating Rete Editor State)
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
        selected: false,
        translate: (x, y) => { },
        match: () => [],
        unmatch: () => [],
        addInput: () => { },
        addOutput: () => { },
        addControl: () => { },
        hasInput: () => false,
        hasOutput: () => true, // has 'exec'
        removeInput: () => { },
        removeOutput: () => { },
        removeControl: () => { }
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
        selected: false,
        translate: (x, y) => { },
        match: () => [],
        unmatch: () => [],
        addInput: () => { },
        addOutput: () => { },
        addControl: () => { },
        hasInput: () => true, // has 'exec' and 'content'
        hasOutput: () => true, // has 'exec'
        removeInput: () => { },
        removeOutput: () => { },
        removeControl: () => { }
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
const parser = new GraphParser(mockNodes, mockConnections);

// 3. Parse to AST
const programAST = parser.parse();

// 4. Output Results
console.log(JSON.stringify(programAST, null, 2));

/*
Expected Output:
{
  "type": "Program",
  "body": [
    {
      "type": "FunctionDeclaration",
      "id": { "type": "Identifier", "name": "On_Ready" },
      "params": [{ "type": "Identifier", "name": "client" }],
      "body": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ExpressionStatement",
            "expression": {
              "type": "CallExpression",
              "callee": { "type": "Identifier", "name": "Send_Message" },
              "arguments": []
            }
          }
        ]
      },
      "async": true,
      "isEvent": true
    }
  ]
}
*/
