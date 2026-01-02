import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class DeleteMessageParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'statement') return null;

        const messageExpr = context.resolveInput(node, 'message');

        // await message.delete()
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'AwaitExpression',
                argument: {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: messageExpr,
                        property: { type: 'Identifier', name: 'delete' },
                        computed: false,
                        optional: true
                    },
                    arguments: []
                }
            }
        };
    }
}
