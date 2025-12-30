import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ComparisonParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Expression {
        let left = context.resolveInput(node, 'inp1');
        if (left.type === 'Literal' && left.value === null) {
            left = context.resolveInput(node, 'a');
        }

        let right = context.resolveInput(node, 'inp2');
        if (right.type === 'Literal' && right.value === null) {
            right = context.resolveInput(node, 'b');
        }

        let opValue = context.getNodeValue(node, 'optim') || context.getNodeValue(node, 'operator') || 'Equal';

        const opMap: Record<string, string> = {
            'Equal': '==',
            'Not Equal': '!=',
            'Greater': '>',
            'Less': '<',
            'Greater Or Equal': '>=',
            'Less Or Equal': '<='
        };

        const op = opMap[opValue] || opValue;

        return {
            type: 'BinaryExpression',
            operator: op,
            left: left || { type: 'Literal', value: null },
            right: right || { type: 'Literal', value: null },
            sourceNodeId: node.id
        };
    }
}
