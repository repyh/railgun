import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class DeclareVariableParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext, expectedType?: 'statement' | 'expression'): AST.Statement | AST.Expression {
        const varName = context.getNodeValue(node, 'varName') || context.getNodeValue(node, 'name') || 'variable';
        const safeName = context.sanitizeName(varName);

        // Mode Check: If treating as Expression (Value Source), return Identifier
        if (expectedType === 'expression') {
            return {
                type: 'Identifier',
                name: safeName,
                sourceNodeId: node.id
            };
        }

        // Default: Statement (Declaration)
        const initValue = context.resolveInput(node, 'value') ||
            context.resolveInput(node, 'initial') ||
            context.resolveInput(node, 'init') ||
            { type: 'Literal', value: null };

        return {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [{
                id: { type: 'Identifier', name: safeName },
                init: initValue
            }],
            sourceNodeId: node.id
        } as AST.VariableDeclaration;
    }
}
