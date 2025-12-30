import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ArrayBuilderParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Expression {
        const elements: AST.Expression[] = [];
        for (let i = 1; i <= 5; i++) {
            const item = context.resolveInput(node, `item${i}`);
            elements.push(item);
        }

        return {
            type: 'ArrayExpression',
            elements,
            sourceNodeId: node.id
        };
    }
}
