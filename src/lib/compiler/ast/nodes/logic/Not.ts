import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class NotParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Expression {
        const arg = context.resolveInput(node, 'inp');

        return {
            type: 'UnaryExpression',
            operator: '!',
            argument: arg,
            prefix: true,
            sourceNodeId: node.id
        };
    }
}
