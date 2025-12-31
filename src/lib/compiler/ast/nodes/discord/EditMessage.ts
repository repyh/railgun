import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class EditMessageParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'statement') return null;

        const messageExpr = context.resolveInput(node, 'message');
        const contentExpr = context.resolveInput(node, 'content');

        // await message.edit({ content: content })
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'AwaitExpression',
                argument: {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: messageExpr,
                        property: { type: 'Identifier', name: 'edit' },
                        computed: false,
                        optional: true
                    },
                    arguments: [
                        {
                            type: 'ObjectExpression',
                            properties: [
                                {
                                    type: 'Property',
                                    key: { type: 'Identifier', name: 'content' },
                                    value: contentExpr,
                                    kind: 'init',
                                    computed: false,
                                    shorthand: false
                                } as AST.Property
                            ]
                        }
                    ]
                }
            }
        };
    }
}
