import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class LogicOpParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Expression {
        const left = context.resolveInput(node, 'inp1');
        const right = context.resolveInput(node, 'inp2');
        const op = context.getNodeValue(node, 'optim') || '&&';

        return {
            type: 'BinaryExpression',
            operator: op,
            left,
            right,
            sourceNodeId: node.id
        };
    }
}
