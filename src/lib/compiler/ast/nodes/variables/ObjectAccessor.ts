import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ObjectAccessorParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'expression') return null;

        const objectExpr = context.resolveInput(node, 'object');
        const propertyPath = context.getNodeValue(node, 'property') || '';

        if (!propertyPath) return objectExpr;

        // Split by dot for deep resolution
        const parts = propertyPath.split('.');
        let currentExpr = objectExpr;

        for (const part of parts) {
            if (!part.trim()) continue;

            const isComputed = part.includes('[') || (part.startsWith('"') || part.startsWith("'"));

            if (isComputed) {
                // If it's something like ["key"], handle it as computed
                // For simplicity, assume simple dot notation for "member.user"
                currentExpr = {
                    type: 'MemberExpression',
                    object: currentExpr,
                    property: { type: 'Literal', value: part.replace(/['"\[\]]/g, '') },
                    computed: true,
                    optional: true
                };
            } else {
                currentExpr = {
                    type: 'MemberExpression',
                    object: currentExpr,
                    property: { type: 'Identifier', name: part },
                    computed: false,
                    optional: true
                };
            }
        }

        return currentExpr;
    }
}
