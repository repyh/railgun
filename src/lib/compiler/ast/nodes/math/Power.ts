import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class PowerParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Expression {
        const left = context.resolveInput(node, 'a');
        const right = context.resolveInput(node, 'b');

        return {
            type: 'BinaryExpression',
            operator: '**',
            left,
            right,
            sourceNodeId: node.id
        };
    }
}
