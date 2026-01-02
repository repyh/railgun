import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class StringParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Expression {
        const val = context.getNodeValue(node, 'value');
        return { type: 'Literal', value: String(val) };
    }
}
