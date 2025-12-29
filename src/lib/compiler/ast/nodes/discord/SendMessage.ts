import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class SendMessageParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        // Send Message is usually a statement (action)
        if (mode !== 'statement') return null;

        const target = context.resolveInput(node, 'target');
        const content = context.resolveInput(node, 'content');
        const embedsInput = context.resolveInput(node, 'embeds');
        const componentsInput = context.resolveInput(node, 'components');

        const isNullLiteral = (expr: AST.Expression) => expr.type === 'Literal' && expr.value === null;

        const optionsProps: AST.Property[] = [];

        if (!isNullLiteral(content)) {
            optionsProps.push({
                key: { type: 'Identifier', name: 'content' },
                value: content,
                kind: 'init'
            });
        }

        if (!isNullLiteral(embedsInput)) {
            optionsProps.push({
                key: { type: 'Identifier', name: 'embeds' },
                // If it's a single embed object, wrap in array. 
                // In Rete it might already be an array if connected to multiple but context.resolveInput returns one expression.
                value: { type: 'ArrayExpression', elements: [embedsInput] },
                kind: 'init'
            });
        }

        if (!isNullLiteral(componentsInput)) {
            optionsProps.push({
                key: { type: 'Identifier', name: 'components' },
                value: { type: 'ArrayExpression', elements: [componentsInput] },
                kind: 'init'
            });
        }

        const optionsExpr: AST.Expression = {
            type: 'ObjectExpression',
            properties: optionsProps
        };

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: target,
                    property: { type: 'Identifier', name: 'send' },
                    computed: false
                },
                arguments: [optionsProps.length > 0 ? optionsExpr : content]
            },
            sourceNodeId: node.id
        };
    }
}
