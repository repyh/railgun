import type { NodeParser } from './NodeParser';
import { BotNode } from '../../../railgun-rete';
import { GraphParser } from '../GraphParser';
import * as AST from '../types';

export class LogicParser implements NodeParser {
    parse(node: BotNode, parser: GraphParser, context: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        // Comparison
        if ((node.codeType || node.label) === 'Comparison') {
            const left = parser.resolveInput(node, 'inp1');
            const right = parser.resolveInput(node, 'inp2');
            const op = parser.getNodeValue(node, 'optim') || '==';
            return {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                sourceNodeId: node.id
            } as AST.BinaryExpression;
        }

        // Logic Op (AND/OR)
        if ((node.codeType || node.label) === 'Logic Op') {
            const left = parser.resolveInput(node, 'inp1');
            const right = parser.resolveInput(node, 'inp2');
            const op = parser.getNodeValue(node, 'optim') || '&&';
            return {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                sourceNodeId: node.id
            } as AST.BinaryExpression;
        }

        // Not
        if ((node.codeType || node.label) === 'Not') {
            const arg = parser.resolveInput(node, 'inp');
            return {
                type: 'UnaryExpression',
                operator: '!',
                argument: arg,
                prefix: true,
                sourceNodeId: node.id
            } as AST.UnaryExpression;
        }

        // Control Flow: If & While (These are Statements, not Expressions, but NodeParser handles both)
        // Note: GraphParser currently handles If/While in processLogicNode calling processStatementNode.
        // We should move them here if we want full modularity.
        if (node.codeType === 'If' || node.codeType === 'While Loop') {
            // For now, let's keep structural nodes in GraphParser or move them to a ControlFlowParser?
            // The user asked for modularity. Let's move them.
            // But they require `traverseBlock` which is exposed.
            if (node.codeType === 'If') {
                const test = parser.resolveInput(node, 'condition');
                const consequent = parser.traverseBlock(node, 'true');
                const alternate = parser.traverseBlock(node, 'false');

                return {
                    type: 'IfStatement',
                    test: test,
                    consequent: consequent,
                    alternate: alternate.body.length > 0 ? alternate : null,
                    sourceNodeId: node.id
                } as AST.IfStatement;
            }

            if (node.codeType === 'While Loop') {
                const test = parser.resolveInput(node, 'condition');
                const body = parser.traverseBlock(node, 'loopBody');

                return {
                    type: 'WhileStatement',
                    test: test,
                    body: body,
                    sourceNodeId: node.id
                } as AST.WhileStatement;
            }
        }

        // Do-While Loop
        if (node.label === 'Do-While Loop') {
            const test = parser.resolveInput(node, 'condition');
            const body = parser.traverseBlock(node, 'loopBody');

            return {
                type: 'DoWhileStatement',
                test: test,
                body: body,
                sourceNodeId: node.id
            } as AST.DoWhileStatement;
        }

        // For Loop
        if (node.label === 'For Loop') {
            const indexName = `index_${node.id}`;
            const indexId: AST.Identifier = { type: 'Identifier', name: indexName };

            // If context is expression, we assume the requester wants the 'index' value
            if (context === 'expression') {
                return indexId;
            }

            // Statement context: Generate the loop
            const start = parser.resolveInput(node, 'start');
            const end = parser.resolveInput(node, 'end');

            // Init: let index = start
            const init: AST.VariableDeclaration = {
                type: 'VariableDeclaration',
                declarations: [{
                    type: 'VariableDeclarator',
                    id: indexId,
                    init: start
                }],
                kind: 'let'
            };

            // Test: index < end
            const test: AST.BinaryExpression = {
                type: 'BinaryExpression',
                operator: '<',
                left: indexId,
                right: end,
                sourceNodeId: node.id
            };

            // Update: index++ (Default)
            // TODO: Support 'updateFunc' input for custom increments
            const update: AST.UpdateExpression = {
                type: 'UpdateExpression',
                operator: '++',
                argument: indexId,
                prefix: false
            };

            const body = parser.traverseBlock(node, 'body');

            return {
                type: 'ForStatement',
                init: init,
                test: test,
                update: update,
                body: body,
                sourceNodeId: node.id
            } as AST.ForStatement;
        }

        return null;
    }
}
