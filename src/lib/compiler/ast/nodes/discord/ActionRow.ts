import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ActionRowParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'expression') return null;

        const comp1 = context.resolveInput(node, 'comp1');
        const comp2 = context.resolveInput(node, 'comp2');
        const comp3 = context.resolveInput(node, 'comp3');

        const elements: AST.Expression[] = [];
        const isNullLiteral = (expr: AST.Expression) => expr.type === 'Literal' && expr.value === null;

        if (!isNullLiteral(comp1)) elements.push(comp1);
        if (!isNullLiteral(comp2)) elements.push(comp2);
        if (!isNullLiteral(comp3)) elements.push(comp3);

        return {
            type: 'ObjectExpression',
            properties: [
                {
                    key: { type: 'Identifier', name: 'type' },
                    value: { type: 'Literal', value: 1 }, // 1 = Action Row
                    kind: 'init'
                },
                {
                    key: { type: 'Identifier', name: 'components' },
                    value: { type: 'ArrayExpression', elements },
                    kind: 'init'
                }
            ],
            sourceNodeId: node.id
        };
    }
}
