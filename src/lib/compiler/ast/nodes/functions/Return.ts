import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ReturnParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'statement') return null;

        const value = context.resolveInput(node, 'value');

        // If no value connected, value is null
        const argument = (value && value.type === 'Literal' && value.value === null) ? null : value;

        return {
            type: 'ReturnStatement',
            argument: argument,
            sourceNodeId: node.id
        } as AST.ReturnStatement;
    }
}
