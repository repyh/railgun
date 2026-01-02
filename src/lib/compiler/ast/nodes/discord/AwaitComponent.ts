import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class AwaitComponentParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'statement') return null;

        const messageExpr = context.resolveInput(node, 'message');
        const timeExpr = context.resolveInput(node, 'time');

        const successBranch = context.traverseBlock(node, 'exec_out');
        const timeoutBranch = context.traverseBlock(node, 'timeout');

        const interactionVar = 'interaction';

        const statement: AST.TryStatement = {
            type: 'TryStatement',
            block: {
                type: 'BlockStatement',
                body: [
                    {
                        type: 'VariableDeclaration',
                        kind: 'const',
                        declarations: [
                            {
                                id: { type: 'Identifier', name: interactionVar },
                                init: {
                                    type: 'AwaitExpression',
                                    argument: {
                                        type: 'CallExpression',
                                        callee: {
                                            type: 'MemberExpression',
                                            object: messageExpr,
                                            property: { type: 'Identifier', name: 'awaitMessageComponent' },
                                            computed: false,
                                            optional: true
                                        },
                                        arguments: [
                                            {
                                                type: 'ObjectExpression',
                                                properties: [
                                                    {
                                                        type: 'Property',
                                                        key: { type: 'Identifier', name: 'time' },
                                                        value: timeExpr,
                                                        kind: 'init',
                                                        computed: false,
                                                        shorthand: false
                                                    } as AST.Property
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    } as AST.VariableDeclaration,
                    ...(successBranch.body || [])
                ]
            },
            handler: {
                type: 'CatchClause',
                param: { type: 'Identifier', name: 'e' },
                body: {
                    type: 'BlockStatement',
                    body: (timeoutBranch.body || [])
                }
            }
        };

        return statement;
    }
}
