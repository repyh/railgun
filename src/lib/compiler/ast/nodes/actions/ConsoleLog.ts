import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ConsoleLogParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Statement {
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
