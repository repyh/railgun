import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ShowModalParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'statement') return null;

        const target = context.resolveInput(node, 'target');
        const title = context.resolveInput(node, 'title');
        const customId = context.resolveInput(node, 'customId');

        // Modal Components (Action Rows with Text Inputs)
        const rows: AST.Expression[] = [];

        const createTextInputRow = (label: AST.Expression, id: AST.Expression): AST.Expression => {
            return {
                type: 'ObjectExpression',
                properties: [
                    {
                        key: { type: 'Identifier', name: 'type' },
                        value: { type: 'Literal', value: 1 }, // Action Row
                        kind: 'init'
                    },
                    {
                        key: { type: 'Identifier', name: 'components' },
                        value: {
                            type: 'ArrayExpression',
                            elements: [{
                                type: 'ObjectExpression',
                                properties: [
                                    { key: { type: 'Identifier', name: 'type' }, value: { type: 'Literal', value: 4 }, kind: 'init' }, // Text Input
                                    { key: { type: 'Identifier', name: 'custom_id' }, value: id, kind: 'init' },
                                    { key: { type: 'Identifier', name: 'label' }, value: label, kind: 'init' },
                                    { key: { type: 'Identifier', name: 'style' }, value: { type: 'Literal', value: 1 }, kind: 'init' } // Short style
                                ]
                            }]
                        },
                        kind: 'init'
                    }
                ]
            };
        };

        const isNullLiteral = (expr: AST.Expression) => expr.type === 'Literal' && expr.value === null;

        const l1 = context.resolveInput(node, 'input1_label');
        const i1 = context.resolveInput(node, 'input1_id');
        if (!isNullLiteral(l1) && !isNullLiteral(i1)) {
            rows.push(createTextInputRow(l1, i1));
        }

        const l2 = context.resolveInput(node, 'input2_label');
        const i2 = context.resolveInput(node, 'input2_id');
        if (!isNullLiteral(l2) && !isNullLiteral(i2)) {
            rows.push(createTextInputRow(l2, i2));
        }

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: target,
                    property: { type: 'Identifier', name: 'showModal' },
                    computed: false
                },
                arguments: [{
                    type: 'ObjectExpression',
                    properties: [
                        { key: { type: 'Identifier', name: 'title' }, value: title, kind: 'init' },
                        { key: { type: 'Identifier', name: 'custom_id' }, value: customId, kind: 'init' },
                        { key: { type: 'Identifier', name: 'components' }, value: { type: 'ArrayExpression', elements: rows }, kind: 'init' }
                    ]
                }]
            },
            sourceNodeId: node.id
        };
    }
}
