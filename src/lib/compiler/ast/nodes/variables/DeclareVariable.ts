import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class DeclareVariableParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, expectedType?: 'statement' | 'expression'): AST.Statement | AST.Expression {
        const varName = context.getNodeValue(node, 'varName');

        // Mode Check: If treating as Expression (Value Source), return Identifier
        if (expectedType === 'expression') {
            return {
                type: 'Identifier',
                name: context.sanitizeName(varName),
                sourceNodeId: node.id
            };
        }

        // Default: Statement (Declaration)
        const initValue = context.resolveInput(node, 'value');

        return {
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: [{
                id: { type: 'Identifier', name: context.sanitizeName(varName) },
                init: initValue
            }],
            sourceNodeId: node.id
        } as AST.VariableDeclaration;
    }
}
