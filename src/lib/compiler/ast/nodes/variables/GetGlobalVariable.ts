import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class GetGlobalVariableParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        const varName = node.data?.varName || 'globalVar';

        const expression: AST.MemberExpression = {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'global' },
                property: { type: 'Identifier', name: 'storage' },
                computed: false
            },
            property: { type: 'Literal', value: varName },
            computed: true
        };

        if (mode === 'expression') return expression;

        return {
            type: 'ExpressionStatement',
            expression
        };
    }
}
