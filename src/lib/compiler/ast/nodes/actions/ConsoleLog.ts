import type { BotNode } from '../../../../railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ConsoleLogParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Statement {
        const message = context.resolveInput(node, 'msg');
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'console' },
                    property: { type: 'Identifier', name: 'log' },
                    computed: false
                } as AST.MemberExpression,
                arguments: [message],
                sourceNodeId: node.id
            },
            sourceNodeId: node.id
        };
    }
}
