import type { BotNode } from '../../../../railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class WaitParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.ExpressionStatement {
        const duration = context.resolveInput(node, 'duration');

        // Generate: await new Promise(resolve => setTimeout(resolve, duration))

        // 1. setTimeout(resolve, duration)
        const setTimeoutCall: AST.CallExpression = {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'setTimeout' },
            arguments: [
                { type: 'Identifier', name: 'resolve' }, // resolve provided by arrow func
                duration
            ]
        };

        // 2. resolve => setTimeout(...)
        const arrowFunc: AST.ArrowFunctionExpression = {
            type: 'ArrowFunctionExpression',
            async: false,
            params: [{ type: 'Identifier', name: 'resolve' }],
            body: setTimeoutCall // Implicit return or block? setTimeout returns ID, doesn't matter.
        };

        // 3. new Promise(...)
        const newPromise: AST.NewExpression = {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Promise' },
            arguments: [arrowFunc]
        };

        // 4. await ...
        const awaitExpr: AST.AwaitExpression = {
            type: 'AwaitExpression',
            argument: newPromise
        };

        return {
            type: 'ExpressionStatement',
            expression: awaitExpr,
            sourceNodeId: node.id
        };
    }
}
