import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class BooleanParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Expression {
        const val = context.getNodeValue(node, 'value');
        // Handle string "true"/"false" or boolean proper
        return { type: 'Literal', value: val === 'true' || val === true };
    }
}
