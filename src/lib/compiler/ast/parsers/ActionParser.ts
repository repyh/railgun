import type { NodeParser } from './NodeParser';
import { BotNode } from '../../../railgun-rete';
import { GraphParser } from '../GraphParser';
import * as AST from '../types';

export class ActionParser implements NodeParser {
    parse(node: BotNode, parser: GraphParser, context: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        // Actions are typically Statements.
        // If context is expression (e.g. chaining?), most actions don't return values yet.

        if (node.label === 'Wait') {
            const duration = parser.resolveInput(node, 'duration');

            // Generate: await new Promise(resolve => setTimeout(resolve, duration))
            // AST structure for this is complex, defaulting to a simplified CallExpression for now 
            // or a helper function call 'await wait(duration)' if runtime supports it.
            // Let's generate the full Promise wrapper to be safe/standard JS.

            const promiseConstructor: AST.NewExpression = {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Promise' },
                arguments: [{
                    type: 'ArrowFunctionExpression',
                    params: [{ type: 'Identifier', name: 'resolve' }],
                    body: {
                        type: 'CallExpression',
                        callee: { type: 'Identifier', name: 'setTimeout' },
                        arguments: [
                            { type: 'Identifier', name: 'resolve' },
                            duration
                        ]
                    },
                    async: false
                }]
            };

            const awaitExpr: AST.AwaitExpression = {
                type: 'AwaitExpression',
                argument: promiseConstructor,
                sourceNodeId: node.id
            };

            if (context === 'statement') {
                return {
                    type: 'ExpressionStatement',
                    expression: awaitExpr,
                    sourceNodeId: node.id
                } as AST.ExpressionStatement;
            } else {
                return awaitExpr;
            }
        }

        if (node.label === 'Console Log') {
            const message = parser.resolveInput(node, 'msg');
            const callExpr: AST.CallExpression = {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'console' },
                    property: { type: 'Identifier', name: 'log' },
                    computed: false
                } as AST.MemberExpression,
                arguments: [message],
                sourceNodeId: node.id
            };

            if (context === 'statement') {
                return {
                    type: 'ExpressionStatement',
                    expression: callExpr,
                    sourceNodeId: node.id
                } as AST.ExpressionStatement;
            } else {
                return callExpr;
            }
        }

        // Helper for Generic Actions (fallback)
        // Only if it's clearly an Action category
        if (node.category === 'Action' || node.category === 'Discord') {
            // Avoid double-handling nodes handled by other parsers (Variables are also Actions)
            if (['Declare Variable', 'Set Variable', 'Math Assignment', 'Increment'].includes(node.label)) {
                return null; // Handled by VariableParser
            }

            // Generic Function Call
            const args: AST.Expression[] = [];
            // TODO: Metadata-driven inputs

            const callExpr: AST.CallExpression = {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: parser.sanitizeName(node.label) // e.g. 'Send_Message'
                },
                arguments: args,
                sourceNodeId: node.id
            };

            if (context === 'statement') {
                return {
                    type: 'ExpressionStatement',
                    expression: callExpr,
                    sourceNodeId: node.id
                } as AST.ExpressionStatement;
            } else {
                return callExpr;
            }
        }

        return null;
    }
}
