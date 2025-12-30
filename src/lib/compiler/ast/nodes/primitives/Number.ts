import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class NumberParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Expression {
        const val = context.getNodeValue(node, 'value');
        return { type: 'Literal', value: Number(val) };
    }
}
